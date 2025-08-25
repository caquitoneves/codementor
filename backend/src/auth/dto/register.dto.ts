// src/auth/dto/register.dto.ts
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  IsEnum, 
  IsOptional, 
  IsNumber, 
  Min 
} from 'class-validator';
import { UserType, CompanySize, Seniority } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  name: string;

  @IsEnum(UserType)
  userType: UserType;

  // Campos opcionais para mentores
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  yearsExperience?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  hourlyRate?: number;

  @IsOptional()
  @IsEnum(Seniority)
  seniority?: Seniority;

  // Campos opcionais para empresas
  @IsOptional()
  @IsString()
  companyName?: string;

  @IsOptional()
  @IsEnum(CompanySize)
  companySize?: CompanySize;
}
