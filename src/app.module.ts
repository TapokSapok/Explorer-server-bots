import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RepositoriesModule } from './repositories/repositories.module';

import { SessionsModule } from './sessions/sessions.module';
import { SocketModule } from './socket/socket.module';

@Module({
   imports: [
      AuthModule,
      PrismaModule,
      RepositoriesModule,
      SessionsModule,
      SocketModule,
   ],
})
export class AppModule {}
