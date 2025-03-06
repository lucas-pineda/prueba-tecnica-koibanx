import { forwardRef, Module } from '@nestjs/common';
import { RabbitmqproducerService } from './rabbitmqproducer.service';
import { RabbitmqconsumerService } from './rabbitmqconsumer.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { TasksModule } from 'src/tasks/tasks.module';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Module({
    imports:[
      forwardRef(() => TasksModule),
        ClientsModule.register([
            {
              name: 'RABBITMQ_SERVICE',
              transport: Transport.RMQ,
              options: {
                urls: [process.env.RABBITMQ_URL || 'localhost:5672'],
                queue: process.env.RABBITMQ_QUEUE || 'task_queue',
                queueOptions: { durable: true },
              },
            },
          ]),
    ],
    controllers:[RabbitmqconsumerService],
    providers:[
               RabbitmqproducerService,
               NotificationsGateway
            ],
    exports:[
             RabbitmqproducerService, 
             ClientsModule
            ]
})
export class RabbitmqModule {}
