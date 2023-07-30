import { SessionsService } from '../sessions.service';
import * as mineflayer from 'mineflayer';
import { SessionsGateway } from '../sessions.gateway';
import map from './map';
import { Bot, Timer } from '@prisma/client';
import { IDbBot } from './types';
import { time } from 'console';

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

export class HolyWorld {
   bot: mineflayer.Bot;
   username: string;
   socketId: string[];
   botId: number;
   sessionsService: SessionsService;
   sessionsGateway: SessionsGateway;
   lastMessages: {
      json: any[];
   }[];
   inventoryItems: IItem[];
   currentWindowItems: IItem[];
   dbBot: IDbBot;
   activeTimers: { id: number; timer: NodeJS.Timer }[];

   constructor({
      username,
      botId,
      socketId,
      sessionsService,
      sessionsGateway,
      dbBot,
   }) {
      this.username = username;
      this.botId = botId;
      this.sessionsService = sessionsService;
      this.sessionsGateway = sessionsGateway;
      this.dbBot = dbBot;

      this.socketId = [];
      this.socketId.push(socketId);

      this.lastMessages = [];
      this.inventoryItems = [];
      this.currentWindowItems = [];

      this.activeTimers = [];

      this.bot = mineflayer.createBot({
         username: this.username,
         // host: 'localhost',
         // port: 57125,
         version: '1.18.2',

         // username: 'SapokTapok',
         host: 'mc.HolyWorld.ru',
         port: 25565,
      });

      this.initEvents();
      this.initMacros();
   }

   emit(event: string, data?: any) {
      this.sessionsGateway.emit(this.socketId, event, data);
   }

   async initMacros() {
      const activeMacros = this.dbBot.macroses.find(
         (m) => m.id === this.dbBot.activeMacrosId
      );

      if (!activeMacros) return;
      if (activeMacros.id === 0) return;

      const macrosIndex = this.dbBot.macroses.indexOf(activeMacros);
      const blocks = this.dbBot.macroses[macrosIndex].blocks;

      if (!blocks) return;

      if (blocks[0].blockType === 'event' && blocks[0].event === 'spawn') {
         this.bot.once('spawn', async () => {
            await this.bot.waitForTicks(20);

            for (let i = 1; i < blocks.length; i++) {
               const blockType = blocks[i].blockType;
               const event = blocks[i].event;
               const action = blocks[i].action;
               const value = blocks[i].value;
               const secondValue = blocks[i].secondValue;

               if (blockType === 'event') return;

               switch (action) {
                  case 'wait':
                     secondValue === 'ms'
                        ? await this.bot.waitForTicks(Number(value) / 100)
                        : await this.bot.waitForTicks(Number(value) / 10);

                     break;

                  case 'message':
                     this.bot.chat(value);
                     break;

                  case 'set-quick-bar-slot':
                     this.bot.setQuickBarSlot(Number(value) - 1);
                     break;

                  case 'use-item':
                     this.bot.activateItem(false);
                     break;

                  case 'click-window':
                     await this.bot.clickWindow(
                        Number(value),
                        Number(secondValue),
                        0
                     );
                     break;
                  case 'timer': {
                     value === 'true'
                        ? this.enableTimer(Number(secondValue))
                        : this.disableTimer(Number(secondValue));
                     break;
                  }
               }
            }
         });
      }
   }

   initEvents() {
      this.bot._client.on('map', (packet) => {
         const mapId = packet.itemDamage;
         this.emit('map-packet', packet);
         if (typeof packet.data != 'undefined' && packet.data) {
            map(packet.data).writeImage(__dirname + `/map${mapId}.png`);
            // this.mergeMaps();
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

   enableTimer(id: number) {
      console.log('enable timer', id);
      const timer = this.dbBot.timers.find((t) => t.id === id);
      if (!timer) return;
      if (timer.interval < 1) timer.interval = 1;

      this.bot.chat(timer.message);

      this.activeTimers.push({
         id: timer.id,
         timer: setInterval(() => {
            this.bot.chat(timer.message);
         }, timer.interval * 1000),
      });
      this.emit('timer-enabled', { id: timer.id });
      console.log(this.activeTimers.map((t) => t.id));
   }

   disableTimer(id: number) {
      console.log('disable timer', id);
      const enabledTimer = this.activeTimers.find((t) => t.id === id);
      if (!enabledTimer) {
         return;
      }
      clearInterval(enabledTimer.timer);
      this.activeTimers = [...this.activeTimers.filter((t) => t.id !== id)];
      this.emit('timer-disabled', enabledTimer.id);
   }

   setTimers() {
      this.emit(
         'set-timers',
         this.activeTimers.map((t) => t.id)
      );
   }
}
