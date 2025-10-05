import { IsString, IsEmail, IsOptional, IsNumber, IsDateString, MaxLength, MinLength, IsPositive, IsEnum } from 'class-validator';
import { DebtStatus } from '../../common/enums';

export class CreateDebtDto {
  @IsNumber()
  creditorId: number;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsOptional()
  @IsEnum(DebtStatus)
  status?: DebtStatus;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsNumber()
  userId?: number;
}