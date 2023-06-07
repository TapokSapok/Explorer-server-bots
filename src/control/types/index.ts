import { Socket } from 'socket.io';
import { Bot } from 'mineflayer';
import { ControlService } from '../control.service';
import { BotsRepository } from 'src/repositories/bots.repository';

export interface IMineflayerBot {
   bot: Bot;
   username: string;
   client: Socket;
   botId: number;
   botsRepository: BotsRepository;
   controlService: ControlService;
}
