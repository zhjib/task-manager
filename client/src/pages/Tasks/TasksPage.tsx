import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { Button } from '@client/src/components/ui/button';
import { Input } from '@client/src/components/ui/input';
import { Badge } from '@client/src/components/ui/badge';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@client/src/components/ui/select';
import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
} from '@client/src/api/tasks';
import type { Task, TaskPriority } from '@shared/api.interface';

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: '高',
  medium: '中',
  low: '低',
};

const PRIORITY_BADGE_VARIANT: Record<TaskPriority, string> = {
  high: 'bg-red-100 text-red-700 hover:bg-red-100',
  medium: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
  low: 'bg-green-100 text-green-700 hover:bg-green-100',
};

const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchTasks(filterPriority);
      setTasks(result.items);
    } catch (error) {
      logger.error('加载任务列表失败', error);
    } finally {
      setLoading(false);
    }
  }, [filterPriority]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const handleCreate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      await createTask({ title: trimmed, priority });
      setTitle('');
      setPriority('medium');
      await loadTasks();
    } catch (error) {
      logger.error('添加任务失败', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    try {
      const updated = await updateTask(task.id, { isCompleted: !task.isCompleted });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (error) {
      logger.error('切换任务状态失败', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      logger.error('删除任务失败', error);
    }
  };

  const sortedTasks = [...tasks].sort(
    (a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">
          智能任务管理
        </h1>

        {/* 添加任务区 */}
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-3 items-start"
        >
          <div className="flex-1">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="输入任务标题..."
              className="w-full"
            />
          </div>
          <Select
            value={priority}
            onValueChange={(val) => setPriority(val as TaskPriority)}
          >
            <SelectTrigger className="w-24 flex-shrink-0">
              <SelectValue placeholder="优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="low">低</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" disabled={submitting || !title.trim()}>
            {submitting ? '添加中...' : '添加'}
          </Button>
        </form>

        {/* 筛选区 */}
        <div className="flex justify-end mb-4">
          <Select
            value={filterPriority}
            onValueChange={(val) => setFilterPriority(val as TaskPriority | 'all')}
          >
            <SelectTrigger className="w-32">
              <SelectValue placeholder="筛选优先级" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="high">高</SelectItem>
              <SelectItem value="medium">中</SelectItem>
              <SelectItem value="low">低</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 任务列表 */}
        {loading ? (
          <div className="text-center text-gray-500 py-12">加载中...</div>
        ) : sortedTasks.length === 0 ? (
          <div className="text-center text-gray-400 py-16 bg-white rounded-lg shadow-sm">
            <div className="text-lg mb-2">暂无任务</div>
            <div className="text-sm">添加你的第一个任务开始吧</div>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTasks.map((task: Task) => (
              <div
                key={task.id}
                className={`bg-white rounded-lg shadow-sm p-4 flex items-center gap-3 transition-opacity ${
                  task.isCompleted ? 'opacity-60' : ''
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-base ${
                      task.isCompleted ? 'line-through text-gray-400' : 'text-gray-800'
                    }`}
                  >
                    {task.title}
                  </div>
                </div>
                <Badge className={PRIORITY_BADGE_VARIANT[task.priority]} variant="secondary">
                  {PRIORITY_LABEL[task.priority]}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleComplete(task)}
                >
                  {task.isCompleted ? '撤销' : '完成'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(task.id)}
                >
                  删除
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;
