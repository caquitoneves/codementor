// src/programs/programs.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramStatus, UserType } from '@prisma/client';

interface FindAllFilters {
  companyId?: string;
  mentorId?: string;
  status?: ProgramStatus;
  skip?: number;
  take?: number;
}

@Injectable()
export class ProgramsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateProgramDto) {
    // Validação de datas
    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      throw new Error('A data de início deve ser anterior à data de término.');
    }

    return this.prisma.mentorshipProgram.create({
      data: {
        ...data,
        status: ProgramStatus.DRAFT, // sempre começa como rascunho
      },
    });
  }

  async findAll(filters: FindAllFilters) {
    const { companyId, mentorId, status, skip = 0, take = 10 } = filters;

    return this.prisma.mentorshipProgram.findMany({
      where: {
        ...(companyId && { companyId }),
        ...(mentorId && { mentorId }),
        ...(status && { status }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        company: true,
        mentor: true,
        _count: { select: { participants: true, sessions: true } }, // contagem de participantes e sessões
      },
    });
  }

  async findOne(id: string) {
    const program = await this.prisma.mentorshipProgram.findUnique({
      where: { id },
      include: {
        company: true,
        mentor: true,
        participants: true,
        sessions: true,
        reviews: true,
        payments: true,
        _count: { select: { participants: true, sessions: true } }, // contagem de participantes e sessões
      },
    });

    if (!program) throw new NotFoundException('Programa não encontrado');
    return program;
  }

  async update(id: string, data: UpdateProgramDto) {
    await this.findOne(id);

    // Validação de datas
    if (data.startDate && data.endDate && new Date(data.startDate) >= new Date(data.endDate)) {
      throw new Error('A data de início deve ser anterior à data de término.');
    }

    return this.prisma.mentorshipProgram.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.mentorshipProgram.delete({ where: { id } });
  }

  /**
   * Proteção de acesso — exemplo:
   * Apenas empresa dona ou mentor vinculado podem acessar
   */
  async checkAccess(userId: string, userType: UserType, programId: string) {
    const program = await this.findOne(programId);

    if (
      userType === UserType.COMPANY &&
      program.company.userId !== userId
    ) {
      throw new ForbiddenException('Você não tem acesso a este programa.');
    }

    if (
      userType === UserType.MENTOR &&
      program.mentor.userId !== userId
    ) {
      throw new ForbiddenException('Você não tem acesso a este programa.');
    }

    return true;
  }
}
