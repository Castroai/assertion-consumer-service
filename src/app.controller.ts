import { Controller, Get, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';

@Controller('/')
export class AppController {
  constructor() {}

  @Get('/')
  public async check(@Req() req: Request, @Res() res: Response) {
    res.send('Good');
  }
}
