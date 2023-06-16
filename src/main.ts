import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';
import { BotsRepository } from './repositories/bots.repository';
import * as socketio from 'socket.io';

const start = async () => {
   const PORT = process.env.PORT || 7070;
   const app = await NestFactory.create(AppModule);

   app.setGlobalPrefix('/bot-server');
   app.enableCors({
      origin: true,
      credentials: true,
   });

   await app.listen(PORT, () => {
      console.log(`СЕРВЕР БОТОВ УСПЕШНО ЗАПУЩЕН НА ${PORT} ПОРТУ!`);
   });
};
start();
