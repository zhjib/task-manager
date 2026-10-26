import { IsString, IsOptional, IsBoolean, IsIn, MaxLength, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import type { UpdateTaskRequest, TaskPriority } from '@shared/api.interface';

export class UpdateTaskDto implements UpdateTaskRequest {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title?: string;

  @IsOptional()
  @IsString()
  @IsIn(['high', 'medium', 'low'])
  @Type(() => String)
  priority?: TaskPriority;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isCompleted?: boolean;
}
