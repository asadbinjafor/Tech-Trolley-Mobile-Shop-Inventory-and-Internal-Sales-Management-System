import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class PurchasePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  purchaseId: string;

  // Financial account that funded this payment (outflow source).
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
