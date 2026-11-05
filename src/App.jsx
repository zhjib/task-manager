import { useEffect, useState } from 'react';

const PRIORITIES = ['高', '中', '低'];
const FILTERS = ['全部', '高', '中', '低'];

/**
 * 智能任务管理系统
 * 功能：添加（输入框+优先级下拉）、列表倒序、完成/未完成切换、删除、按优先级筛选
 */
export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('中');
  const [filter, setFilter] = useState('全部');
  const [tip, setTip] = useState({ text: '', error: false });
  const [adding, setAdding] = useState(false);

  /** 顶部提示 */
  function showTip(text, error = false) {
    setTip({ text, error });
    if (text) {
      setTimeout(() => setTip({ text: '', error: false }), 2500);
    }
  }

  /** 加载任务列表（按创建时间倒序，服务端排序） */
  async function loadTasks(activeFilter = filter) {
    try {
      const url =
        activeFilter === '全部'
          ? '/api/tasks'
          : `/api/tasks?priority=${encodeURIComponent(activeFilter)}`;
      const res = await fetch(url);
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || '加载失败');
      setTasks(Array.isArray(body) ? body : []);
    } catch (e) {
      showTip(e.message, true);
      setTasks([]);
    }
  }

  // 筛选变化时重新加载
  useEffect(() => {
    loadTasks(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  /** 添加任务 */
  async function addTask(e) {
    e.preventDefault();
    const value = title.trim();
    if (!value) {
      showTip('请输入任务内容', true);
      return;
    }
    setAdding(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: value, priority }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || '添加失败');
      setTitle('');
      showTip('已添加任务');
      await loadTasks();
    } catch (err) {
      showTip(err.message, true);
    } finally {
      setAdding(false);
    }
  }

  /** 切换完成状态 */
  async function toggleTask(task) {
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || '更新失败');
      showTip(task.completed ? '已标记为未完成' : '已完成');
      await loadTasks();
    } catch (err) {
      showTip(err.message, true);
    }
  }

  /** 删除任务 */
  async function deleteTask(id) {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || '删除失败');
      }
      showTip('已删除任务');
      await loadTasks();
    } catch (err) {
      showTip(err.message, true);
    }
  }

  return (
    <main className="app">
      <header className="app-header">
        <h1>📋 智能任务管理</h1>
        <p className="subtitle">Node.js + React + Supabase 驱动，任务云端存储</p>
      </header>

      {/* 添加任务 */}
      <form className="add-panel" onSubmit={addTask}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="输入新任务，按回车或点击添加…"
          maxLength={100}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          aria-label="优先级"
        >
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {p === '高' ? '🔴 高' : p === '中' ? '🟡 中' : '🟢 低'}
            </option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary" disabled={adding}>
          添加
        </button>
      </form>

      {/* 优先级筛选 */}
      <section className="filter-bar">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            className={'filter-btn' + (filter === f ? ' active' : '')}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </section>

      {/* 任务列表（已完成加删除线） */}
      <ul className="task-list">
        {tasks.length === 0 ? (
          <li className="empty">暂无任务，添加一个吧 ✨</li>
        ) : (
          tasks.map((t) => (
            <li key={t.id} className={'task-item' + (t.completed ? ' done' : '')}>
              <span className="task-title">{t.title}</span>
              <span className={'priority tag-' + t.priority}>{t.priority}</span>
              <button
                type="button"
                className="btn-toggle"
                onClick={() => toggleTask(t)}
              >
                {t.completed ? '未完成' : '完成'}
              </button>
              <button
                type="button"
                className="btn-delete"
                onClick={() => deleteTask(t.id)}
              >
                删除
              </button>
            </li>
          ))
        )}
      </ul>

      {tip.text && (
        <p className={'status-tip' + (tip.error ? ' error' : '')}>{tip.text}</p>
      )}
    </main>
  );
}
