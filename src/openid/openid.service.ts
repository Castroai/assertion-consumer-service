import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Strategy } from 'passport-openidconnect';
import { CheckRequest, CheckResponse } from './openid.dto';

@Injectable()
export class OpenIdService {
  constructor(private readonly prisma: PrismaService) {}

  public readonly OpenIDConnectStrategy = Strategy;

  private getDomainFromEmail(email: string) {
    let domain: string;
    try {
      domain = email.split('@')[1];
    } catch (e) {
      return null;
    }

    return domain;
  }

  public async orgFromId(id: string) {
    try {
      const org = await this.prisma.org.findFirst({
        where: { id: id },
      });
      return org;
    } catch (error) {
      throw new Error(`Failed to fetch org: ${error.message}`);
    }
  }

  public createStrategy(org) {
    return new this.OpenIDConnectStrategy(
      {
        issuer: org.issuer,
        authorizationURL: org.authorization_endpoint,
        tokenURL: org.token_endpoint,
        userInfoURL: org.userinfo_endpoint,
        clientID: org.client_id,
        clientSecret: org.client_secret,
        scope: 'profile email',
        callbackURL: process.env.CALLBACK_URL_EXTERNAL + org.id,
      },

      async (issuer, profile, cb) => {
        try {
          let user = await this.prisma.user.findFirst({
            where: {
              orgId: org.id,
              externalId: profile.id,
            },
          });

          if (!user) {
            user = await this.prisma.user.findFirst({
              where: {
                orgId: org.id,
                email: profile.emails[0].value,
              },
            });
            if (user) {
              await this.prisma.user.update({
                where: { id: user.id },
                data: { externalId: profile.id },
              });
            }
          }

          if (!user) {
            user = await this.prisma.user.create({
              data: {
                org: { connect: { id: org.id } },
                externalId: profile.id,
                email: profile.emails[0].value,
                name: profile.displayName,
              },
            });
          }

          return cb(null, user);
        } catch (error) {
          return cb(error);
        }
      },
    );
  }
  public async check({ username }: CheckRequest): Promise<CheckResponse> {
    try {
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
          return { orgId: org.id };
        }
        return {
          orgId: null,
        };
      }
    } catch (error) {
      throw new Error(`Failed to check username: ${error.message}`);
    }
  }

  public async start() {}
}
