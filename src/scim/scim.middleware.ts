import { NestMiddleware, Injectable } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as bodyParser from 'body-parser';
import { OrganizationService } from 'src/organization/organization.service';

@Injectable()
export class ScimMiddleware implements NestMiddleware {
  constructor(private readonly orgService: OrganizationService) {}
  async use(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extracting the token from the Authorization header
      const token = authHeader.substring(7); // Removing 'Bearer ' prefix
      // Attaching the token to the request object for later use
      const orgId = await this.orgService.fetchOrgIdFromApiKey(token);
      req['orgId'] = orgId;
    }
    if (
      req.headers['content-type'] === 'application/scim+json; charset=utf-8'
    ) {
      bodyParser.json({ type: 'application/scim+json' })(req, res, next);
    } else {
      next();
    }
  }
}
