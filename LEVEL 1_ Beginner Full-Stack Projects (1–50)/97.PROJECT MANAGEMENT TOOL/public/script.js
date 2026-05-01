let allTasks = [];
let currentFilter = 'all';
let currentSearch = '';

async function loadTasks() {
  try {
    const response = await fetch('/api/tasks');
    allTasks = await response.json();
    renderTasks();
    updateStats();
  } catch (error) {
    console.error('Error loading tasks:', error);
  }
}

async function addTask() {
  const title = document.getElementById('taskTitle').value.trim();
  const category = document.getElementById('taskCategory').value;
  const priority = document.getElementById('taskPriority').value;
  const dueDate = document.getElementById('taskDueDate').value;

  if (!title || !category || !priority || !dueDate) {
    alert('Please fill all fields');
    return;
  }

  try {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, category, priority, dueDate })
    });
    const newTask = await response.json();
    allTasks.push(newTask);
    
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskCategory').value = '';
    document.getElementById('taskPriority').value = '';
    document.getElementById('taskDueDate').value = '';

    renderTasks();
    updateStats();
  } catch (error) {
    console.error('Error adding task:', error);
  }
}

async function deleteTask(id) {
  if (!confirm('Are you sure?')) return;
  
  try {
    await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    allTasks = allTasks.filter(t => t.id !== id);
    renderTasks();
    updateStats();
  } catch (error) {
    console.error('Error deleting task:', error);
  }
}

async function toggleComplete(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;

  try {
    const response = await fetch(`/api/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !task.completed })
    });
    const updatedTask = await response.json();
    const index = allTasks.findIndex(t => t.id === id);
    allTasks[index] = updatedTask;
    renderTasks();
    updateStats();
  } catch (error) {
    console.error('Error updating task:', error);
  }
}

function filterTasks(filter) {
  currentFilter = filter;
  currentSearch = '';
  document.getElementById('searchInput').value = '';

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

  renderTasks();
}

function searchTasks() {
  currentSearch = document.getElementById('searchInput').value.toLowerCase();
  currentFilter = 'all';
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.querySelector('[data-filter="all"]').classList.add('active');
  renderTasks();
}

function getFilteredTasks() {
  let filtered = allTasks;

  if (currentSearch) {
    filtered = filtered.filter(task =>
      task.title.toLowerCase().includes(currentSearch) ||
      task.category.toLowerCase().includes(currentSearch)
    );
  } else if (currentFilter === 'active') {
    filtered = filtered.filter(t => !t.completed);
  } else if (currentFilter === 'completed') {
    filtered = filtered.filter(t => t.completed);
  } else if (currentFilter === 'High' || currentFilter === 'Medium' || currentFilter === 'Low') {
    filtered = filtered.filter(t => t.priority === currentFilter);
  }

  return filtered;
}

function renderTasks() {
  const tasksList = document.getElementById('tasksList');
  const filtered = getFilteredTasks();

  if (filtered.length === 0) {
    tasksList.innerHTML = `<div class="empty-state"><p>📭 No tasks found</p></div>`;
    return;
  }

  tasksList.innerHTML = filtered.map(task => `
    <div class="task-card ${task.completed ? 'completed' : ''}">
      <div class="task-left">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? 'checked' : ''} 
          onchange="toggleComplete(${task.id})"
        >
        <div class="task-content">
          <div class="task-title">${escapeHtml(task.title)}</div>
          <div class="task-meta">
            <span class="task-badge category-badge">${task.category}</span>
            <span class="task-badge priority-${task.priority.toLowerCase()}">${task.priority}</span>
            <span class="due-date">📅 ${formatDate(task.dueDate)}</span>
          </div>
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-delete" onclick="deleteTask(${task.id})">🗑 Delete</button>
      </div>
    </div>
  `).join('');
}

function updateStats() {
  const total = allTasks.length;
  const completed = allTasks.filter(t => t.completed).length;
  const pending = total - completed;

  document.getElementById('totalTasks').textContent = total;
  document.getElementById('completedTasks').textContent = completed;
  document.getElementById('pendingTasks').textContent = pending;
}

function formatDate(dateString) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

window.addEventListener('DOMContentLoaded', loadTasks);
