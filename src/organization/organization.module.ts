import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';
import { OrganizationService } from './organization.service';
@Module({
  imports: [PrismaModule],
  controllers: [],
  providers: [PrismaService, OrganizationService],
})
export class OrganizationModule {}
