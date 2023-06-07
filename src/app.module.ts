import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { ControlModule } from './control/control.module';

@Module({
  imports: [AuthModule, PrismaModule, RepositoriesModule, ControlModule],
})
export class AppModule {}
