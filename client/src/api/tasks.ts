import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';
import type {
  Task,
  TaskListResponse,
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskPriority,
} from '@shared/api.interface';

export async function fetchTasks(priority?: TaskPriority | 'all'): Promise<TaskListResponse> {
  try {
    const params: Record<string, string> = {};
    if (priority && priority !== 'all') {
      params.priority = priority;
    }
    const response = await axiosForBackend({
      url: '/api/tasks',
      method: 'GET',
      params,
    });
    return response.data;
  } catch (error) {
    logger.error('获取任务列表失败', error);
    throw error;
  }
}

export async function createTask(data: CreateTaskRequest): Promise<Task> {
  try {
    const response = await axiosForBackend({
      url: '/api/tasks',
      method: 'POST',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('创建任务失败', error);
    throw error;
  }
}

export async function updateTask(id: string, data: UpdateTaskRequest): Promise<Task> {
  try {
    const response = await axiosForBackend({
      url: `/api/tasks/${id}`,
      method: 'PATCH',
      data,
    });
    return response.data;
  } catch (error) {
    logger.error('更新任务失败', error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await axiosForBackend({
      url: `/api/tasks/${id}`,
      method: 'DELETE',
    });
  } catch (error) {
    logger.error('删除任务失败', error);
    throw error;
  }
}
