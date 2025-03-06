/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class RabbitmqproducerService{
    private client: ClientProxy;   

    constructor(private readonly configService: ConfigService) {
        this.client = ClientProxyFactory.create({
          transport: Transport.RMQ,
          options: {
            urls: [this.configService.get<string>('RABBITMQ_URL', 'amqp://localhost')],
            queue: this.configService.get<string>('RABBITMQ_QUEUE', 'task_queue'),
            queueOptions: { durable: true },
          },
        });
      }
    async sendMessage(task: any) {
    return this.client.emit('process_task', task);
    }    
}
