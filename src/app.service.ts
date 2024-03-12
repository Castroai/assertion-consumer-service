import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello() {
    try {
      const data = await this.prisma.test.findMany();
      return JSON.stringify(data);
    } catch (error) {
      throw error;
    }
  }
}
