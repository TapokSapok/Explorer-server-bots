import { Inject, Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { HolyWorld } from 'src/sessions/servers/HolyWorld';
import { BotsRepository } from 'src/repositories/bots.repository';
import { SocketService } from 'src/socket/socket.service';

@Injectable()
export class SessionsService {
   @WebSocketServer()
   private io: Server;

   constructor(
      @Inject('BOTS_SESSIONS')
      private readonly bots: Map<number, HolyWorld>,
      private botsRepository: BotsRepository
   ) {}

   getSessionsLength() {
      return this.bots.size;
   }

   getSessionExist(botId: number) {
      const sessionExist = this.bots.has(botId);
      return sessionExist;
   }

   getSession(botId: number) {
      return this.bots.get(botId);
   }

   changeSessionSocketId(botId: number, socketId: string) {
      const bot = this.bots.get(botId);
      if (bot) {
         bot.socketId.push(socketId);
      }
   }

   removeSessionSocketId(botId: number, socketId: string) {
      const bot = this.bots.get(botId);
      if (bot) {
         const index = bot.socketId.indexOf(socketId);
         if (index > -1) {
            bot.socketId.splice(index, 1);
         }
      }
   }

   async changeBotStatus(botId: number, status: 'offline' | 'online') {
      return await this.botsRepository.changeBot({
         where: { id: botId },
         data: { status: status },
      });
   }

   createSession(botId: number, newBot: HolyWorld) {
      console.log('Новая сессия:', botId);
      this.bots.set(botId, newBot);
      const botsSize = this.bots.size;
   }

   destroySession(botId: number) {
      this.bots.delete(botId);
      const botsSize = this.bots.size;
   }

   emit(socketId: string, event: string, data?: any) {
      console.log('server', this.io);
      console.log('emit', this.io?.sockets);
   }
}
