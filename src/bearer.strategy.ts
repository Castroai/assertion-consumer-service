import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BearerStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async validate(token: string, done: any): Promise<any> {
    // Here, you would validate the token with your logic, e.g., checking it against a database
    const org = await this.prisma.org.findFirst({
      where: {
        apikey: token,
      },
    });

    return done(null, org);
  }
}
