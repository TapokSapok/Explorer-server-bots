import {
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { HolyWorldPremium } from 'src/sessions/servers/HolyWorldPremium';
import { BotsRepository } from 'src/repositories/bots.repository';
import { SessionsService } from './sessions.service';

@WebSocketGateway()
export class SessionsGateway {
   @WebSocketServer()
   server: Server;

   constructor(
      private botsRepository: BotsRepository,
      private sessionsService: SessionsService
   ) {}

   emit(socketId: string, event: string, data?: any) {
      if (this.server) {
         const socket = this.server?.sockets.sockets.get(socketId);
         if (socket) {
            socket.emit(event, data);
         }
      }
   }

   @SubscribeMessage('connect-to-server')
   async handleMessage(client: Socket, { botId }: { botId: number }) {
      const bot = await this.botsRepository.getBot({ where: { id: botId } });

      const botOptions = {
         username: bot.username,
         socketId: client.id,
         botId: botId,
         sessionsService: this.sessionsService,
         sessionsGateway: this,
      };

      let newBot: HolyWorldPremium;
      switch (bot.server) {
         case 'HolyWorld':
            bot.isPremium
               ? (newBot = new HolyWorldPremium(botOptions))
               : (newBot = new HolyWorldPremium(botOptions));
            break;
      }

      this.sessionsService.createSession(botId, newBot);
   }

   @SubscribeMessage('chat-message')
   chatMessage(client: Socket, data: { message: string }) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      session?.bot?.chat(data.message);
   }

   @SubscribeMessage('logout')
   logout(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      session?.logout();
   }
}
