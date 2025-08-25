import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';

interface FindAllFilters {
  programId?: string;
  email?: string;
  skip?: number;
  take?: number;
}

@Injectable()
export class ParticipantsService {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateParticipantDto) {
    // Evita duplicar participante no mesmo programa
    const exists = await this.prisma.programParticipant.findFirst({
      where: {
        programId: data.programId,
        participantEmail: data.participantEmail,
      },
    });

    if (exists) {
      throw new BadRequestException('Este participante já está inscrito neste programa.');
    }

    return this.prisma.programParticipant.create({ data });
  }

  findAll(filters: FindAllFilters) {
    const { programId, email, skip = 0, take = 20 } = filters;

    return this.prisma.programParticipant.findMany({
      where: {
        ...(programId && { programId }),
        ...(email && { participantEmail: { contains: email, mode: 'insensitive' } }),
      },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        program: {
          select: { id: true, title: true, status: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const participant = await this.prisma.programParticipant.findUnique({
      where: { id },
      include: {
        program: {
          select: { id: true, title: true, status: true },
        },
      },
    });

    if (!participant) throw new NotFoundException('Participante não encontrado');
    return participant;
  }

  async update(id: string, data: UpdateParticipantDto) {
    await this.findOne(id);
    return this.prisma.programParticipant.update({ where: { id }, data });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.programParticipant.delete({ where: { id } });
  }

  /**
   * Atualiza progresso de um participante específico
   */
  async updateProgress(id: string, increment: number) {
    await this.findOne(id);
    return this.prisma.programParticipant.update({
      where: { id },
      data: {
        progressPercentage: { increment },
      },
    });
  }
}
