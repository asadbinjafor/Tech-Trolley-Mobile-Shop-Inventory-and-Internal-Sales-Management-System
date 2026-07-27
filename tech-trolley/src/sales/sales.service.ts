import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Sale } from './entities/sale.entity';
import { SaleItem } from './entities/sale-item.entity';
import { SalePayment } from './entities/sale-payment.entity';
import { CreateSaleDto } from './dtos/create-sale.dto';
import { AddSalePaymentDto } from './dtos/add-payment.dto';
import { InventoryService } from '../inventory/inventory.service';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale)
    private salesRepository: Repository<Sale>,
    @InjectRepository(SaleItem)
    private itemsRepository: Repository<SaleItem>,
    @InjectRepository(SalePayment)
    private paymentsRepository: Repository<SalePayment>,
    private inventoryService: InventoryService,
    private accountsService: AccountsService,
    private dataSource: DataSource,
  ) {}

  async create(
    createSaleDto: CreateSaleDto,
    salespersonId: string,
  ): Promise<Sale> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let subTotal = 0;
      for (const item of createSaleDto.items) {
        subTotal += item.quantity * item.unitPrice;
      }

      const total = subTotal - createSaleDto.discount + createSaleDto.vat;

      const sale = queryRunner.manager.create(Sale, {
        invoiceNumber: createSaleDto.invoiceNumber,
        customerId: createSaleDto.customerId,
        salespersonId,
        date: createSaleDto.date,
        subTotal,
        discount: createSaleDto.discount,
        vat: createSaleDto.vat,
        total,
        status: 'COMPLETED',
      });

      const savedSale = await queryRunner.manager.save(sale);

      for (const item of createSaleDto.items) {
        const saleItem = queryRunner.manager.create(SaleItem, {
          saleId: savedSale.id,
          ...item,
        });
        await queryRunner.manager.save(saleItem);
      }

      await this.inventoryService.issueStock(savedSale.id, createSaleDto.items);

      await queryRunner.commitTransaction();
      return savedSale;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Sale[]> {
    return this.salesRepository.find();
  }

  async findOne(
    id: string,
  ): Promise<{ sale: Sale; items: SaleItem[]; payments: SalePayment[] }> {
    const sale = await this.salesRepository.findOne({ where: { id } });
    if (!sale) throw new NotFoundException('Sale not found');

    const items = await this.itemsRepository.find({ where: { saleId: id } });
    const payments = await this.paymentsRepository.find({
      where: { saleId: id },
    });

    return { sale, items, payments };
  }

  /**
   * Record a customer payment against a sale AND credit the chosen financial
   * account (inflow) in a SINGLE database transaction.
   *
   * Both the payment row and the account balance update commit together; if
   * either fails (e.g. the account is missing or inactive) the whole operation
   * rolls back and no payment is stored and no balance is changed.
   *
   * Due calculation is unchanged: dues are still derived from the persisted
   * payment rows (see CustomersService.getDues).
   */
  async addPayment(
    id: string,
    paymentDto: AddSalePaymentDto,
  ): Promise<SalePayment> {
    // Validate the sale up front (clear 404 before opening a transaction).
    const { sale } = await this.findOne(id);
    if (sale.status !== 'COMPLETED') {
      throw new BadRequestException('Cannot add payment to returned sale');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Persist the payment (records which account was used).
      const payment = queryRunner.manager.create(SalePayment, {
        ...paymentDto,
        saleId: id,
      });
      const savedPayment = await queryRunner.manager.save(payment);

      // 2. Credit the financial account (money IN) in the SAME transaction.
      //    A missing / inactive account throws here and rolls everything back.
      await this.accountsService.recordInflow(
        queryRunner.manager,
        paymentDto.accountId,
        paymentDto.amount,
      );

      await queryRunner.commitTransaction();
      return savedPayment;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }
}
