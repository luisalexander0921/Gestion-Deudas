import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/entities/user.entity';
import { DebtStatus, RecordStatus } from '../common/enums';

@Entity({ name: 'debts' })
export class DebtEntity {
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;

  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  debtorName: string;

  @Column({ length: 100, nullable: true })
  debtorEmail: string;

  @Column({ length: 20, nullable: true })
  debtorPhone: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

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
}