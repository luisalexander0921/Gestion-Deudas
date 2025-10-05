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
import { CreditorService } from './creditor.service';
import { CreateCreditorDto } from './dto/create-creditor.dto';
import { UpdateCreditorDto } from './dto/update-creditor.dto';
import { FilterCreditorDto } from './dto/filter-creditor.dto';
import { CreditorEntity } from './creditor.entity';

@Controller('creditor')
export class CreditorController {
  constructor(private creditorService: CreditorService) {}

  // Registra un nuevo acreedor en el sistema
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  create(@Body() createCreditorDto: CreateCreditorDto) {
    return this.creditorService.create(createCreditorDto);
  }

  // Trae todos los acreedores activos en la base de datos
  @Get()
  getAll(): Promise<CreditorEntity[]> {
    return this.creditorService.getAll();
  }

  // Busca un acreedor específico por su ID
  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.creditorService.getOne(id);
  }

  // Permite modificar los datos de un acreedor existente
  @Patch(':id')
  @UsePipes(new ValidationPipe({ transform: true }))
  update(@Param('id', ParseIntPipe) id: number, @Body() updateCreditorDto: UpdateCreditorDto) {
    return this.creditorService.update(id, updateCreditorDto);
  }

  // Elimina un acreedor del sistema (no lo borra físicamente)
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.creditorService.delete(id);
  }

  // Busca acreedores aplicando filtros como nombre, documento o email
  @Post('filter')
  @UsePipes(new ValidationPipe({ transform: true }))
  getFilteredCreditors(@Body() filterCreditorDto: FilterCreditorDto) {
    return this.creditorService.getFilteredCreditors(filterCreditorDto);
  }

  // Obtiene todos los acreedores asociados a un usuario en particular
  @Get('user/:userId')
  getCreditorsByUser(@Param('userId', ParseIntPipe) userId: number): Promise<CreditorEntity[]> {
    return this.creditorService.getCreditorsByUser(userId);
  }
}