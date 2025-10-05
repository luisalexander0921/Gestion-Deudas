import { IsString, IsEmail, IsOptional, IsNumber, IsDateString, MaxLength, MinLength, IsPositive } from 'class-validator';

export class CreateDebtDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  debtorName: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  debtorEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  debtorPhone?: string;

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
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsNumber()
  userId?: number;
}