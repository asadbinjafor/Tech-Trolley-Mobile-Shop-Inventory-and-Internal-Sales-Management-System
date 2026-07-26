import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class InventoryUnit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  variantId: string;

  @Column({ nullable: true })
  imei: string; 

  @Column({ default: 1 })
  quantity: number; 

  @Column({
    type: 'enum',
    enum: ['IN_STOCK', 'SOLD', 'DAMAGED'],
    default: 'IN_STOCK',
  })
  status: string;

  @Column('uuid', { nullable: true })
  purchaseId: string;

  @Column('uuid', { nullable: true })
  saleId: string;
}
