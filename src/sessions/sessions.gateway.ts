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

   @SubscribeMessage('get-last-messages')
   getLastMessages(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         client.emit('set-last-messages', session.lastMessages);
      }
   }

   @SubscribeMessage('get-items')
   getItems(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.setItems();
      }
   }

   @SubscribeMessage('get-quick-bar-slot')
   getQuickBarSlot(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.getQuickBarSlot();
      }
   }

   @SubscribeMessage('set-quick-bar-slot')
   setQuickBarSlot(client: Socket, slot: number) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.setQuickBarSlot(slot);
      }
   }

   @SubscribeMessage('move-item')
   moveItem(
      client: Socket,
      { sourceSlot, destSlot }: { sourceSlot: number; destSlot: number }
   ) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.moveItem(sourceSlot, destSlot);
      }
   }

   @SubscribeMessage('throw-items')
   throwItems(client: Socket, item: any) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.throwItems(item);
      }
   }

   @SubscribeMessage('get-info')
   getInfo(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.getInfo();
      }
   }

   @SubscribeMessage('use-item')
   useItem(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.useItem();
      }
   }

   @SubscribeMessage('click-window')
   clickWindow(
      client: Socket,
      { slot, mouseButton }: { slot: number; mouseButton: number }
   ) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.clickWindow(slot, mouseButton);
      }
   }

   @SubscribeMessage('close-window')
   closeWindow(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.closeWindow();
      }
   }

   @SubscribeMessage('get-current-window')
   getCurrentWindow(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.setCurrentWindow();
      }
   }
}
