// src/sessions/sessions.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateSessionDto } from './dto/update-session.dto';

@Injectable()
export class SessionsService {
  constructor(private prisma: PrismaService) {}

  create(data: CreateSessionDto) {
    return this.prisma.mentoringSession.create({ data });
  }

  findAll(programId?: string) {
    return this.prisma.mentoringSession.findMany({
      where: programId ? { programId } : {},
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async findOne(id: string) {
    const session = await this.prisma.mentoringSession.findUnique({ where: { id } });
    if (!session) throw new NotFoundException('Sessão não encontrada');
    return session;
  }

  async update(id: string, data: UpdateSessionDto) {
    const updated = await this.prisma.mentoringSession.update({
      where: { id },
      data,
    });

    // Atualiza progresso dos participantes quando a sessão é concluída
    if (data.status === 'COMPLETED') {
      const totalSessions = await this.prisma.mentoringSession.count({
        where: { programId: updated.programId },
      });

      await this.prisma.programParticipant.updateMany({
        where: { programId: updated.programId },
        data: {
          progressPercentage: {
            increment: Math.floor(100 / totalSessions),
          },
        },
      });
    }

    return updated;
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.mentoringSession.delete({ where: { id } });
  }
}
