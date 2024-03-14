import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationService {
  constructor(private readonly prisma: PrismaService) {}
  public async fetchOrgIdFromApiKey(apiKey: string): Promise<string> {
    const org = await this.prisma.org.findUniqueOrThrow({
      where: {
        apikey: apiKey,
      },
    });
    return org.id;
  }
}
