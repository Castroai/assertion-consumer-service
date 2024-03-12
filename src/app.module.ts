import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScimModule } from './scim/scim.module';
import { PrismaModule } from './prisma/prisma.module';
import { BearerStrategy } from './bearer.strategy';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './prisma/prisma.service';
import { OpenIdModule } from './openid/openid.module';
import { OpenIdController } from './openid/openid.controller';

@Module({
  imports: [
    ScimModule,
    PrismaModule,
    PrismaModule,
    PassportModule,
    OpenIdModule,
  ],
  controllers: [AppController, OpenIdController],
  providers: [AppService, BearerStrategy, PrismaService],
})
export class AppModule {}
