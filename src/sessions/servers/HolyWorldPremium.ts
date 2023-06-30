import { SessionsService } from '../sessions.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import * as mineflayer from 'mineflayer';
import { BotsRepository } from 'src/repositories/bots.repository';
import { threadId } from 'worker_threads';
import { SessionsGateway } from '../sessions.gateway';
import { throws } from 'assert';
import fs from 'fs';
import Jimp from 'jimp';
import PNGImage from 'pngjs-image';
import path from 'path';
import map from './map';

/*
   Для lastMessages сделать ограничение.


*/

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
   // socketId: string;
   socketId: string[];
   botId: number;
   sessionsService: SessionsService;
   sessionsGateway: SessionsGateway;
   lastMessages: {
      json: any[];
   }[];
   inventoryItems: IItem[];
   currentWindowItems: IItem[];

   constructor({
      username,
      botId,
      socketId,
      sessionsService,
      sessionsGateway,
   }) {
      this.username = username;
      this.botId = botId;
      this.sessionsService = sessionsService;
      this.sessionsGateway = sessionsGateway;

      this.socketId = [];
      this.socketId.push(socketId);

      this.lastMessages = [];
      this.inventoryItems = [];
      this.currentWindowItems = [];

      this.bot = mineflayer.createBot({
         // username: this.username,
         // host: 'localhost',
         // port: 57125,
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
      this.bot._client.on('map', (packet) => {
         const mapId = packet.itemDamage;
         this.emit('map-packet', packet);
         if (typeof packet.data != 'undefined' && packet.data) {
            console.log(__dirname);
            map(packet.data).writeImage(__dirname + `/map${mapId}.png`);
            this.mergeMaps();
         }
      });

      this.bot.once('login', () => {
         console.log(this.socketId);
         this.emit('server-connected');
         this.sessionsService.changeBotStatus(this.botId, 'online');
      });

      this.bot.on('spawn', () => {
         this.setInventoryItems();
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

      this.bot.on('messagestr', (message, position, obj) => {
         this.emit('chat-message', obj.json);

         if (this.lastMessages.length > 30) {
            this.lastMessages.shift();
         }
         this.lastMessages.push(obj.json);
      });

      this.bot.on('death', () => {
         this.setInventoryItems();
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
            this.setInventoryItems();
         }
      });
   }

   logout() {
      this.bot.quit('Самостоятельный выход.');
      this.emit('logout', { message: 'Самостоятельный выход' });
      this.sessionsService.changeBotStatus(this.botId, 'offline');
   }

   setInventoryItems() {
      const items = this.bot.inventory.slots;
      const selectedItem = this.bot.inventory.selectedItem;
      this.emit('set-inventory-items', items);
      this.emit('set-inventory-selected-item', selectedItem);
   }

   getQuickBarSlot() {
      const quickBarSlot = this.bot.quickBarSlot;
      this.emit('set-quick-bar-slot', quickBarSlot);
   }
   setCurrentWindow() {
      const currentWindow = this.bot.currentWindow;
      this.emit('set-current-window', currentWindow);
   }

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
      this.setInventoryItems();
   }

   async throwItems(item: any) {
      await this.bot.tossStack(item.slot);
      this.setInventoryItems();
   }

   useItem() {
      this.bot.activateItem();
      this.setInventoryItems();
   }

   async clickWindow(slot: number, mouseButton: number) {
      await this.bot.clickWindow(slot, mouseButton, 0);
      if (this.bot.currentWindow) {
         this.setCurrentWindow();
      } else {
         this.setInventoryItems();
      }
   }

   closeWindow() {
      const currentWindow = this.bot.currentWindow;
      this.bot.closeWindow(currentWindow);
   }
   // emits

   mergeMaps() {
      // const mapsDirectory = __dirname;
      // const mapSize = 128;
      // console.log('merge_map');
      // setTimeout(() => {
      //    fs.readdir(mapsDirectory, async (err, files) => {
      //       if (err) throw err;
      //       const maps = files
      //          .filter((file) => file.startsWith('map'))
      //          .sort((a, b) => {
      //             const [aIndex, bIndex] = [a, b].map((file) =>
      //                parseInt(file.match(/_(\d+).png/))
      //             );
      //             return aIndex - bIndex;
      //          });
      //       const imageWidth = mapSize * Math.sqrt(maps.length);
      //       const imageHeight = mapSize * Math.sqrt(maps.length);
      //       const image = await new Jimp(imageWidth, imageHeight);
      //       for (let i = maps.length - 1; i >= 0; i--) {
      //          const x =
      //             ((maps.length - 1 - i) % Math.sqrt(maps.length)) * mapSize;
      //          const y =
      //             Math.floor((maps.length - 1 - i) / Math.sqrt(maps.length)) *
      //             mapSize;
      //          const mapImage = await Jimp.read('${mapsDirectory}/${maps[i]}');
      //          image.blit(mapImage, x, y);
      //       }
      //       image.write(path.join(__dirname + '/result.jpg'));
      //    });
      // }, 1000);
   }
}
