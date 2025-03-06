import { Controller, Post, Get, Param, Patch, Delete, Body, Req, BadRequestException } from '@nestjs/common'; // ✅ Importar correctamente
import { FastifyRequest } from 'fastify';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { RabbitmqproducerService } from 'src/rabbitmq/rabbitmqproducer.service';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService, private readonly producerService: RabbitmqproducerService) {}

  @Post('upload')
  async uploadFiles(@Req() request: FastifyRequest) {

    try {
      const parts = request.files(); 
      if (!parts) throw new BadRequestException('No se han recibido archivos.');
      return await this.tasksService.saveFilesAndCreateTask(parts);
    } catch (error) {
      throw new BadRequestException(`Error al subir los archivos: ${error.message}`);
    }
    
  }

  @Post()
  create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  findAll() {
    return this.tasksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }

  @Post('test-rabbitmq')
  async testRabbitMQ(@Body() body: { filePath: string }) {
    const task = { taskId: '67c92442260ed528dd64af0b', filePath: body.filePath };
    await this.producerService.sendMessage(task);
    return { message: 'Mensaje enviado a RabbitMQ', task };
  }

}
