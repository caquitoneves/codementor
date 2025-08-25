import { IsString, IsUUID, IsInt, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { ProgramStatus } from '@prisma/client';

export class CreateProgramDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  mentorId: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  skillFocus: string;

  @IsInt()
  durationWeeks: number;

  @IsInt()
  totalHours: number;

  @IsInt()
  @IsOptional()
  maxParticipants?: number;

  @IsNumber()
  priceTotal: number;

  @IsEnum(ProgramStatus)
  @IsOptional()
  status?: ProgramStatus = ProgramStatus.DRAFT;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
