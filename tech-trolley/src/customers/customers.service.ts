import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Customer } from './entities/customers.entity';
import { CreateCustomerDto } from './dtos/create-customer.dto';
import { UpdateCustomerDto } from './dtos/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.customersRepository.findOne({ where: { phone: createCustomerDto.phone } });
    if (existing) throw new ConflictException('Phone number already exists');
    const customer = this.customersRepository.create(createCustomerDto);
    return this.customersRepository.save(customer);
  }

  async findAll(): Promise<Customer[]> {
    return this.customersRepository.find();
  }

  async findOne(id: string): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async update(id: string, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    if (updateCustomerDto.phone !== customer.phone) {
      const existing = await this.customersRepository.findOne({ where: { phone: updateCustomerDto.phone } });
      if (existing) throw new ConflictException('Phone number already exists');
    }
    Object.assign(customer, updateCustomerDto);
    return this.customersRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.remove(customer);
  }

  async getDues(id: string): Promise<{ due: number }> {
    await this.findOne(id);
    const result = await this.dataSource.query(
      `SELECT 
         COALESCE((SELECT SUM(total) FROM sale WHERE "customerId" = $1 AND status != 'RETURNED'), 0) as "totalSales",
         COALESCE((SELECT SUM(amount) FROM sale_payment sp JOIN sale s ON sp."saleId" = s.id WHERE s."customerId" = $1), 0) as "totalPaid"`,
      [id]
    );

    const due = Number(result[0].totalSales) - Number(result[0].totalPaid);
    return { due };
  }
}
