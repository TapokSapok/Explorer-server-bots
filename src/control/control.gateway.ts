import { BotsRepository } from 'src/repositories/bots.repository';
import { Socket } from 'socket.io';
import { SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { Bot } from 'mineflayer';
import { HolyWorld_Premium } from './servers/HolyWorld/HolyWorld_Premium';
import { ControlService } from './control.service';

@WebSocketGateway()
export class ControlGateway {
   constructor(
      private botsRepository: BotsRepository,
      private controlService: ControlService
   ) {}

   @SubscribeMessage('connect-to-server')
   async handleMessage(client: Socket, { botId }: { botId: number }) {
      const bot = await this.botsRepository.getBot({ where: { id: botId } });

      const botOptions = {
         username: bot.username,
         client,
         botId: botId,
         ControlService: this.controlService,
      };

      let newBot: HolyWorld_Premium;
      switch (bot.server) {
         case 'HolyWorld':
            bot.isPremium
               ? (newBot = new HolyWorld_Premium(botOptions))
               : (newBot = new HolyWorld_Premium(botOptions));
            break;
      }
      //
      this.controlService.addBot({ botId, newBot });
   }
}
