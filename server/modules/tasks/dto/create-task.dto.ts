import { IsString, IsNotEmpty, MaxLength, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import type { CreateTaskRequest, TaskPriority } from '@shared/api.interface';

export class CreateTaskDto implements CreateTaskRequest {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title!: string;

  @IsString()
  @IsIn(['high', 'medium', 'low'])
  @Type(() => String)
  priority!: TaskPriority;
}
