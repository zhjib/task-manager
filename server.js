/**
 * 智能任务管理系统 - Node.js + Supabase 后端
 * 运行：npm install && npm start
 */
require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Supabase 客户端（凭证在 .env 中配置）
const supabase = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_ANON_KEY || ''
);

// 优先级取值（与数据库 check 约束一致）
const PRIORITIES = ['高', '中', '低'];

app.use(express.json());
app.use(express.static(path.join(__dirname, 'dist')));

/** 通用错误包装：把 Supabase 返回的中文提示直接透出 */
function errMsg(action, e) {
  // PostgREST 常见错误码提示
  const tips = {
    '42P01': '请先在 SQL Editor 执行 supabase/schema.sql 建表',
    'PGRST301': '数据库连接失败，请检查 SUPABASE_URL',
    '401': '凭证无效，请检查 SUPABASE_ANON_KEY'
  };
  for (const [code, tip] of Object.entries(tips)) {
    if (String(e.message || '').includes(code)) return `${action}失败：${tip}`;
  }
  return `${action}失败：${e.message}`;
}

/**
 * 获取任务列表
 * GET /api/tasks?priority=高|中|低 （不传或传"全部"则返回全部）
 * 按创建时间倒序
 */
app.get('/api/tasks', async (req, res) => {
  try {
    let query = supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });
    const { priority } = req.query;
    if (priority && priority !== '全部' && PRIORITIES.includes(priority)) {
      query = query.eq('priority', priority);
    }
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: errMsg('查询任务', e) });
  }
});

/**
 * 添加任务
 * POST /api/tasks  body: { title, priority }
 */
app.post('/api/tasks', async (req, res) => {
  try {
    const title = String(req.body.title || '').trim();
    if (!title) {
      return res.status(400).json({ error: '任务标题不能为空' });
    }
    const priority = PRIORITIES.includes(req.body.priority) ? req.body.priority : '中';
    const { data, error } = await supabase
      .from('tasks')
      .insert({ title, priority, completed: false })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (e) {
    res.status(500).json({ error: errMsg('添加任务', e) });
  }
});

/**
 * 切换完成状态
 * PATCH /api/tasks/:id  body: { completed: true|false }
 */
app.patch('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('tasks')
      .update({ completed: Boolean(req.body.completed) })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: '任务不存在' });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: errMsg('更新任务', e) });
  }
});

/**
 * 删除任务
 * DELETE /api/tasks/:id
 */
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    res.status(204).end();
  } catch (e) {
    res.status(500).json({ error: errMsg('删除任务', e) });
  }
});

// 本地运行：node server.js 时监听端口
// Vercel 部署：由平台加载导出的 app 作为 Serverless 函数
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`✅ 智能任务管理系统已启动：http://localhost:${PORT}`);
  });
}

module.exports = app;
