import { AuthService } from './auth.service';
import { UsersRepository } from './../repositories/users.repository';
import {
   OnGatewayConnection,
   SubscribeMessage,
   WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';

@WebSocketGateway({ cors: true })
export class AuthGateway implements OnGatewayConnection {
   constructor(private authService: AuthService) {}

   async handleConnection(client: Socket) {
      console.log('connected', client.id);
      await this.authService.connectionGuard(client);
   }

   handleDisconnect(client: Socket) {
      console.log('Client disconnected');
   }
}
