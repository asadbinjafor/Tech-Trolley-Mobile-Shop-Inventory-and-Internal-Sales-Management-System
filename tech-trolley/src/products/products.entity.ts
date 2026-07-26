import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('uuid')
  brandId: string;

  @Column('uuid')
  categoryId: string;

  @Column({
    type: 'enum',
    enum: ['SERIALIZED', 'QUANTITY'],
  })
  trackingType: string;

  @Column({ default: true })
  isActive: boolean;
}
