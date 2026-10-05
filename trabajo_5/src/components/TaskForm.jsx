import { useState, useEffect } from 'react';

const TaskForm = ({ onTaskAdded, editingTask, onTaskUpdated, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    project_name: '',
    activity_type: '',
    status: 'Nueva',
    summary: '',
    description: '',
    priority: 'Media',
    reporter: '',
    assignee: '',
    precondition: '',
    sprint: ''
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({ ...editingTask });
    } else {
      resetForm();
    }
  }, [editingTask]);

  const resetForm = () => {
    setFormData({
      project_name: '',
      activity_type: '',
      status: 'Nueva',
      summary: '',
      description: '',
      priority: 'Media',
      reporter: '',
      assignee: '',
      precondition: '',
      sprint: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    
    try {
      if (editingTask) {
        const response = await fetch(`${apiUrl}/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          const updatedTask = await response.json();
          onTaskUpdated(updatedTask);
          resetForm();
        }
      } else {
        const response = await fetch(`${apiUrl}/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
        if (response.ok) {
          const newTask = await response.json();
          onTaskAdded(newTask);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Hubo un error al guardar la tarea. Revisa la consola.');
    }
  };

  return (
    <div className="task-form-container">
      <h2>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label>Nombre del Proyecto *</label>
          <input type="text" name="project_name" value={formData.project_name} onChange={handleChange} required />
        </div>
        
        <div className="form-group">
          <label>Tipo de Actividad *</label>
          <input type="text" name="activity_type" value={formData.activity_type} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Resumen *</label>
          <input type="text" name="summary" value={formData.summary} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Descripción</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows="3"></textarea>
        </div>

        <div className="form-group">
          <label>Estado</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="Nueva">Nueva</option>
            <option value="En Progreso">En Progreso</option>
            <option value="Finalizada">Finalizada</option>
          </select>
        </div>

        <div className="form-group">
          <label>Prioridad</label>
          <select name="priority" value={formData.priority} onChange={handleChange}>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>
        </div>

        <div className="form-group">
          <label>Informador *</label>
          <input type="text" name="reporter" value={formData.reporter} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Persona asignada</label>
          <input type="text" name="assignee" value={formData.assignee} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Precondición</label>
          <input type="text" name="precondition" value={formData.precondition} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Sprint</label>
          <input type="text" name="sprint" value={formData.sprint} onChange={handleChange} />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary">
            {editingTask ? 'Actualizar Tarea' : 'Crear Tarea'}
          </button>
          {editingTask && (
            <button type="button" className="btn-secondary" onClick={() => { resetForm(); onCancelEdit(); }}>
              Cancelar
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default TaskForm;
