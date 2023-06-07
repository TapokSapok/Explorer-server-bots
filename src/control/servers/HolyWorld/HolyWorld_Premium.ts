import { ControlService } from 'src/control/control.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import * as mineflayer from 'mineflayer';
import { BotsRepository } from 'src/repositories/bots.repository';

export class HolyWorld_Premium {
   bot: mineflayer.Bot;
   username: string;
   client: Socket;
   botId: number;
   controlService: ControlService;

   constructor({ username, botId, client, ControlService }) {
      this.username = username;
      this.client = client;
      this.botId = botId;
      this.controlService = ControlService;

      this.bot = mineflayer.createBot({
         username: this.username,
         host: 'localhost',
         port: 57117,
         version: '1.18.2',
      });

      this.initHandlers();
      this.initEvents();
   }
   initEvents() {
      this.bot.once('login', () => {
         this.client.emit('server-connected');
         this.controlService.changeStatus(this.botId, 'online');
      });

      this.bot.on('error', (reason) => {
         this.client.emit('error', { message: reason });
         this.controlService.removeBot(this.botId);
      });

      this.bot.on('kicked', (reason) => {
         this.client.emit('kicked', { message: reason });
         this.controlService.changeStatus(this.botId, 'offline');
         this.controlService.removeBot(this.botId);
      });

      this.bot.on('messagestr', (message) => {
         this.client.emit('chat-message', { message, timestamp: new Date() });
         console.log(message);
      });
   }
   initHandlers() {
      this.client.on('logout', (data) => {
         this.logout();
      });
      this.client.on('chat-message', (data) => {
         this.bot.chat(data.message);
      });
   }
   // ADDONS
   logout() {
      this.bot.quit('Самостоятельный выход.');
      this.client.emit('logout', { message: 'Самостоятельный выход' });
      this.controlService.changeStatus(this.botId, 'offline');
   }

   changeClient(client: Socket) {
      console.log('changeClient');
      this.client = client;
   }
}
