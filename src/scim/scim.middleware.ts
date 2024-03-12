import { NestMiddleware, Injectable } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';

@Injectable()
export class ScimMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    if (
      req.headers['content-type'] === 'application/scim+json; charset=utf-8'
    ) {
      bodyParser.json({ type: 'application/scim+json' })(req, res, next);
    } else {
      next();
    }
  }
}
