import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { DebtEntity } from './debt.entity';
import { User } from '../users/entities/user.entity';

@Entity({ name: 'payments' })
export class PaymentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ length: 255, nullable: true })
  description: string;

  @Column({ name: 'debtId' })
  debtId: number;

  @Column({ nullable: true })
  userId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  // Relación con Debt
  @ManyToOne(() => DebtEntity, (debt) => debt.payments)
  @JoinColumn({ name: 'debtId' })
  debt: DebtEntity;

  // Relación con User (quien hace el pago)
  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}