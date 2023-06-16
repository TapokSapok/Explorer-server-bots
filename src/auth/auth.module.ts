import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../prisma/prisma.service';
import { UsersRepository } from './../repositories/users.repository';
import { Module } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service';
import { BotsRepository } from 'src/repositories/bots.repository';
import { SessionsService } from 'src/sessions/sessions.service';
import { SessionsModule } from 'src/sessions/sessions.module';

@Module({
   providers: [
      AuthGateway,
      UsersRepository,
      PrismaService,
      JwtService,
      AuthService,
      BotsRepository,
      SessionsService,
   ],
   imports: [SessionsModule],
})
export class AuthModule {}
