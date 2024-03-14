// user.service.ts

import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: { name: string; email: string }): Promise<User> {
    const user = await this.prisma.user.create({ data });
    return user;
  }

  async findAllUsers(): Promise<User[]> {
    const users = await this.prisma.user.findMany();
    return users;
  }

  async findUserById(id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async updateUser(
    id: string,
    data: { name?: string; email?: string },
  ): Promise<User> {
    await this.findUserById(id);
    return this.prisma.user.update({ where: { id }, data });
  }

  async deleteUser(id: string): Promise<void> {
    await this.findUserById(id);
    await this.prisma.user.delete({ where: { id } });
  }
}
