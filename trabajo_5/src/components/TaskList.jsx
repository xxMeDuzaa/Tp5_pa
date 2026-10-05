const TaskList = ({ tasks, onEdit, onDelete, onFinish }) => {
  if (!tasks || tasks.length === 0) {
    return <div className="task-list-empty">No hay tareas creadas aún.</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="task-list-container">
      <h2>Listado de Tareas</h2>
      <div className="task-grid">
        {tasks.map((task) => (
          <div key={task.id} className={`task-card ${task.status === 'Finalizada' ? 'task-finished' : ''}`}>
            <div className="task-header">
              <h3>{task.summary}</h3>
              <span className={`status-badge status-${task.status.replace(/\s+/g, '-').toLowerCase()}`}>
                {task.status}
              </span>
            </div>
            <div className="task-body">
              <p><strong>Proyecto:</strong> {task.project_name}</p>
              <p><strong>Actividad:</strong> {task.activity_type}</p>
              <p><strong>Prioridad:</strong> {task.priority}</p>
              <p><strong>Asignado a:</strong> {task.assignee || 'Sin asignar'}</p>
              <p><strong>Informador:</strong> {task.reporter}</p>
              {task.sprint && <p><strong>Sprint:</strong> {task.sprint}</p>}
              <p><strong>Creada:</strong> {formatDate(task.created_at)}</p>
              {task.closed_at && <p><strong>Cerrada:</strong> {formatDate(task.closed_at)}</p>}
            </div>
            
            <div className="task-actions">
              <button 
                className="btn-edit" 
                onClick={() => onEdit(task)}
                disabled={task.status === 'Finalizada'}
              >
                Editar
              </button>
              <button 
                className="btn-finish" 
                onClick={() => onFinish(task.id)}
                disabled={task.status === 'Finalizada'}
              >
                Finalizar
              </button>
              <button 
                className="btn-delete" 
                onClick={() => {
                  if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
                    onDelete(task.id);
                  }
                }}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
