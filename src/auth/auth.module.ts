import { JwtService } from '@nestjs/jwt';
import { PrismaService } from './../prisma/prisma.service';
import { UsersRepository } from './../repositories/users.repository';
import { Module } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service';
import { BotsRepository } from 'src/repositories/bots.repository';
import { ControlService } from 'src/control/control.service';

@Module({
   providers: [
      AuthGateway,
      UsersRepository,
      PrismaService,
      JwtService,
      AuthService,
      BotsRepository,
      ControlService,
   ],
})
export class AuthModule {}
