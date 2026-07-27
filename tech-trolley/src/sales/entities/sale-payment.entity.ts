import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class SalePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  saleId: string;

  // Financial account that received this payment (inflow target).
  @Column('uuid')
  accountId: string;

  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @Column()
  paymentMethod: string;

  @Column({ nullable: true })
  transactionId: string;

  @Column('date')
  date: string;

  @CreateDateColumn()
  createdAt: Date;
}
