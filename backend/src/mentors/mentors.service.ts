// src/mentors/mentors.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchMentorsDto } from './dto/search-mentors.dto';

@Injectable()
export class MentorsService {
  constructor(private prisma: PrismaService) { }

  async search(dto: SearchMentorsDto) {
    const where: any = { user: { isActive: true }, isApproved: true };
    if (dto.stacks?.length) {
      where.stacks = { hasSome: dto.stacks.map(s => s.toLowerCase()) };
    }
    if (dto.seniority) where.seniority = dto.seniority;
    if (dto.minHourlyRate != null || dto.maxHourlyRate != null) {
      where.hourlyRate = {};
      if (dto.minHourlyRate != null) where.hourlyRate.gte = dto.minHourlyRate;
      if (dto.maxHourlyRate != null) where.hourlyRate.lte = dto.maxHourlyRate;
    }
    if (dto.minAvailabilityHours != null) {
      where.availabilityHoursPerWeek = { gte: dto.minAvailabilityHours };
    }
    return this.prisma.mentor.findMany({
      where,
      include: { user: true },
      take: 50,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async matchForCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });
    if (!company) return [];
    const stacks = (company.requiredStacks || []).map((s: string) => s.toLowerCase());
    const mentors = await this.prisma.mentor.findMany({
      where: {
        isApproved: true,
        stacks: stacks.length ? { hasSome: stacks } : undefined,
      },
      include: { user: true },
      take: 100,
    });
    // simple score: % of stacks matched + availability bonus if >= 10h/semana
    const scored = mentors.map((m: any) => {
      const ms = (m.stacks || []).map((s: string) => s.toLowerCase());
      const inter = stacks.filter((s: string) => ms.includes(s));
      const stackScore = stacks.length ? inter.length / stacks.length : 0.5;
      const availabilityBonus = (m.availabilityHoursPerWeek || 0) >= 10 ? 0.1 : 0;
      const score = stackScore + availabilityBonus;
      return { ...m, matchScore: Math.round(score * 100) };
    });
    scored.sort((a: any, b: any) => b.matchScore - a.matchScore);
    return scored.slice(0, 10);
  }
}
