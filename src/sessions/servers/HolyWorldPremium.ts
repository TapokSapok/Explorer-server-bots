import { SessionsService } from '../sessions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import * as mineflayer from 'mineflayer';
import { BotsRepository } from 'src/repositories/bots.repository';
import { threadId } from 'worker_threads';

export class HolyWorldPremium {
   bot: mineflayer.Bot;
   username: string;
   socketId: string;
   botId: number;
   sessionsService: SessionsService;

   constructor({ username, botId, socketId, sessionsService }) {
      this.username = username;
      this.socketId = socketId;
      this.botId = botId;
      this.sessionsService = sessionsService;

      this.bot = mineflayer.createBot({
         username: this.username,
         host: 'localhost',
         port: 58287,
         version: '1.18.2',
      });

      this.initHandlers();
      this.initEvents();
   }

   emit(event: string, data?: any) {
      this.sessionsService.emit(this.socketId, event, data);
   }

   initEvents() {
      this.bot.once('login', () => {
         console.log(this.socketId);
         this.emit('server-connected');
         this.sessionsService.changeBotStatus(this.botId, 'online');
      });
      this.bot.on('error', (reason) => {
         this.emit('error', { message: reason });
         this.sessionsService.destroySession(this.botId);
      });
      this.bot.on('kicked', (reason) => {
         this.emit('kicked', { message: reason });
         this.sessionsService.changeBotStatus(this.botId, 'offline');
         this.sessionsService.destroySession(this.botId);
      });
      this.bot.on('messagestr', (message) => {
         this.emit('chat-message', { message, timestamp: new Date() });
         console.log(message);
      });
   }
   initHandlers() {
      // this.client.on('logout', (data) => {
      //    this.logout();
      // });
      // this.client.on('chat-message', (data) => {
      //    console.log(`message ${data.message}`);
      //    this.bot.chat(data.message);
      // });
   }
   // ADDONS
   // logout() {
   //    this.bot.quit('Самостоятельный выход.');
   //    this.client.emit('logout', { message: 'Самостоятельный выход' });
   //    this.sessionsService.changeBotStatus(this.botId, 'offline');
   // }
}
