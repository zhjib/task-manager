import { Controller, Get, Post, Patch, Delete, Body, Param, Query, Req } from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import type { Task, TaskListResponse, TaskPriority } from '@shared/api.interface';

@Controller('api/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query('priority') priority?: string,
  ): Promise<TaskListResponse> {
    const safePriority: TaskPriority | 'all' =
      priority === 'high' || priority === 'medium' || priority === 'low'
        ? priority
        : 'all';
    return this.tasksService.findAll(safePriority);
  }

  @NeedLogin()
  @Post()
  async create(
    @Body() dto: CreateTaskDto,
  ): Promise<Task> {
    return this.tasksService.create(dto.title, dto.priority);
  }

  @NeedLogin()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ): Promise<Task> {
    return this.tasksService.update(id, dto);
  }

  @NeedLogin()
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    return this.tasksService.remove(id);
  }
}
