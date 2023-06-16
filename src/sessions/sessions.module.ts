import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { BotsRepository } from 'src/repositories/bots.repository';
import { SessionsService } from './sessions.service';
import { SessionsGateway } from './sessions.gateway';

@Module({
   providers: [
      SessionsService,
      PrismaService,
      BotsRepository,
      {
         provide: 'BOTS_SESSIONS',
         useValue: new Map(),
      },
      SessionsGateway,
   ],
   exports: ['BOTS_SESSIONS'],
})
export class SessionsModule {}
