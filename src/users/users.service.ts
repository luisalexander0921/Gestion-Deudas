import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });

      if (existingUser) {
        throw new HttpException('El usuario ya existe', HttpStatus.CONFLICT);
      }

      const user = this.userRepository.create(createUserDto);
      return this.userRepository.save(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al crear el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { status: 'ACTIVE' },
      select: ['id', 'username', 'email', 'fullName', 'status', 'createdAt', 'updatedAt'],
    });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, status: 'ACTIVE' },
      select: ['id', 'username', 'email', 'fullName', 'status', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepository.update(id, { status: 'INACTIVE' });
    
    if (result.affected === 0) {
      throw new HttpException('Usuario no encontrado', HttpStatus.NOT_FOUND);
    }
  }
}
