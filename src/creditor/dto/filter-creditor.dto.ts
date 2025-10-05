import { IsOptional, IsString } from 'class-validator';

export class FilterCreditorDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  document?: string;

  @IsOptional()
  @IsString()
  email?: string;
}