import { Socket } from 'socket.io';
import { IMineflayerBot } from './types/index';
import { Injectable } from '@nestjs/common';
import { Bot } from '@prisma/client';
import { HolyWorld_Premium } from './servers/HolyWorld/HolyWorld_Premium';
import { BotsRepository } from 'src/repositories/bots.repository';
import * as NodeCache from 'node-cache';

@Injectable()
export class ControlService {
   bots: Map<number, HolyWorld_Premium>;
   constructor(private botsRepository: BotsRepository) {
      this.bots = new Map();

      setInterval(() => {
         const bots = this.bots.forEach((bot) => {
            if (bot) {
               console.log(bot.username);
            }
         });
      }, 500);
   }

   changeClient({ botId, client }: { botId: number; client: Socket }) {
      const bot = this.bots.get(botId);
      if (bot) {
         bot.client = client;
      }
   }

   addBot({ botId, newBot }: { botId: number; newBot: HolyWorld_Premium }) {
      console.log('Новый бот', botId);
      this.bots.set(botId, newBot);
   }

   removeBot(botId: number) {
      this.bots.delete(botId);
   }

   changeStatus(botId: number, status: 'offline' | 'online') {
      this.botsRepository.changeBot({
         where: { id: botId },
         data: { status: status },
      });
   }
}
