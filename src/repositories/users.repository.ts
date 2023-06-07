import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async allUsers() {
    return this.prisma.user.findMany();
  }

  async getUser(filter: {
    where: {
      id?: number;
      username?: string;
      email?: string;
    };
  }) {
    return this.prisma.user.findFirst(filter);
  }
}
