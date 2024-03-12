import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ScimService } from './scim.service';
import { ScimController } from './scim.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ScimMiddleware } from './scim.middleware';

@Module({
  imports: [PrismaModule],
  controllers: [ScimController],
  providers: [ScimService, PrismaService],
})
export class ScimModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ScimMiddleware).forRoutes('scim/v2');
  }
}
