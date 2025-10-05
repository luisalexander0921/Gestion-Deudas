import { Controller, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Crea una cuenta nueva para un usuario en el sistema
  @Post('register')
  async register(@Body() createUserDto: CreateUserDto, @Req() req: Request) {
    // Agregar dirección IP de la solicitud
    createUserDto.ipAddress = req.ip || req.connection.remoteAddress;
    
    return this.authService.register(createUserDto);
  }

  // Permite que un usuario inicie sesión con sus credenciales
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}