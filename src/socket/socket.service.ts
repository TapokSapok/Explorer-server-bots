import { Injectable } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@Injectable()
export class SocketService {
   @WebSocketServer()
   server: Server;

   sockets() {
      console.log('sockets', this.server.sockets.sockets);
      // const socket: Socket = this.io.sockets.sockets[userId];
      // if (socket) {
      //    socket.emit(event, data);
      // }
   }
}
