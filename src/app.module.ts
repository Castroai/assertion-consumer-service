import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScimModule } from './scim/scim.module';
import { PrismaModule } from './prisma/prisma.module';
import { BearerStrategy } from './bearer.strategy';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [ScimModule, PrismaModule, PrismaModule, PassportModule],
  controllers: [AppController],
  providers: [AppService, BearerStrategy, PrismaService],
})
export class AppModule {}
