import { Controller, Inject } from '@nestjs/common';
import { ClientProxy, EventPattern, MessagePattern } from '@nestjs/microservices';
import { TasksService } from 'src/tasks/tasks.service';
import * as fs from 'fs/promises';
import * as xlsx from 'xlsx';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';
import { ConfigService } from '@nestjs/config';

@Controller()
export class RabbitmqconsumerService {
constructor( @Inject('RABBITMQ_SERVICE') private readonly rabbitMQClient: ClientProxy,
             private readonly tasksService: TasksService,
             private readonly notificationsGateway: NotificationsGateway,
             private readonly configService: ConfigService
            ) {}   

async  sleep(ms: number): Promise<void> {
return new Promise((resolve) => setTimeout(resolve, ms));
}
                      
@EventPattern('process_task') 
async handleTaskProcessing(task:any) {
const delay = this.configService.get<number>('DELAY', 5000);
try {
    console.log(`📂 Procesando archivo desde RabbitMQ: ${task.id}`);
    await this.tasksService.update(task.id,{status:'processing'});
    this.notificationsGateway.notifyTaskProcessed(task.id,`Se ha iniciado el procesamiento de la tarea No ${task.id}, estado : processing`);
    const fileBuffer = await fs.readFile(task.filePath);
    const workbook = xlsx.read(fileBuffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data: any = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);  
    await this.sleep(delay);
    const errors: any[] = [];
    const processedData: any[] = [];
    for (let i = 0; i < data.length; i++) {
    const row = data[i];
    let { Nombre, Edad, Nums } = row;
    if (typeof Nums === 'string') {
     Nums = Nums.split(',').map((n) => Number(n.trim()));
     }
     if (typeof Nombre !== 'string' || typeof Edad !== 'number' || !Array.isArray(Nums) || Nums.length === 0 || Nums.some((n) => isNaN(n))) {
      errors.push({ fila: i + 1, error: 'Formato incorrecto', data: row });
      continue; 
    } 
    const sortedNums = Nums.map(Number).sort((a, b) => a - b);
    processedData.push({ Nombre, Edad, Nums: sortedNums });
    }
    if(errors.length > 0){
    await this.tasksService.update(task.id, {status:'error'});
    this.notificationsGateway.notifyTaskProcessed(task.id,`Se terminado el procesamiento de la tarea No ${task.id}, se encontraron ${errors.length}, estado : error`, errors);
    }else{
    await this.tasksService.update(task.id, {status:'done'});
    this.notificationsGateway.notifyTaskProcessed(task.id,`Se terminado el procesamiento de la tarea No ${task.id}, estado : done`,[],processedData);
    }
    console.log(`📂 Se termino procesamiento de archivo desde RabbitMQ: ${task.id}`);
  } catch (error) {
    console.error(`❌ Error procesando archivo desde RabbitMQ:`, error);
  }
} 
}
