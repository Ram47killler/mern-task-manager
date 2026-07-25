const API_URL = 'https://mern-task-manager-awx8.onrender.com/api/tasks';

const taskForm = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

let tasks = [];
let currentFilter = 'all';

// Fetch all tasks from MongoDB
async function fetchTasks() {
  try {
    const res = await fetch(API_URL);
    tasks = await res.json();
    renderTasks();
  } catch (err) {
    console.error('Error fetching tasks:', err);
  }
}

// Render tasks based on filter
function renderTasks() {
  taskList.innerHTML = '';

  const filteredTasks = tasks.filter(task => {
    if (currentFilter === 'pending') return !task.completed;
    if (currentFilter === 'completed') return task.completed;
    return true; // 'all'
  });

  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = 'flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600';

    li.innerHTML = `
      <div class="flex items-center gap-3">
        <input 
          type="checkbox" 
          ${task.completed ? 'checked' : ''} 
          onchange="toggleTask('${task._id}', ${task.completed})"
          class="w-4 h-4 cursor-pointer accent-blue-500"
        >
        <span class="${task.completed ? 'line-through text-gray-500' : 'text-gray-100'}">
          ${task.text}
        </span>
      </div>
      <button 
        onclick="deleteTask('${task._id}')" 
        class="text-red-400 hover:text-red-300 font-bold px-2"
      >
        X
      </button>
    `;

    taskList.appendChild(li);
  });
}

// Add new task
taskForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = taskInput.value.trim();

  if (!text) return;

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (res.ok) {
      taskInput.value = '';
      fetchTasks();
    }
  } catch (err) {
    console.error('Error adding task:', err);
  }
});

// Toggle Task Complete / Incomplete
async function toggleTask(id, currentStatus) {
  try {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !currentStatus })
    });

    if (res.ok) {
      fetchTasks();
    }
  } catch (err) {
    console.error('Error updating task:', err);
  }
}

// Delete task
async function deleteTask(id) {
  try {
    const res = await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchTasks();
    }
  } catch (err) {
    console.error('Error deleting task:', err);
  }
}

// Set Filter
function setFilter(filter) {
  currentFilter = filter;
  
  // Update button UI styles for dark mode
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.replace('font-bold', 'font-normal');
    btn.classList.replace('text-blue-400', 'text-gray-400');
  });
  
  const activeBtn = document.getElementById(`filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
  activeBtn.classList.add('font-bold', 'text-blue-400');
  activeBtn.classList.remove('text-gray-400');

  renderTasks();
}

// Initial load
fetchTasks();