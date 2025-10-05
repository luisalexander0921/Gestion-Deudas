import { Injectable, NestMiddleware, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';

interface AuthenticatedRequest extends Request {
  user?: any;
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private authService: AuthService) {}

  use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new HttpException('Falta el header de autorización', HttpStatus.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1]; // Bearer <token>

    if (!token) {
      throw new HttpException('Falta el token', HttpStatus.UNAUTHORIZED);
    }

    try {
      const decoded = this.authService.verifyToken(token);
      req.user = decoded;
      next();
    } catch (error) {
      throw new HttpException('Token inválido', HttpStatus.UNAUTHORIZED);
    }
  }
}