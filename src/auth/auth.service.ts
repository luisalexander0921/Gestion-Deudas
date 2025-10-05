import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { User } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from '../common/enums';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<{ user: Partial<User>; token: string }> {
    try {
      // Verificar si el usuario ya existe
      const existingUser = await this.userRepository.findOne({
        where: { username: createUserDto.username },
      });

      if (existingUser) {
        throw new HttpException('El usuario ya existe', HttpStatus.CONFLICT);
      }

      // Crear nuevo usuario
      const user = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(user);

      // Generar token
      const token = this.generateToken({ id: savedUser.id, username: savedUser.username });

      // Retornar usuario sin contraseña
      const { password, ...userWithoutPassword } = savedUser;
      
      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error al crear el usuario', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async login(loginDto: LoginDto): Promise<{ user: Partial<User>; token: string }> {
    try {
      // Buscar usuario por nombre de usuario
      const user = await this.userRepository.findOne({
        where: { username: loginDto.username, status: UserStatus.ACTIVE },
      });

      if (!user) {
        throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
      }

      // Validar contraseña
      const isPasswordValid = await user.validatePassword(loginDto.password);
      if (!isPasswordValid) {
        throw new HttpException('Credenciales inválidas', HttpStatus.UNAUTHORIZED);
      }

      // Generar token
      const token = this.generateToken({ id: user.id, username: user.username });

      // Retornar usuario sin contraseña
      const { password, ...userWithoutPassword } = user;

      return {
        user: userWithoutPassword,
        token,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Error durante el inicio de sesión', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  generateToken(payload: any): string {
    const secret = this.configService.get<string>('JWT_SECRET') || 'default_secret';
    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }

  verifyToken(token: string): any {
    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'default_secret';
      return jwt.verify(token, secret);
    } catch (error) {
      throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
    }
  }
}