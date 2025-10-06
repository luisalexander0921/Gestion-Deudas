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
} from '@nestjs/common';
import { DebtService } from './debt.service';
import { CreateDebtDto } from './dto/create-debt.dto';
import { UpdateDebtDto } from './dto/update-debt.dto';
import { FilterDebtDto } from './dto/filter-debt.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { DebtEntity } from './debt.entity';
import { PaymentEntity } from './payment.entity';

@Controller('debt')
export class DebtController {
  constructor(private debtService: DebtService) {}

  // Registra una nueva deuda en el sistema
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDebtDto: CreateDebtDto) {
    return this.debtService.create(createDebtDto);
  }

  // Trae todas las deudas que están activas en la base de datos
  @Get()
  getAll(): Promise<DebtEntity[]> {
    return this.debtService.getAll();
  }

  // Busca una deuda específica por su ID
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.debtService.getOne(id);
  }

  // Permite modificar los datos de una deuda existente
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDebtDto: UpdateDebtDto) {
    return this.debtService.update(id, updateDebtDto);
  }

  // Elimina una deuda del sistema (no la borra físicamente)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.debtService.delete(id);
  }

  // Busca deudas aplicando filtros como nombre, estado o fechas
  @Post('filter')
  @UsePipes(new ValidationPipe({ transform: true }))
  getFilteredDebts(@Body() filterDebtDto: FilterDebtDto) {
    return this.debtService.getFilteredDebts(filterDebtDto);
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
  markAsPaid(@Param('id', ParseIntPipe) id: number): Promise<DebtEntity> {
    return this.debtService.markAsPaid(id);
  }

  // Crear un pago/abono para una deuda
  @Post(':id/payments')
  @UsePipes(new ValidationPipe({ transform: true }))
  createPayment(
    @Param('id', ParseIntPipe) debtId: number,
    @Body() createPaymentDto: CreatePaymentDto
  ): Promise<PaymentEntity> {
    return this.debtService.createPayment(debtId, createPaymentDto);
  }

  // Obtener historial de pagos de una deuda
  @Get(':id/payments')
  getPaymentsByDebt(@Param('id', ParseIntPipe) debtId: number): Promise<PaymentEntity[]> {
    return this.debtService.getPaymentsByDebt(debtId);
  }
}