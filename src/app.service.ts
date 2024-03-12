import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { Test } from '@prisma/client';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  async getHello(): Promise<Test[]> {
    try {
      const data = await this.prisma.test.findMany();
      return data;
    } catch (error) {
      throw error;
    }
  }
}
