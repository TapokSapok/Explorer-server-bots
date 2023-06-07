import { ControlService } from './../control/control.service';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { Socket } from 'socket.io';
import { BotsRepository } from 'src/repositories/bots.repository';
import { UsersRepository } from 'src/repositories/users.repository';

@Injectable()
export class AuthService {
   constructor(
      private usersRepository: UsersRepository,
      private jwtService: JwtService,
      private botsRepository: BotsRepository,
      private controlService: ControlService
   ) {}

   async connectionGuard(client: Socket) {
      const botId = Number(client.handshake.headers.botid);

      if (!client.handshake.headers.botid) {
         client.disconnect();
         return;
      }

      const candidate = this.jwtService.decode(
         client.handshake.headers.authorization
      ) as User;

      if (!candidate) {
         client.disconnect(true);
         return;
      }

      const user = await this.usersRepository.getUser({
         where: { id: candidate.id },
      });

      if (!user) {
         client.disconnect(true);
         return;
      }

      const bot = await this.botsRepository.getBot({ where: { id: botId } });

      if (bot.userId !== user.id) {
         client.disconnect();
         return;
      }

      const currentTime = Date.now();
      const botEndTime = new Date(bot.endDate).getTime();
      if (botEndTime < currentTime) {
         client.disconnect();
         return;
      }

      console.log('Новый сокет');

      if (bot.status === 'online') {
         this.controlService.changeClient({
            botId: bot.id,
            client,
         });
      }

      client.handshake.query.userId = String(user.id);
      client.emit('successful-init');
   }
}
