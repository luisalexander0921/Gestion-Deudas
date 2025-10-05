import { IsString, IsEmail, IsOptional, IsNumber, MaxLength, MinLength } from 'class-validator';

export class CreateCreditorDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsString()
  @MinLength(5)
  @MaxLength(20)
  document: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(100)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  createdBy?: string;

  @IsOptional()
  @IsNumber()
  userId?: number;
}