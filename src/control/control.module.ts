import { PrismaService } from 'src/prisma/prisma.service';
import { BotsRepository } from 'src/repositories/bots.repository';
import { Module } from '@nestjs/common';
import { ControlGateway } from './control.gateway';
import { ControlService } from './control.service';

@Module({
   providers: [ControlGateway, ControlService, BotsRepository, PrismaService],
})
export class ControlModule {}
