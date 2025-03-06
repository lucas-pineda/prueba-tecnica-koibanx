import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task, TaskDocument } from './schemas/task.schema';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MultipartFile } from '@fastify/multipart';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import { RabbitmqproducerService } from 'src/rabbitmq/rabbitmqproducer.service';


@Injectable()
export class TasksService {
  private readonly uploadDir: string;
  private readonly FileTypes: string[];
  private readonly maxFiles: number;

  
  constructor(@InjectModel(Task.name) private readonly taskModel: Model<TaskDocument>, 
              private readonly configService: ConfigService,
              private readonly producerService: RabbitmqproducerService
            ) { 

    this.uploadDir = this.configService.get<string>('UPLOAD_FOLDER', './uploads');
    this.FileTypes = this.configService.get<string>('FILE_TYPES', '.csv,.xlsx').split(',');
    this.maxFiles = this.configService.get<number>('MAX_FILES', 5);

  }

  async saveFilesAndCreateTask(files: AsyncIterableIterator<MultipartFile>) {
    const filePaths: any = [];
    let fileCount = 0;
    const tasks: any = [];
    for await (const file of files) {

      fileCount++;
      const extension = path.extname(file.filename).toLowerCase();
      if (fileCount > this.maxFiles) {
        throw new BadRequestException(`Solo se permiten hasta ${this.maxFiles} archivos por solicitud.`);
      }
      if (!this.FileTypes.includes(extension)) {
        throw new BadRequestException(`Formato no permitido: ${extension}. Solo se aceptan archivos .csv y .xlsx.`);
      }
      const uuidFilename = `${uuidv4()}${extension}`;
      const filePath = path.join(this.uploadDir, uuidFilename);
      const fileBuffer = await file.toBuffer();
      await fs.writeFile(filePath, fileBuffer);
      const task = await this.create({filePath});
      tasks.push(task.id);
      filePaths.push(filePath);
    }

    return await tasks;
  }

  async create(createTaskDto: CreateTaskDto) {
    const task = new this.taskModel(createTaskDto);
    this.producerService.sendMessage(task);
    return await task.save();
  }

  async findAll() {
    return await this.taskModel.find().exec();
  }

  async findOne(id: string) {
    const task = await this.taskModel.findById(id);
    if (!task) throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto) {
    const task = await this.taskModel.findByIdAndUpdate(id, updateTaskDto, { new: true });
    if (!task) throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    return task;
  }

  async remove(id: string) {
    const task = await this.taskModel.findByIdAndDelete(id);
    if (!task) throw new NotFoundException(`Tarea con ID ${id} no encontrada`);
    return { message: 'Tarea eliminada' };
  }
  
}
