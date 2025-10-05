import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { DebtEntity } from '../debt/debt.entity';
import { RecordStatus } from '../common/enums';

@Entity({ name: 'creditors' })
export class CreditorEntity {
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 20 })
  document: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  address: string;

  @Column({ type: 'enum', enum: RecordStatus, default: RecordStatus.ACTIVE })
  recordStatus: RecordStatus;

  @Column({ nullable: true, length: 30 })
  createdBy: string;

  @Column({ nullable: true })
  userId: number;

  // Relación con User (quien registra el acreedor)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Relación con Debts (un acreedor puede tener muchas deudas)
  @OneToMany(() => DebtEntity, (debt) => debt.creditor)
  debts: DebtEntity[];
}