import { supabase } from './supabase';
import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskPriority,
} from '@shared/api.interface';

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

function toTask(row: SupabaseTaskRow): Task {
  return {
    id: String(row.id),
    title: row.title,
    priority: PRIORITY_FROM_CN[row.priority] ?? 'medium',
    isCompleted: row.completed,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function fetchTasks(priority?: TaskPriority | 'all'): Promise<TaskListResponse> {
  let query = supabase
    .from('tasks')
    .select('id, title, priority, completed, created_at')
    .order('created_at', { ascending: false });

  if (priority && priority !== 'all') {
    query = query.eq('priority', PRIORITY_TO_CN[priority]);
  }

  const { data, error } = await query;

  if (error) {
    console.error('获取任务列表失败', error.message);
    throw error;
  }

  return { items: (data as SupabaseTaskRow[]).map((row) => toTask(row)) };
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  const { data: row, error } = await supabase
    .from('tasks')
    .insert({
      title: data.title,
      priority: PRIORITY_TO_CN[data.priority],
      completed: false,
    })
    .select('id, title, priority, completed, created_at')
    .single();

  if (error) {
    console.error('创建任务失败', error.message);
    throw error;
  }

  return toTask(row as SupabaseTaskRow);
}

export async function updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
  const patch: Record<string, string | boolean> = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.priority !== undefined) patch.priority = PRIORITY_TO_CN[data.priority];
  if (data.isCompleted !== undefined) patch.completed = data.isCompleted;

  const { data: row, error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', Number(id))
    .select('id, title, priority, completed, created_at')
    .single();

  if (error) {
    console.error('更新任务失败', error.message);
    throw error;
  }

  if (!row) throw new Error('Task not found');
  return toTask(row as SupabaseTaskRow);
}

export async function deleteTask(id: string): Promise<void> {
  const { data, error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', Number(id))
    .select('id');

  if (error) {
    console.error('删除任务失败', error.message);
    throw error;
  }

  if (!data || data.length === 0) throw new Error('Task not found');
}
