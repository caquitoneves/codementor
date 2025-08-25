// src/companies/companies.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchCompaniesDto } from './dto/search-companies.dto';

@Injectable()
export class CompaniesService {
  constructor(private prisma: PrismaService) {}

  async search(dto: SearchCompaniesDto) {
    const where: any = {};
    if (dto.stacks?.length) {
      where.requiredStacks = { hasSome: dto.stacks.map(s => s.toLowerCase()) };
    }
    if (dto.minLearners != null || dto.maxLearners != null) {
      where.plannedLearners = {};
      if (dto.minLearners != null) where.plannedLearners.gte = dto.minLearners;
      if (dto.maxLearners != null) where.plannedLearners.lte = dto.maxLearners;
    }
    return this.prisma.company.findMany({
      where,
      take: 50,
      orderBy: { updatedAt: 'desc' },
    });
  }
}
