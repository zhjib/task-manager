export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  isCompleted: boolean;
  createdAt: string;
}

export interface TaskListQuery {
  priority?: TaskPriority | 'all';
}

export interface TaskListResponse {
  items: Task[];
}

export interface CreateTaskRequest {
  title: string;
  priority: TaskPriority;
}

export interface UpdateTaskRequest {
  title?: string;
  priority?: TaskPriority;
  isCompleted?: boolean;
}
