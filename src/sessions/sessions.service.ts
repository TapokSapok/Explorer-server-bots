import { Inject, Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { HolyWorldPremium } from 'src/sessions/servers/HolyWorldPremium';
import { BotsRepository } from 'src/repositories/bots.repository';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class SessionsService {
   @WebSocketServer()
   private io: Server;

   constructor(
      @Inject('BOTS_SESSIONS')
      private readonly bots: Map<number, HolyWorldPremium>,
      // private readonly socketIoAdapter: SocketIoAdapter,
      private botsRepository: BotsRepository
   ) {
      // this.io = socketIoAdapter.server;
   }

   getSessionsLength() {
      return this.bots.size;
   }

   getBot(botId: number) {
      return this.bots.get(botId);
   }

   changeSessionSocketId(botId: number, socketId: string) {
      const bot = this.bots.get(botId);
      const botsSize = this.bots.size;
      if (bot) {
         bot.socketId = socketId;
         console.log(
            'боту',
            bot?.bot?.username,
            'был сменён сокет',
            `на ${socketId}`
         );
      }
   }

   async changeBotStatus(botId: number, status: 'offline' | 'online') {
      return await this.botsRepository.changeBot({
         where: { id: botId },
         data: { status: status },
      });
   }

   createSession(botId: number, newBot: HolyWorldPremium) {
      console.log('Новая сессия:', botId);
      this.bots.set(botId, newBot);
      const botsSize = this.bots.size;
      console.log(`botSize: ${botsSize}`);
   }

   destroySession(botId: number) {
      this.bots.delete(botId);
      const botsSize = this.bots.size;
      console.log(`botSize: ${botsSize}`);
   }

   emit(socketId: string, event: string, data?: any) {
      console.log('server', this.io);
      console.log('emit', this.io?.sockets);
      // this.server.sockets.sockets[socketId].emit(event, data ? data : null);
   }
}
