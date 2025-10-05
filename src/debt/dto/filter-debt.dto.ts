import { IsOptional, IsString, IsDateString } from 'class-validator';

export class FilterDebtDto {
  @IsOptional()
  @IsString()
  debtorName?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @IsOptional()
  @IsDateString()
  dueDateTo?: string;
}