import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SearchMentorsDto } from './dto/search-mentors.dto';
import { Mentor, Company } from '@prisma/client';

@Injectable()
export class MentorsService {
  constructor(private prisma: PrismaService) { }

  async search(dto: SearchMentorsDto) {
    const where: any = {
      user: { isActive: true },
      isApproved: true,
    };

    if (dto.stacks?.length) {
      where.stacks = { hasSome: dto.stacks.map(s => s.toLowerCase()) };
    }

    if (dto.seniority) {
      where.seniority = dto.seniority;
    }

    if (dto.minHourlyRate != null || dto.maxHourlyRate != null) {
      where.hourlyRate = {
        ...(dto.minHourlyRate != null ? { gte: dto.minHourlyRate } : {}),
        ...(dto.maxHourlyRate != null ? { lte: dto.maxHourlyRate } : {}),
      };
    }

    if (dto.minAvailabilityHours != null) {
      where.availabilityHoursPerWeek = { gte: dto.minAvailabilityHours };
    }

    return this.prisma.mentor.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
      take: 50,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async matchForCompany(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const stacks = (company.requiredStacks || []).map(s => s.toLowerCase());

    const mentors = await this.prisma.mentor.findMany({
      where: {
        isApproved: true,
        ...(stacks.length ? { stacks: { hasSome: stacks } } : {}),
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      take: 100,
    });

    const scored = mentors.map(m => {
      const ms = (m.stacks || []).map(s => s.toLowerCase());
      const inter = stacks.filter(s => ms.includes(s));

      // 1. Compatibilidade de stacks (0 a 1)
      const stackScore = stacks.length ? inter.length / stacks.length : 0.5;

      // 2. Bônus de disponibilidade (0 ou 0.1)
      const availabilityBonus = (m.availabilityHoursPerWeek || 0) >= 10 ? 0.1 : 0;

      // 3. Reputação (rating normalizado × fator de confiança)
      const rating = Number(m.rating) || 0; // 0 a 5
      const reviews = m.totalReviews || 0;
      const confidenceFactor = Math.min(reviews / 10, 1); // até 10 reviews = confiança total
      const reputationScore = (rating / 5) * confidenceFactor; // 0 a 1

      // 4. Score final ponderado
      const finalScore =
        stackScore * 0.5 +
        availabilityBonus +
        reputationScore * 0.4;

      return {
        ...m,
        matchScore: Math.round(finalScore * 100),
      };
    });

    return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }

  async getTopMentors(limit = 10) {
    const mentors = await this.prisma.mentor.findMany({
      where: { isApproved: true },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      take: limit * 2, // pega mais para aplicar fator de confiança antes de cortar
    });

    const scored = mentors.map(m => {
      const rating = Number(m.rating) || 0; // 0 a 5
      const reviews = m.totalReviews || 0;
      const confidenceFactor = Math.min(reviews / 10, 1); // até 10 reviews = confiança total
      const reputationScore = (rating / 5) * confidenceFactor; // 0 a 1

      return {
        ...m,
        reputationScore,
        score: Math.round(reputationScore * 100),
      };
    });

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  async getHighlightedMentors(limit = 5) {
    // 1. Top por reputação
    const topByReputation = await this.prisma.mentor.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [
        { rating: 'desc' },
        { totalReviews: 'desc' },
      ],
      take: limit,
    });

    // 2. Mais ativos (baseado em totalMentorships)
    const mostActive = await this.prisma.mentor.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: [
        { totalMentorships: 'desc' },
        { updatedAt: 'desc' },
      ],
      take: limit,
    });

    // 3. Novos aprovados
    const newestApproved = await this.prisma.mentor.findMany({
      where: { isApproved: true },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return {
      topByReputation,
      mostActive,
      newestApproved,
    };
  }

  async getDiscoverMentors(limit = 12) {
    // Reaproveita os métodos já criados
    const topByReputation = await this.getTopMentors(limit);
    const mostActive = await this.prisma.mentor.findMany({
      where: { isApproved: true },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: [{ totalMentorships: 'desc' }, { updatedAt: 'desc' }],
      take: limit,
    });
    const newestApproved = await this.prisma.mentor.findMany({
      where: { isApproved: true },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Junta todos
    const combined = [...topByReputation, ...mostActive, ...newestApproved];

    // Remove duplicados pelo ID
    const unique = combined.filter(
      (mentor, index, self) =>
        index === self.findIndex(m => m.id === mentor.id)
    );

    // Embaralha (Fisher–Yates)
    for (let i = unique.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [unique[i], unique[j]] = [unique[j], unique[i]];
    }

    // Limita o retorno
    return unique.slice(0, limit);
  }

  async getSuggestionsForCompany(companyId: string, limit = 8) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    const stacks = (company.requiredStacks || []).map(s => s.toLowerCase());

    const mentors = await this.prisma.mentor.findMany({
      where: {
        isApproved: true,
        ...(stacks.length ? { stacks: { hasSome: stacks } } : {}),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
      },
      take: limit * 3, // pega mais para embaralhar depois
    });

    // Calcula score de compatibilidade + reputação
    const scored = mentors.map(m => {
      const ms = (m.stacks || []).map(s => s.toLowerCase());
      const inter = stacks.filter(s => ms.includes(s));
      const stackScore = stacks.length ? inter.length / stacks.length : 0.5;
      const availabilityBonus = (m.availabilityHoursPerWeek || 0) >= 10 ? 0.1 : 0;
      const rating = Number(m.rating) || 0;
      const reviews = m.totalReviews || 0;
      const confidenceFactor = Math.min(reviews / 10, 1);
      const reputationScore = (rating / 5) * confidenceFactor;

      const finalScore = stackScore * 0.5 + availabilityBonus + reputationScore * 0.4;

      return { ...m, matchScore: Math.round(finalScore * 100) };
    });

    // Ordena por score e embaralha top N
    const sorted = scored.sort((a, b) => b.matchScore - a.matchScore);
    for (let i = sorted.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    }

    return sorted.slice(0, limit);
  }
}
