const express = require('express');
const app = express();
const path = require('path');

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

let tasks = [
  { id: 1, title: 'Design Dashboard', category: 'Design', priority: 'High', completed: false, dueDate: '2026-05-01' },
  { id: 2, title: 'Setup Database', category: 'Backend', priority: 'High', completed: false, dueDate: '2026-04-28' },
  { id: 3, title: 'Frontend Testing', category: 'Testing', priority: 'Medium', completed: false, dueDate: '2026-05-05' }
];

let nextId = 4;

app.get('/api/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
  const { title, category, priority, dueDate } = req.body;
  const newTask = {
    id: nextId++,
    title,
    category,
    priority,
    completed: false,
    dueDate
  };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

app.put('/api/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === parseInt(req.params.id));
  if (!task) return res.status(404).json({ error: 'Task not found' });
  
  Object.assign(task, req.body);
  res.json(task);
});

app.delete('/api/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  
  tasks.splice(index, 1);
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
