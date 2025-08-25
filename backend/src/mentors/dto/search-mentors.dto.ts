// src/mentors/dto/search-mentors.dto.ts
import { IsArray, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export enum Seniority {
  JUNIOR = 'JUNIOR',
  PLENO = 'PLENO',
  SENIOR = 'SENIOR',
  STAFF = 'STAFF',
}

export class SearchMentorsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stacks?: string[];

  @IsOptional()
  @IsEnum(Seniority)
  seniority?: Seniority;

  @IsOptional()
  @IsNumber()
  minHourlyRate?: number;

  @IsOptional()
  @IsNumber()
  maxHourlyRate?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(60)
  minAvailabilityHours?: number;
}
