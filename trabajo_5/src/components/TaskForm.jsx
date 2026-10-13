import { useState, useEffect } from 'react';
import { todayLocal, toInputDate } from '../utils/dates';

const emptyForm = () => ({
  project_name: '',
  activity_type: '',
  status: 'Nueva',
  summary: '',
  description: '',
  priority: 'Media',
  reporter: '',
  assignee: '',
  precondition: '',
  created_at: todayLocal(),
  closed_at: '',
  sprint: ''
});

// Convierte una tarea traída de la API al formato del formulario (sin nulls)
const taskToForm = (task) => ({
  project_name: task.project_name ?? '',
  activity_type: task.activity_type ?? '',
  status: task.status ?? 'Nueva',
  summary: task.summary ?? '',
  description: task.description ?? '',
  priority: task.priority ?? 'Media',
  reporter: task.reporter ?? '',
  assignee: task.assignee ?? '',
  precondition: task.precondition ?? '',
  created_at: toInputDate(task.created_at),
  closed_at: toInputDate(task.closed_at),
  sprint: task.sprint ?? ''
});

const TaskForm = ({ onTaskAdded, editingTask, onTaskUpdated, onCancelEdit }) => {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData(emptyForm());
    setError('');
  };

  useEffect(() => {
    if (editingTask) {
      setFormData(taskToForm(editingTask));
      setError('');
    } else {
      resetForm();
    }
  }, [editingTask]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };
      // Si se marca como Finalizada y no tiene fecha de cierre, se completa con hoy
      if (name === 'status' && value === 'Finalizada' && !next.closed_at) {
        next.closed_at = todayLocal();
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.closed_at && formData.closed_at < formData.created_at) {
      setError('La fecha de cierre no puede ser anterior a la fecha de creación.');
      return;
    }

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const url = editingTask ? `${apiUrl}/tasks/${editingTask.id}` : `${apiUrl}/tasks`;
    const method = editingTask ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'No se pudo guardar la tarea.');
        return;
      }
      if (editingTask) {
        onTaskUpdated(data);
      } else {
        onTaskAdded(data);
      }
      resetForm();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError('Hubo un error al guardar la tarea. Verificá que el backend esté funcionando.');
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

        <div className="form-group full-width">
          <label>Resumen *</label>
          <input type="text" name="summary" value={formData.summary} onChange={handleChange} required />
        </div>

        <div className="form-group full-width">
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

        <div className="form-group full-width">
          <label>Precondición</label>
          <input type="text" name="precondition" value={formData.precondition} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label>Fecha de Creación *</label>
          <input type="date" name="created_at" value={formData.created_at} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Fecha de Cierre</label>
          <input
            type="date"
            name="closed_at"
            value={formData.closed_at}
            min={formData.created_at || undefined}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Sprint</label>
          <input type="text" name="sprint" value={formData.sprint} onChange={handleChange} />
        </div>

        {error && <p className="form-error full-width">{error}</p>}

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
