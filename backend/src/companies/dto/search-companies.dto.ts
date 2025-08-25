// src/companies/dto/search-companies.dto.ts
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class SearchCompaniesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  stacks?: string[];

  @IsOptional()
  @IsInt()
  @Min(0)
  minLearners?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  maxLearners?: number;
}
