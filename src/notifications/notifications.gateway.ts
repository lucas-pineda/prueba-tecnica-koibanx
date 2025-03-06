import { WebSocketGateway, WebSocketServer, SubscribeMessage } from '@nestjs/websockets';
import { Server } from 'socket.io';

@WebSocketGateway({ cors: true })
export class NotificationsGateway {
  @WebSocketServer()
  server: Server;


  notifyTaskProcessed(taskId: string, status: string, errors:any =[], data: any = []) {
    if(errors.length > 0)this.server.emit('task_processed', { taskId, status, errors});
    else this.server.emit('task_processed', { taskId, status,error:0, data });
  }

  @SubscribeMessage('join_task')
  handleJoinTask(client: any, taskId: string) {
    client.join(taskId);
  }
}
