import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);

  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${apiUrl}/tasks`);
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleTaskAdded = (newTask) => {
    setTasks([newTask, ...tasks]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/tasks/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleFinish = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/tasks/${id}/finish`, { method: 'PUT' });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(tasks.map(t => t.id === id ? updatedTask : t));
      }
    } catch (error) {
      console.error('Error finishing task:', error);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Manejador de Tareas</h1>
      </header>
      
      <main className="app-main">
        <TaskForm 
          onTaskAdded={handleTaskAdded} 
          editingTask={editingTask} 
          onTaskUpdated={handleTaskUpdated}
          onCancelEdit={() => setEditingTask(null)}
        />
        
        <TaskList 
          tasks={tasks} 
          onEdit={(task) => setEditingTask(task)} 
          onDelete={handleDelete}
          onFinish={handleFinish}
        />
      </main>
    </div>
  );
}

export default App;
