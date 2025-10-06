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
import { CreditorEntity } from '../creditor/creditor.entity';
import { DebtStatus, RecordStatus } from '../common/enums';
import { PaymentEntity } from './payment.entity';

@Entity({ name: 'debts' })
export class DebtEntity {
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  creditorId: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  remainingAmount: number;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'enum', enum: DebtStatus, default: DebtStatus.PENDING })
  status: DebtStatus;

  @Column({ type: 'enum', enum: RecordStatus, default: RecordStatus.ACTIVE })
  recordStatus: RecordStatus;

  @Column({ nullable: true, length: 30 })
  createdBy: string;

  @Column({ nullable: true })
  userId: number;

  // Relación con User
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  // Relación con Creditor (acreedor)
  @ManyToOne(() => CreditorEntity, (creditor) => creditor.debts)
  @JoinColumn({ name: 'creditorId' })
  creditor: CreditorEntity;

  // Relación con Payments
  @OneToMany(() => PaymentEntity, (payment) => payment.debt)
  payments: PaymentEntity[];
}