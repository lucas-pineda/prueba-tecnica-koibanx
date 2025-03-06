import { IsString, IsOptional } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  filePath: string;
  @IsOptional()
  @IsString()
  status?: 'pending' | 'processing' | 'done' | 'error';
  @IsOptional()
  errorCount?: number;
}
