import { useState, useEffect } from 'react';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import { todayLocal } from './utils/dates';
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
    setTasks(prev => [newTask, ...prev]);
  };

  const handleTaskUpdated = (updatedTask) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/tasks/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setTasks(prev => prev.filter(t => t.id !== id));
        // Si se elimina la tarea que se estaba editando, se cancela la edición
        setEditingTask(prev => (prev && prev.id === id ? null : prev));
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleFinish = async (id) => {
    try {
      const response = await fetch(`${apiUrl}/tasks/${id}/finish`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        // La fecha de cierre se completa automáticamente con la fecha de hoy
        body: JSON.stringify({ closed_at: todayLocal() })
      });
      if (response.ok) {
        const updatedTask = await response.json();
        setTasks(prev => prev.map(t => t.id === id ? updatedTask : t));
        setEditingTask(prev => (prev && prev.id === id ? null : prev));
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
