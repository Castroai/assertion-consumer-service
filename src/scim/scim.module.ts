import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ScimService } from './scim.service';
import { ScimController } from './scim.controller';
import { PrismaService } from 'src/prisma/prisma.service';
import { ScimMiddleware } from './scim.middleware';
import { OrganizationService } from 'src/organization/organization.service';

@Module({
  controllers: [ScimController],
  providers: [ScimService, PrismaService, OrganizationService],
})
export class ScimModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ScimMiddleware).forRoutes('scim/v2');
  }
}
