import { IsString, IsUUID, IsInt, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { SessionStatus } from '@prisma/client';

export class CreateSessionDto {
  @IsUUID()
  programId: string;

  @IsInt()
  sessionNumber: number;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  scheduledDate: string;

  @IsInt()
  durationMinutes: number;

  @IsString()
  sessionType: string;

  @IsString()
  @IsOptional()
  zoomLink?: string;

  @IsString()
  @IsOptional()
  materialsUrl?: string;

  @IsEnum(SessionStatus)
  @IsOptional()
  status?: SessionStatus = SessionStatus.SCHEDULED;
}
