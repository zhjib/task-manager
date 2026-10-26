import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import type { Task, TaskPriority, TaskListResponse } from '@shared/api.interface';
import type { UpdateTaskDto } from './dto/update-task.dto';

interface SupabaseTaskRow {
  id: number;
  title: string;
  priority: string;
  completed: boolean;
  created_at: string;
}

const PRIORITY_TO_CN: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_FROM_CN: Record<string, TaskPriority> = {
  高: 'high',
  中: 'medium',
  低: 'low',
};

@Injectable()
export class TasksService {
  constructor(private readonly supabaseService: SupabaseService) {}

  private toTask(row: SupabaseTaskRow): Task {
    return {
      id: String(row.id),
      title: row.title,
      priority: PRIORITY_FROM_CN[row.priority] ?? 'medium',
      isCompleted: row.completed,
      createdAt: new Date(row.created_at).toISOString(),
    };
  }

  async findAll(priority: TaskPriority | 'all'): Promise<TaskListResponse> {
    const sb = this.supabaseService.getClient();

    let query = sb
      .from('tasks')
      .select('id, title, priority, completed, created_at')
      .order('created_at', { ascending: false });

    if (priority !== 'all') {
      query = query.eq('priority', PRIORITY_TO_CN[priority]);
    }

    const { data, error } = await query;

    if (error) {
      throw new BadRequestException(`Failed to fetch tasks: ${error.message}`);
    }

    const items: Task[] = (data as SupabaseTaskRow[]).map((row: SupabaseTaskRow) => this.toTask(row));

    return { items };
  }

  async create(title: string, priority: TaskPriority): Promise<Task> {
    const sb = this.supabaseService.getClient();

    const { data, error } = await sb
      .from('tasks')
      .insert({ title, priority: PRIORITY_TO_CN[priority], completed: false })
      .select('id, title, priority, completed, created_at')
      .single();

    if (error) {
      throw new BadRequestException(`Failed to create task: ${error.message}`);
    }

    return this.toTask(data as SupabaseTaskRow);
  }

  async update(id: string, dto: UpdateTaskDto): Promise<Task> {
    const patch: Record<string, string | boolean> = {};
    if (dto.title !== undefined) patch.title = dto.title;
    if (dto.priority !== undefined) patch.priority = PRIORITY_TO_CN[dto.priority];
    if (dto.isCompleted !== undefined) patch.completed = dto.isCompleted;

    if (Object.keys(patch).length === 0) {
      throw new BadRequestException('At least one field must be provided');
    }

    const sb = this.supabaseService.getClient();

    const { data, error } = await sb
      .from('tasks')
      .update(patch)
      .eq('id', Number(id))
      .select('id, title, priority, completed, created_at')
      .single();

    if (error) {
      if (error.code === 'PGRST116' || error.details?.includes('0 rows')) {
        throw new NotFoundException('Task not found');
      }
      throw new BadRequestException(`Failed to update task: ${error.message}`);
    }

    if (!data) {
      throw new NotFoundException('Task not found');
    }

    return this.toTask(data as SupabaseTaskRow);
  }

  async remove(id: string): Promise<{ success: true }> {
    const sb = this.supabaseService.getClient();

    const { data, error } = await sb
      .from('tasks')
      .delete()
      .eq('id', Number(id))
      .select('id');

    if (error) {
      throw new BadRequestException(`Failed to delete task: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new NotFoundException('Task not found');
    }

    return { success: true };
  }
}
