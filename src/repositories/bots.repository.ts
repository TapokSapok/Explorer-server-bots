import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class BotsRepository {
   constructor(private prisma: PrismaService) {}

   async getBot(filter: {
      where: {
         id?: number;
         userId?: number;
      };
   }) {
      return this.prisma.bot.findFirst(filter);
   }

   async getBots(filter: {
      where: {
         id?: number;
         userId?: number;
      };
   }) {
      return this.prisma.bot.findMany(filter);
   }

   async changeBot(filter: {
      where: {
         id?: number;
      };
      data: {
         status?: string;
         username?: string;
         isPremium?: boolean;
         server?: string;
      };
   }) {
      return await this.prisma.bot.update(filter);
   }
}
