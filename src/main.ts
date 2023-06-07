import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ControlService } from './control/control.service';
import { BotsRepository } from './repositories/bots.repository';

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
