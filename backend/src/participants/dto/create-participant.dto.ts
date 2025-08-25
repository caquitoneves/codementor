import { IsString, IsUUID, IsOptional, IsInt, IsEmail, IsDateString } from 'class-validator';

export class CreateParticipantDto {
  @IsUUID()
  programId: string;

  @IsString()
  participantName: string;

  @IsEmail()
  participantEmail: string;

  @IsString()
  currentLevel: string;

  @IsString()
  @IsOptional()
  goals?: string;

  @IsInt()
  @IsOptional()
  progressPercentage?: number;

  @IsInt()
  @IsOptional()
  finalRating?: number;

  @IsDateString()
  @IsOptional()
  completionDate?: string;
}
