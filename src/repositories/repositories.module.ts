import { PrismaService } from './../prisma/prisma.service';
import { Module } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Module({
  providers: [UsersRepository, PrismaClient, PrismaService],
})
export class RepositoriesModule {}
