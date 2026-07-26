import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  productId: string;

  @Column()
  color: string;

  @Column()
  ram: string;

  @Column()
  storage: string;

  @Column('decimal', { precision: 10, scale: 2 })
  purchasePrice: number;

  @Column('decimal', { precision: 10, scale: 2 })
  sellingPrice: number;
}
