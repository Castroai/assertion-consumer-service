// session.serializer.ts

import { PassportSerializer } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from './prisma/prisma.service';

interface IUser {
  id: number;
}

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(public prisma: PrismaService) {
    super();
  }
  serializeUser(user: IUser, done: (err: Error, user: any) => void): any {
    console.log(`serializeUser`, user);
    done(null, user.id); // Serialize user
  }

  async deserializeUser(id: string, done: (err: Error, payload: User) => void) {
    const user: User = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    console.log(`deserializeUser`, user);

    done(null, user);
  }
}
