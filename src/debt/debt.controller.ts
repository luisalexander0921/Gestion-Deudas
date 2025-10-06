import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Patch,
  Param,
  ParseIntPipe,
  UsePipes,
  ValidationPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { FilterDebtDto } from './dto/filter-debt.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DebtEntity } from './debt.entity';
import { PaymentEntity } from './payment.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('debt')
@UseGuards(JwtAuthGuard)
export class DebtController {
  constructor(private debtService: DebtService) {}

  // Registra una nueva deuda en el sistema
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDebtDto: CreateDebtDto, @Request() req: any) {
    const debtWithUser = {
      ...createDebtDto,
      userId: req.user?.id
    };
    return this.debtService.create(debtWithUser);
  }

  // Trae todas las deudas que están activas en la base de datos
  @Get()
  getAll(@Request() req: any): Promise<DebtEntity[]> {
    const userId = req.user?.id;
    return this.debtService.getAll(userId);
  }

  // Busca una deuda específica por su ID
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
    return this.debtService.getOne(id, req.user?.id);
  }

  // Permite modificar los datos de una deuda existente
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDebtDto: UpdateDebtDto, @Request() req: any) {
    return this.debtService.update(id, updateDebtDto, req.user?.id);
  }

  // Elimina una deuda del sistema (no la borra físicamente)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.debtService.delete(id);
  }

  // Busca deudas aplicando filtros como nombre, estado o fechas
  @Post('filter')
  @UsePipes(new ValidationPipe({ transform: true }))
  getFilteredDebts(@Body() filterDebtDto: FilterDebtDto, @Request() req: any) {
    return this.debtService.getFilteredDebts(filterDebtDto, req.user?.id);
  }

  // Obtiene todas las deudas asociadas a un usuario en particular
  @Get('user/:userId')
  getDebtsByUser(@Param('userId', ParseIntPipe) userId: number): Promise<DebtEntity[]> {
    return this.debtService.getDebtsByUser(userId);
  }

  // Lista únicamente las deudas pendientes de pago de un usuario
  @Get('user/:userId/pending')
  getPendingDebtsByUser(@Param('userId', ParseIntPipe) userId: number): Promise<DebtEntity[]> {
    return this.debtService.getPendingDebtsByUser(userId);
  }

  // Muestra solo las deudas que ya fueron pagadas por un usuario
  @Get('user/:userId/paid')
  getPaidDebtsByUser(@Param('userId', ParseIntPipe) userId: number): Promise<DebtEntity[]> {
    return this.debtService.getPaidDebtsByUser(userId);
  }

  // Cambia el estado de una deuda a "pagada" de forma rápida
  @Patch(':id/mark-paid')
  markAsPaid(@Param('id', ParseIntPipe) id: number, @Request() req: any): Promise<DebtEntity> {
    return this.debtService.markAsPaid(id, req.user?.id);
  }

  // Crear un pago/abono para una deuda
  @Post(':id/payments')
  @UsePipes(new ValidationPipe({ transform: true }))
  createPayment(
    @Param('id', ParseIntPipe) debtId: number,
    @Body() createPaymentDto: CreatePaymentDto,
    @Request() req: any
  ): Promise<PaymentEntity> {
    const paymentWithUser = {
      ...createPaymentDto,
      userId: req.user?.id
    };
    return this.debtService.createPayment(debtId, paymentWithUser);
  }

  // Obtener historial de pagos de una deuda
  @Get(':id/payments')
  getPaymentsByDebt(@Param('id', ParseIntPipe) debtId: number): Promise<PaymentEntity[]> {
    return this.debtService.getPaymentsByDebt(debtId);
  }
}