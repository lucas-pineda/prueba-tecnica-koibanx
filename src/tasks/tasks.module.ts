import { forwardRef, Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task, TaskSchema } from './schemas/task.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';


@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
    RabbitmqModule,
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports:[TasksService]
  
})
export class TasksModule {}
