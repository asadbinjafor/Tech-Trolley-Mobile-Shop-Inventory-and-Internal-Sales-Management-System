import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity()
export class Purchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNumber: string; 

  @Column('uuid')
  supplierId: string;

  @Column('date')
  date: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  total: number;

  @Column({
    type: 'enum',
    enum: ['DRAFT', 'CONFIRMED', 'CANCELLED'],
    default: 'DRAFT',
  })
  status: string;

  @Column({ nullable: true })
  remarks: string;

  @CreateDateColumn()
  createdAt: Date;
}
