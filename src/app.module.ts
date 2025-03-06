import { NotificationsGateway } from './notifications/notifications.gateway';
import { RabbitmqconsumerService } from './rabbitmq/rabbitmqconsumer.service';
import { RabbitmqproducerService } from './rabbitmq/rabbitmqproducer.service';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    TasksModule,
    RabbitmqModule,
  ],
  controllers: [AppController],
  providers: [
        NotificationsGateway, 
    RabbitmqconsumerService,
    RabbitmqproducerService, AppService],
})
export class AppModule { }
