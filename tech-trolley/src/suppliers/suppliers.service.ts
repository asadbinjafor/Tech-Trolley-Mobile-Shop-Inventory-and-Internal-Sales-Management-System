import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Supplier } from './suppliers.entity';
import { CreateSupplierDto } from './dtos/create-supplier.dto';
import { UpdateSupplierDto } from './dtos/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    @InjectRepository(Supplier)
    private suppliersRepository: Repository<Supplier>,
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async create(createSupplierDto: CreateSupplierDto): Promise<Supplier> {
    const supplier = this.suppliersRepository.create(createSupplierDto);
    return this.suppliersRepository.save(supplier);
  }

  async findAll(): Promise<Supplier[]> {
    return this.suppliersRepository.find();
  }

  async findOne(id: string): Promise<Supplier> {
    const supplier = await this.suppliersRepository.findOne({ where: { id } });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async update(
    id: string,
    updateSupplierDto: UpdateSupplierDto,
  ): Promise<Supplier> {
    const supplier = await this.findOne(id);
    Object.assign(supplier, updateSupplierDto);
    return this.suppliersRepository.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findOne(id);
    await this.suppliersRepository.remove(supplier);
  }

  async getDues(id: string): Promise<{ due: number }> {
    await this.findOne(id);
    const result = await this.dataSource.query(
      `SELECT 
         COALESCE((SELECT SUM(total) FROM purchase WHERE "supplierId" = $1 AND status = 'CONFIRMED'), 0) as "totalPurchases",
         COALESCE((SELECT SUM(amount) FROM purchase_payment pp JOIN purchase p ON pp."purchaseId" = p.id WHERE p."supplierId" = $1), 0) as "totalPaid"`,
      [id],
    );

    const due = Number(result[0].totalPurchases) - Number(result[0].totalPaid);
    return { due };
  }
}
