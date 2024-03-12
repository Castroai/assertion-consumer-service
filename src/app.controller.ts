import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Test } from '@prisma/client';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): Promise<Test[]> {
    return this.appService.getHello();
  }
  @Get('/health')
  health(): string {
    return 'All Good';
  }
}
