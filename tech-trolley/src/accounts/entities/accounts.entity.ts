import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string; 

  @Column({ nullable: true })
  accountNumber: string;

  @Column('decimal', { precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ default: true })
  isActive: boolean;
}
