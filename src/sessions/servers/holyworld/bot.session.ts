import mineflayer from 'mineflayer';

export class BotSession {
   bot: mineflayer.Bot;

   constructor(options) {
      this.bot = mineflayer.createBot(options);
      this.initEvents();
   }

   initEvents() {
      this.bot.once('spawn', () => {});

      this.bot.on('kicked', (reason) => {
         console.log(reason);
      });

      this.bot.on('error', (reason) => {
         console.log(reason);
      });

      this.bot.on('messagestr', (message) => {
         // console.log(message);
      });
   }
}
