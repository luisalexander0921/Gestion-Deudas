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
import { DebtEntity } from './debt.entity';

@Controller('debt')
export class DebtController {
  constructor(private debtService: DebtService) {}

  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createDebtDto: CreateDebtDto) {
    return this.debtService.create(createDebtDto);
  }

  @Get()
  getAll(): Promise<DebtEntity[]> {
    return this.debtService.getAll();
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.debtService.getOne(id);
  }

  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDebtDto: UpdateDebtDto) {
    return this.debtService.update(id, updateDebtDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.debtService.delete(id);
  }

  @Post('filter')
  @UsePipes(new ValidationPipe({ transform: true }))
  getFilteredDebts(@Body() filterDebtDto: FilterDebtDto) {
    return this.debtService.getFilteredDebts(filterDebtDto);
  }
}