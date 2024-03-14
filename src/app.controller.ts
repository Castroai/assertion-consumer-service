import { Controller, Get, Next, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { AppService } from './app.service';

@Controller('/')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  public async check(@Req() req: Request, @Res() res: Response) {
    const msg = this.appService.getHello();
    res.send(msg);
  }
  @Get('/signout')
  public async signOut(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.sendStatus(204);
    });
  }
}
