import { IsOptional, IsString, IsDateString, IsEnum } from 'class-validator';
import { DebtStatus } from '../../common/enums';

export class FilterDebtDto {
  @IsOptional()
  @IsString()
  debtorName?: string;

  @IsOptional()
  @IsEnum(DebtStatus)
  status?: DebtStatus;

  @IsOptional()
  @IsDateString()
  dueDateFrom?: string;

  @IsOptional()
  @IsDateString()
  dueDateTo?: string;
}