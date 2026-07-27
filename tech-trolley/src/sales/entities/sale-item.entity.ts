import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class SaleItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  saleId: string;

  @Column('uuid')
  variantId: string;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  unitPrice: number;

  @Column('jsonb', { nullable: true })
  imeis: string[]; 
}
