import {
   SubscribeMessage,
   WebSocketGateway,
   WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { HolyWorld } from 'src/sessions/servers/HolyWorld';
import { BotsRepository } from 'src/repositories/bots.repository';
import { SessionsService } from './sessions.service';
import { HttpException, HttpStatus } from '@nestjs/common';

@WebSocketGateway()
export class SessionsGateway {
   @WebSocketServer()
   server: Server;

   constructor(
      private botsRepository: BotsRepository,
      private sessionsService: SessionsService
   ) {}

   emit(socketsId: string[], event: string, data?: any) {
      if (this.server) {
         socketsId.map((socketId) => {
            const socket = this.server?.sockets.sockets.get(socketId);
            if (socket) {
               socket.emit(event, data);
            }
         });
      }
   }

   @SubscribeMessage('connect-to-server')
   async handleMessage(client: Socket, { botId }: { botId: number }) {
      if (typeof botId !== 'number') {
         throw new HttpException('Не правильный botId', HttpStatus.BAD_REQUEST);
      }

      const bot = await this.botsRepository.getBot({ where: { id: botId } });

      const botOptions = {
         username: bot.username,
         dbBot: bot,
         socketId: client.id,
         botId: botId,
         sessionsService: this.sessionsService,
         sessionsGateway: this,
      };

      let newBot: HolyWorld;
      switch (bot.server) {
         case 'HolyWorld':
            newBot = new HolyWorld(botOptions);
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

   @SubscribeMessage('get-inventory-items')
   getInventoryItems(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.setInventoryItems();
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
   @SubscribeMessage('enable-timer')
   enableTimer(client: Socket, { id }) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.enableTimer(id);
      }
   }
   @SubscribeMessage('disable-timer')
   disableTimer(client: Socket, { id }) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.disableTimer(id);
      }
   }

   @SubscribeMessage('get-timers')
   getTimers(client: Socket) {
      const botId = Number(client.handshake.headers.botid);
      const session = this.sessionsService.getSession(botId);
      if (session) {
         session.setTimers();
      }
   }
}
