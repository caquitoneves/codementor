// src/mentors/mentors.controller.ts
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { SearchMentorsDto } from './dto/search-mentors.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('mentors')
export class MentorsController {
  constructor(private mentors: MentorsService) {}

  @Get('search')
  async search(@Query() query: SearchMentorsDto) {
    return this.mentors.search(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('match')
  async match(@Query('companyId') companyId: string) {
    return this.mentors.matchForCompany(companyId);
  }
}
