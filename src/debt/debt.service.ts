import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between } from 'typeorm';
import { DebtEntity } from './debt.entity';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { FilterDebtDto } from './dto/filter-debt.dto';
import { DebtStatus, RecordStatus } from '../common/enums';

@Injectable()
export class DebtService {
  constructor(
    @InjectRepository(DebtEntity)
    private debtRepository: Repository<DebtEntity>,
  ) {}

  async create(createDebtDto: CreateDebtDto): Promise<DebtEntity> {
    try {
      // Validar que el monto no sea negativo
      if (createDebtDto.amount <= 0) {
        throw new HttpException('El monto de la deuda debe ser mayor a cero', HttpStatus.BAD_REQUEST);
      }

      // Verificar si ya existe una deuda pendiente para este acreedor
      const existingDebt = await this.debtRepository.findOne({
        where: {
          creditorId: createDebtDto.creditorId,
          status: DebtStatus.PENDING,
          recordStatus: RecordStatus.ACTIVE,
        },
      });

      if (existingDebt) {
        throw new HttpException('Ya existe una deuda pendiente para este acreedor', HttpStatus.CONFLICT);
      }

      const debtData = {
        ...createDebtDto,
        status: createDebtDto.status || DebtStatus.PENDING,
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
        relations: ['user', 'creditor'],
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
        relations: ['user', 'creditor'],
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
      
      // Validar que no se pueda modificar una deuda pagada
      if (debt.status === DebtStatus.PAID) {
        throw new HttpException('No se puede modificar una deuda que ya está pagada', HttpStatus.BAD_REQUEST);
      }

      // Validar que el nuevo monto no sea negativo (si se está actualizando)
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

      debt.status = DebtStatus.PAID;
      return this.debtRepository.save(debt);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al marcar la deuda como pagada', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}