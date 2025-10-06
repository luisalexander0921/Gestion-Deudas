import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { DebtEntity } from './debt.entity';
import { PaymentEntity } from './payment.entity';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { FilterDebtDto } from './dto/filter-debt.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DebtStatus, RecordStatus } from '../common/enums';

@Injectable()
export class DebtService {
  constructor(
    @InjectRepository(DebtEntity)
    private debtRepository: Repository<DebtEntity>,
    @InjectRepository(PaymentEntity)
    private paymentRepository: Repository<PaymentEntity>,
  ) {}

  async create(createDebtDto: CreateDebtDto): Promise<DebtEntity> {
    try {
      if (createDebtDto.amount <= 0) {
        throw new HttpException('El monto de la deuda debe ser mayor a cero', HttpStatus.BAD_REQUEST);
      }

      const debtData = {
        ...createDebtDto,
        status: createDebtDto.status || DebtStatus.PENDING,
        paidAmount: 0,
        remainingAmount: createDebtDto.amount,
      };
      const debt = this.debtRepository.create(debtData);
      return this.debtRepository.save(debt);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al crear la deuda', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAll(): Promise<DebtEntity[]> {
    try {
      return this.debtRepository.find({
        where: { recordStatus: RecordStatus.ACTIVE },
        relations: ['user', 'creditor', 'payments'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException('Error al obtener las deudas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOne(id: number): Promise<DebtEntity> {
    try {
      const debt = await this.debtRepository.findOne({
        where: { id, recordStatus: RecordStatus.ACTIVE },
        relations: ['user', 'creditor', 'payments'],
      });

      if (!debt) {
        throw new HttpException('Deuda no encontrada', HttpStatus.NOT_FOUND);
      }

      return debt;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al obtener la deuda', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateDebtDto: UpdateDebtDto): Promise<DebtEntity> {
    try {
      const debt = await this.getOne(id);
      
      if (debt.status === DebtStatus.PAID) {
        throw new HttpException('No se puede modificar una deuda que ya está pagada', HttpStatus.BAD_REQUEST);
      }

      if (updateDebtDto.amount !== undefined && updateDebtDto.amount <= 0) {
        throw new HttpException('El monto de la deuda debe ser mayor a cero', HttpStatus.BAD_REQUEST);
      }

      Object.assign(debt, updateDebtDto);
      return this.debtRepository.save(debt);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al actualizar la deuda', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.debtRepository.update(
        { id },
        { recordStatus: RecordStatus.INACTIVE }
      );

      if (result.affected === 0) {
        throw new HttpException('Deuda no encontrada', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al eliminar la deuda', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFilteredDebts(filterDto: FilterDebtDto): Promise<DebtEntity[]> {
    try {
      const whereConditions: any = { recordStatus: RecordStatus.ACTIVE };

      if (filterDto.status) {
        whereConditions.status = filterDto.status;
      }

      if (filterDto.dueDateFrom && filterDto.dueDateTo) {
        whereConditions.dueDate = Between(
          new Date(filterDto.dueDateFrom),
          new Date(filterDto.dueDateTo)
        );
      } else if (filterDto.dueDateFrom) {
        whereConditions.dueDate = Between(
          new Date(filterDto.dueDateFrom),
          new Date('2099-12-31')
        );
      } else if (filterDto.dueDateTo) {
        whereConditions.dueDate = Between(
          new Date('1900-01-01'),
          new Date(filterDto.dueDateTo)
        );
      }

      return this.debtRepository.find({
        where: whereConditions,
        relations: ['user', 'creditor'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException('Error al filtrar las deudas', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getDebtsByUser(userId: number): Promise<DebtEntity[]> {
    try {
      return this.debtRepository.find({
        where: { userId, recordStatus: RecordStatus.ACTIVE },
        relations: ['user', 'creditor'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException('Error al obtener las deudas del usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPendingDebtsByUser(userId: number): Promise<DebtEntity[]> {
    try {
      return this.debtRepository.find({
        where: { 
          userId, 
          status: DebtStatus.PENDING, 
          recordStatus: RecordStatus.ACTIVE 
        },
        relations: ['user', 'creditor'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException('Error al obtener las deudas pendientes del usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPaidDebtsByUser(userId: number): Promise<DebtEntity[]> {
    try {
      return this.debtRepository.find({
        where: { 
          userId, 
          status: DebtStatus.PAID, 
          recordStatus: RecordStatus.ACTIVE 
        },
        relations: ['user', 'creditor'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException('Error al obtener las deudas pagadas del usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async markAsPaid(id: number): Promise<DebtEntity> {
    try {
      const debt = await this.getOne(id);
      
      if (debt.status === DebtStatus.PAID) {
        throw new HttpException('La deuda ya está marcada como pagada', HttpStatus.BAD_REQUEST);
      }

      const remainingAmount = debt.remainingAmount ?? debt.amount;
      await this.createPayment(id, {
        amount: remainingAmount,
        description: 'Pago total de la deuda',
        userId: debt.userId,
      });

      return this.getOne(id);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al marcar la deuda como pagada', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async createPayment(debtId: number, createPaymentDto: CreatePaymentDto): Promise<PaymentEntity> {
    try {
      const debt = await this.getOne(debtId);
      
      if (debt.status === DebtStatus.PAID) {
        throw new HttpException('No se pueden hacer pagos a una deuda ya pagada', HttpStatus.BAD_REQUEST);
      }

      const remainingAmount = debt.remainingAmount ?? debt.amount;
      
      if (createPaymentDto.amount > remainingAmount) {
        throw new HttpException('El monto del pago no puede ser mayor al saldo pendiente', HttpStatus.BAD_REQUEST);
      }

      const result = await this.paymentRepository.query(
        'INSERT INTO payments (amount, description, "debtId", "userId", "createdAt") VALUES ($1, $2, $3, $4, NOW()) RETURNING *',
        [createPaymentDto.amount, createPaymentDto.description, debtId, createPaymentDto.userId]
      );
      
      const savedPayment = result[0];

      const currentPaidAmount = parseFloat(debt.paidAmount?.toString() || '0');
      const paymentAmount = parseFloat(createPaymentDto.amount.toString());
      const totalAmount = parseFloat(debt.amount.toString());
      
      const newPaidAmount = currentPaidAmount + paymentAmount;
      const newRemainingAmount = totalAmount - newPaidAmount;
      
      // Actualizar deuda con consulta SQL directa
      const status = newRemainingAmount <= 0 ? 'PAID' : debt.status;
      const finalRemainingAmount = newRemainingAmount <= 0 ? 0 : newRemainingAmount;
      
      await this.debtRepository.query(
        'UPDATE debts SET "paidAmount" = $1, "remainingAmount" = $2, status = $3 WHERE id = $4',
        [newPaidAmount, finalRemainingAmount, status, debtId]
      );
      
      return savedPayment;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al crear el pago', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPaymentsByDebt(debtId: number): Promise<PaymentEntity[]> {
    try {
      return this.paymentRepository.find({
        where: { debtId },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException('Error al obtener los pagos de la deuda', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}