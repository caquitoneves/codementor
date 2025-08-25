import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { MentorsService } from './mentors.service';
import { SearchMentorsDto } from './dto/search-mentors.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('mentors')
export class MentorsController {
  constructor(private mentors: MentorsService) { }

  @Get('search')
  async search(@Query() query: SearchMentorsDto) {
    return this.mentors.search(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('match')
  async match(@Query('companyId') companyId: string) {
    return this.mentors.matchForCompany(companyId);
  }

  @Get('top')
  async top(@Query('limit') limit = 10) {
    return this.mentors.getTopMentors(Number(limit));
  }

  @Get('highlighted')
  async highlighted(@Query('limit') limit = 5) {
    return this.mentors.getHighlightedMentors(Number(limit));
  }

  @Get('discover')
  async discover(@Query('limit') limit = 12) {
    return this.mentors.getDiscoverMentors(Number(limit));
  }

  @Get('suggestions/:companyId')
  async suggestions(
    @Param('companyId') companyId: string,
    @Query('limit') limit = 8
  ) {
    return this.mentors.getSuggestionsForCompany(companyId, Number(limit));
  }
}
