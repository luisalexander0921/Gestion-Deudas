import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { CreditorEntity } from './creditor.entity';
import { CreateCreditorDto } from './dto/create-creditor.dto';
import { UpdateCreditorDto } from './dto/update-creditor.dto';
import { FilterCreditorDto } from './dto/filter-creditor.dto';
import { RecordStatus } from '../common/enums';

@Injectable()
export class CreditorService {
  constructor(
    @InjectRepository(CreditorEntity)
    private creditorRepository: Repository<CreditorEntity>,
  ) {}

  async create(createCreditorDto: CreateCreditorDto): Promise<CreditorEntity> {
    try {
      // Verificar si ya existe un acreedor con el mismo documento
      const existingCreditor = await this.creditorRepository.findOne({
        where: {
          document: createCreditorDto.document,
          recordStatus: RecordStatus.ACTIVE,
        },
      });

      if (existingCreditor) {
        throw new HttpException('Ya existe un acreedor con este documento', HttpStatus.CONFLICT);
      }

      const creditor = this.creditorRepository.create(createCreditorDto);
      return this.creditorRepository.save(creditor);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al crear el acreedor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAll(): Promise<CreditorEntity[]> {
    try {
      return this.creditorRepository.find({
        where: { recordStatus: RecordStatus.ACTIVE },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException('Error al obtener los acreedores', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getOne(id: number): Promise<CreditorEntity> {
    try {
      const creditor = await this.creditorRepository.findOne({
        where: { id, recordStatus: RecordStatus.ACTIVE },
        relations: ['user', 'debts'],
      });

      if (!creditor) {
        throw new HttpException('Acreedor no encontrado', HttpStatus.NOT_FOUND);
      }

      return creditor;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al obtener el acreedor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async update(id: number, updateCreditorDto: UpdateCreditorDto): Promise<CreditorEntity> {
    try {
      const creditor = await this.getOne(id);

      // Verificar documento duplicado si se está actualizando
      if (updateCreditorDto.document && updateCreditorDto.document !== creditor.document) {
        const existingCreditor = await this.creditorRepository.findOne({
          where: {
            document: updateCreditorDto.document,
            recordStatus: RecordStatus.ACTIVE,
          },
        });

        if (existingCreditor && existingCreditor.id !== id) {
          throw new HttpException('Ya existe un acreedor con este documento', HttpStatus.CONFLICT);
        }
      }

      Object.assign(creditor, updateCreditorDto);
      return this.creditorRepository.save(creditor);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al actualizar el acreedor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async delete(id: number): Promise<void> {
    try {
      const result = await this.creditorRepository.update(
        { id },
        { recordStatus: RecordStatus.INACTIVE }
      );

      if (result.affected === 0) {
        throw new HttpException('Acreedor no encontrado', HttpStatus.NOT_FOUND);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al eliminar el acreedor', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getFilteredCreditors(filterDto: FilterCreditorDto): Promise<CreditorEntity[]> {
    try {
      const whereConditions: any = { recordStatus: RecordStatus.ACTIVE };

      if (filterDto.name) {
        whereConditions.name = ILike(`%${filterDto.name}%`);
      }

      if (filterDto.document) {
        whereConditions.document = ILike(`%${filterDto.document}%`);
      }

      if (filterDto.email) {
        whereConditions.email = ILike(`%${filterDto.email}%`);
      }

      return this.creditorRepository.find({
        where: whereConditions,
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException('Error al filtrar los acreedores', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getCreditorsByUser(userId: number): Promise<CreditorEntity[]> {
    try {
      return this.creditorRepository.find({
        where: { userId, recordStatus: RecordStatus.ACTIVE },
        relations: ['user'],
        order: { createdAt: 'DESC' },
      });
    } catch (error) {
      throw new HttpException('Error al obtener los acreedores del usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}