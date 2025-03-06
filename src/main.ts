import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import multipart from '@fastify/multipart';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule, 
    new FastifyAdapter() as any, 
  );
  const configService = app.get(ConfigService);
  const maxFileSize = configService.get<number>('MAX_FILE_SIZE', 10485760);
  const rabbitMQUrl = configService.get<string>('RABBITMQ_URL','localhost:5672');
  const queue = configService.get<string>('RABBITMQ_QUEUE','task_queue');
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [rabbitMQUrl],
      queue,
      queueOptions: { durable: true },
    },
  });
  app.register(multipart, { limits: { fileSize: +maxFileSize } });
  await app.startAllMicroservices();
  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();
