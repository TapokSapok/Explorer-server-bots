import { SessionsService } from '../sessions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import * as mineflayer from 'mineflayer';
import { BotsRepository } from 'src/repositories/bots.repository';
import { threadId } from 'worker_threads';
import { SessionsGateway } from '../sessions.gateway';
import { throws } from 'assert';

export interface IItem {
   type: number;
   count: number;
   metadata: number;
   nbt: any;
   name: string;
   displayName: string;
   stackSize: number;
   slot: number;
}

export class HolyWorldPremium {
   bot: mineflayer.Bot;
   username: string;
   socketId: string;
   botId: number;
   sessionsService: SessionsService;
   sessionsGateway: SessionsGateway;
   lastMessages: { message: string; timestamp: Date }[];

   constructor({
      username,
      botId,
      socketId,
      sessionsService,
      sessionsGateway,
   }) {
      this.username = username;
      this.socketId = socketId;
      this.botId = botId;
      this.sessionsService = sessionsService;
      this.sessionsGateway = sessionsGateway;
      this.lastMessages = [];

      this.bot = mineflayer.createBot({
         // username: this.username,
         // host: 'localhost',
         // port: 54583,
         version: '1.18.2',

         username: 'SapokTapok',
         host: 'mc.HolyWorld.ru',
         port: 25565,
      });

      this.initEvents();
   }

   emit(event: string, data?: any) {
      this.sessionsGateway.emit(this.socketId, event, data);
   }

   initEvents() {
      this.bot.once('login', () => {
         console.log(this.socketId);
         this.emit('server-connected');
         this.sessionsService.changeBotStatus(this.botId, 'online');
      });

      this.bot.on('spawn', () => {
         this.setItems();
      });

      this.bot.on('error', (reason) => {
         this.emit('error', { message: reason });
         console.log('error', reason);
         this.sessionsService.destroySession(this.botId);
      });

      this.bot.on('kicked', (reason) => {
         this.emit('kicked', { message: reason });
         console.log('kicked', reason);
         this.sessionsService.changeBotStatus(this.botId, 'offline');
         this.sessionsService.destroySession(this.botId);
      });

      this.bot.on('messagestr', (message) => {
         const timestamp = new Date();
         this.emit('chat-message', { message, timestamp });
         this.lastMessages.push({ message, timestamp });
      });

      this.bot.on('death', () => {
         this.setItems();
      });

      this.bot.on('health', () => {
         this.getInfo();
      });

      this.bot.on('windowOpen', () => {
         this.setCurrentWindow();
      });

      this.bot.on('windowClose', () => {
         this.setCurrentWindow();
      });

      this.bot.on('playerCollect', async (collector, collected) => {
         if (collector.username === this.bot.username) {
            await this.bot.waitForTicks(1);
            this.setItems();
         }
      });
   }

   logout() {
      this.bot.quit('Самостоятельный выход.');
      this.emit('logout', { message: 'Самостоятельный выход' });
      this.sessionsService.changeBotStatus(this.botId, 'offline');
   }

   setItems() {
      const items = this.bot.inventory.slots;
      this.emit('set-items', items);
   }
   getQuickBarSlot() {
      const quickBarSlot = this.bot.quickBarSlot;
      this.emit('set-quick-bar-slot', quickBarSlot);
   }
   setCurrentWindow() {
      const currentWindow = this.bot.currentWindow;
      this.emit('set-current-window', currentWindow);
   }

   // emits

   setQuickBarSlot(slot: number) {
      this.bot.setQuickBarSlot(slot);
      this.getQuickBarSlot();
   }

   getInfo() {
      const health = this.bot.health;
      const experience = this.bot.experience.level;
      const food = this.bot.food;
      this.emit('set-info', { health, experience, food });
   }

   async moveItem(sourceSlot: number, destSlot: number) {
      await this.bot.moveSlotItem(sourceSlot, destSlot);
      this.setItems();
   }

   async throwItems(item: any) {
      await this.bot.tossStack(item.slot);
      this.setItems();
   }

   useItem() {
      this.bot.activateItem();
      this.setItems();
   }

   async clickWindow(slot: number, mouseButton: number) {
      await this.bot.clickWindow(slot, mouseButton, 0);
      this.setItems();
   }

   closeWindow() {
      const currentWindow = this.bot.currentWindow;
      this.bot.closeWindow(currentWindow);
   }
}
