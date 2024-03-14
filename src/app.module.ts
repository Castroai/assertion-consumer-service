import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScimModule } from './scim/scim.module';
import { BearerStrategy } from './bearer.strategy';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './prisma/prisma.service';
import { OpenIdController } from './openid/openid.controller';
import { SessionSerializer } from './session.serializer'; // You need to create this file
import { OpenIdService } from './openid/openid.service';
import { UserService } from './user/user.service';

@Module({
  imports: [
    ScimModule,
    PassportModule.register({ session: true }), // Enable session support,
  ],
  controllers: [AppController, OpenIdController],
  providers: [
    AppService,
    BearerStrategy,
    PrismaService,
    SessionSerializer,
    OpenIdService,
    UserService,
  ],
})
export class AppModule {}
