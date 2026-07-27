import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Supplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column()
  address: string;
}
