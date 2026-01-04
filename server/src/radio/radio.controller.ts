import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { RadioService } from './radio.service';

@Controller('radio')
export class RadioController {
  constructor(private readonly radioService: RadioService) {}

  @Post('create-show')
  async createShow(@Body('userId') userId: string) {
    return this.radioService.createDailyShow(userId);
  }

  @Get('shows/:userId')
  async getShows(@Param('userId') userId: string) {
    return this.radioService.getShows(userId);
  }
}
