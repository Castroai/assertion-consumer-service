import { Controller, Get, Next, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Controller('/')
export class AppController {
  constructor() {}

  @Get('/')
  public async check(@Req() req: Request, @Res() res: Response) {
    res.send('Good');
  }
  @Get('/signout')
  public async signOut(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    console.log(`signout method called now`);
    console.log(`req.isAuthenticated() /logout`, req.isAuthenticated());
    req.logout(function (err) {
      if (err) {
        console.log(`errr`, err);
        return next(err);
      }
      res.sendStatus(204);
    });
  }
}
