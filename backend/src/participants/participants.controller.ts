import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards
} from '@nestjs/common';
import { ParticipantsService } from './participants.service';
import { CreateParticipantDto } from './dto/create-participant.dto';
import { UpdateParticipantDto } from './dto/update-participant.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('participants')
export class ParticipantsController {
  constructor(private readonly participantsService: ParticipantsService) {}

  @Post()
  create(@Body() createParticipantDto: CreateParticipantDto) {
    return this.participantsService.create(createParticipantDto);
  }

  @Get()
  findAll(
    @Query('programId') programId?: string,
    @Query('email') email?: string,
    @Query('skip') skip?: number,
    @Query('take') take?: number
  ) {
    return this.participantsService.findAll({
      programId,
      email,
      skip: skip ? Number(skip) : undefined,
      take: take ? Number(take) : undefined
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.participantsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateParticipantDto: UpdateParticipantDto
  ) {
    return this.participantsService.update(id, updateParticipantDto);
  }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Query('increment') increment: number
  ) {
    return this.participantsService.updateProgress(id, Number(increment));
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.participantsService.remove(id);
  }
}
