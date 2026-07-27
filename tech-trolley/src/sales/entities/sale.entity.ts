import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Sale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNumber: string;

  @Column('uuid')
  customerId: string;

  @Column('uuid')
  salespersonId: string;

  @Column('date')
  date: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  subTotal: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  discount: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  vat: number;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['COMPLETED', 'RETURNED'],
    default: 'COMPLETED',
  })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
