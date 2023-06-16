import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { HolyWorldPremium } from 'src/sessions/servers/HolyWorldPremium';
import { BotsRepository } from 'src/repositories/bots.repository';
import { SessionsService } from './sessions.service';

@WebSocketGateway()
export class SessionsGateway {
   constructor(
      private botsRepository: BotsRepository,
      private sessionsService: SessionsService
   ) {}

   @SubscribeMessage('connect-to-server')
   async handleMessage(client: Socket, { botId }: { botId: number }) {
      const bot = await this.botsRepository.getBot({ where: { id: botId } });

      const botOptions = {
         username: bot.username,
         socketId: client.id,
         botId: botId,
         sessionsService: this.sessionsService,
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
   async chatMessage(client: Socket, data: { message: string }) {
      console.log(`message ${data.message}`);
      const bot = this.sessionsService.getBot(
         Number(client.handshake.headers.botid)
      );
      console.log('bot', bot);
   }
}
