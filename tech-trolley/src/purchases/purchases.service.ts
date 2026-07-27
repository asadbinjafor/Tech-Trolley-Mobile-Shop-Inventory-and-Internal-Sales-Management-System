import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Purchase } from './purchase.entity';
import { PurchaseItem } from './purchase-item.entity';
import { PurchasePayment } from './purchase-payment.entity';
import { CreatePurchaseDto } from './dtos/create-purchase.dto';
import { AddPurchasePaymentDto } from './dtos/add-payment.dto';
import { InventoryService } from '../inventory/inventory.service';
import { AccountsService } from '../accounts/accounts.service';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Purchase)
    private purchasesRepository: Repository<Purchase>,
    @InjectRepository(PurchaseItem)
    private itemsRepository: Repository<PurchaseItem>,
    @InjectRepository(PurchasePayment)
    private paymentsRepository: Repository<PurchasePayment>,
    private inventoryService: InventoryService,
    private accountsService: AccountsService,
    private dataSource: DataSource,
  ) {}

  async create(createPurchaseDto: CreatePurchaseDto): Promise<Purchase> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let total = 0;
      for (const item of createPurchaseDto.items) {
        total += item.quantity * item.unitPrice;
      }

      const purchase = queryRunner.manager.create(Purchase, {
        invoiceNumber: createPurchaseDto.invoiceNumber,
        supplierId: createPurchaseDto.supplierId,
        date: createPurchaseDto.date,
        remarks: createPurchaseDto.remarks,
        total,
        status: 'CONFIRMED',
      });

      const savedPurchase = await queryRunner.manager.save(purchase);

      for (const item of createPurchaseDto.items) {
        const purchaseItem = queryRunner.manager.create(PurchaseItem, {
          purchaseId: savedPurchase.id,
          ...item,
        });
        await queryRunner.manager.save(purchaseItem);
      }

      await this.inventoryService.receiveStock(
        savedPurchase.id,
        createPurchaseDto.items,
      );

      await queryRunner.commitTransaction();
      return savedPurchase;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(err.message);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(): Promise<Purchase[]> {
    return this.purchasesRepository.find();
  }

  async findOne(id: string): Promise<{ purchase: Purchase; items: PurchaseItem[]; payments: PurchasePayment[] }> {
    const purchase = await this.purchasesRepository.findOne({ where: { id } });
    if (!purchase) throw new NotFoundException('Purchase not found');

    const items = await this.itemsRepository.find({
      where: { purchaseId: id },
    });
    const payments = await this.paymentsRepository.find({
      where: { purchaseId: id },
    });

    return { purchase, items, payments };
  }

  /**
   * Record a payment to the supplier against a purchase AND debit the chosen
   * financial account (outflow) in a SINGLE database transaction.
   *
   * Both the payment row and the account balance update commit together; if
   * either fails (e.g. the account is missing or inactive) the whole operation
   * rolls back and no payment is stored and no balance is changed.
   *
   * Due calculation is unchanged: dues are still derived from the persisted
   * payment rows (see SuppliersService.getDues).
   */
  async addPayment(
    id: string,
    paymentDto: AddPurchasePaymentDto,
  ): Promise<PurchasePayment> {
    // Validate the purchase up front (clear 404 before opening a transaction).
    const { purchase } = await this.findOne(id);
    if (purchase.status !== 'CONFIRMED') {
      throw new BadRequestException(
        'Cannot add payment to unconfirmed purchase',
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Persist the payment (records which account was used).
      const payment = queryRunner.manager.create(PurchasePayment, {
        ...paymentDto,
        purchaseId: id,
      });
      const savedPayment = await queryRunner.manager.save(payment);

      // 2. Debit the financial account (money OUT) in the SAME transaction.
      //    A missing / inactive account throws here and rolls everything back.
      await this.accountsService.recordOutflow(
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
