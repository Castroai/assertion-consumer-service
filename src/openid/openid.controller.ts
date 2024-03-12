import { Controller, Get, Next, Post, Req, Res } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import * as passportOIDC from 'passport-openidconnect';
import * as passport from 'passport';

import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

const OpenIDConnectStrategy = passportOIDC.Strategy;

@Controller('/openid')
export class OpenIdController {
  constructor(public readonly prisma: PrismaService) {}
  private getDomainFromEmail(email: string) {
    let domain: string;
    try {
      domain = email.split('@')[1];
    } catch (e) {
      return null;
    }

    return domain;
  }
  private async orgFromId(id) {
    const org = await this.prisma.org.findFirst({
      where: {
        id: parseInt(id),
      },
    });

    return org;
  }
  private createStrategy(org, prisma = this.prisma) {
    return new OpenIDConnectStrategy(
      {
        issuer: org.issuer,
        authorizationURL: org.authorization_endpoint,
        tokenURL: org.token_endpoint,
        userInfoURL: org.userinfo_endpoint,
        clientID: org.client_id,
        clientSecret: org.client_secret,
        scope: 'profile email',
        callbackURL: process.env.CALLBACK_URL + org.id,
      },
      async function verify(issuer, profile, cb) {
        let user = await prisma.user.findFirst({
          where: {
            orgId: org.id,
            externalId: profile.id,
          },
        });

        if (!user) {
          user = await prisma.user.findFirst({
            where: {
              orgId: org.id,
              email: profile.emails[0].value,
            },
          });
          if (user) {
            await prisma.user.update({
              where: { id: user.id },
              data: { externalId: profile.id },
            });
          }
        }

        if (!user) {
          user = await prisma.user.create({
            data: {
              org: { connect: { id: org.id } },
              externalId: profile.id,
              email: profile.emails[0].value,
              name: profile.displayName,
            },
          });
        }

        return cb(null, user);
      },
    );
  }
  @Post('/check')
  public async check(@Req() req: Request, @Res() res: Response) {
    const { username } = req.body;
    const domain = this.getDomainFromEmail(username);
    if (domain) {
      let org = await this.prisma.org.findFirst({
        where: {
          domain: domain,
        },
      });
      if (!org) {
        org = await this.prisma.org.findFirst({
          where: {
            User: {
              some: {
                email: username,
              },
            },
          },
        });
      }
      if (org && org.issuer) {
        return res.json({ org_id: org.id });
      }
    }

    res.json({ org_id: null });
  }

  @Get('/start/:id')
  public async start(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    console.log(`ID`);

    const org = await this.orgFromId(req.params.id);
    if (!org) {
      return res.sendStatus(404);
    }
    const strategy = this.createStrategy(org);
    if (!strategy) {
      return res.sendStatus(404);
    }
    passport.authenticate(strategy)(req, res, next);
  }

  @Get('/callback/:id')
  public async callback(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    const org = await this.orgFromId(req.params.id);
    if (!org) {
      return res.sendStatus(404);
    }

    const strategy = this.createStrategy(org);
    if (!strategy) {
      return res.sendStatus(404);
    }

    passport.authenticate(strategy, {
      successRedirect: 'http://localhost:3000/',
    })(req, res, next);
  }

  // @UseGuards(AuthGuard('jwt'))
  @Get('/me')
  public async me(
    @Req() req: Request,
    @Res() res: Response,
    // @Next() next: NextFunction,
  ) {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user: User = await this.prisma.user.findUnique({
      where: {
        id: req.user['id'],
      },
    });

    delete user.password;

    console.log('user', user);

    res.json({
      user,
    });
  }
}
