import { formatDate } from '../utils/dates';

const TaskList = ({ tasks, onEdit, onDelete, onFinish }) => {
  return (
    <div className="task-list-container">
      <h2>Listado de Tareas</h2>

      {(!tasks || tasks.length === 0) ? (
        <div className="task-list-empty">No hay tareas creadas aún.</div>
      ) : (
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
                {task.description && <p><strong>Descripción:</strong> {task.description}</p>}
                <p><strong>Prioridad:</strong> {task.priority}</p>
                <p><strong>Informador:</strong> {task.reporter}</p>
                <p><strong>Asignado a:</strong> {task.assignee || 'Sin asignar'}</p>
                {task.precondition && <p><strong>Precondición:</strong> {task.precondition}</p>}
                {task.sprint && <p><strong>Sprint:</strong> {task.sprint}</p>}
                <p><strong>Fecha de creación:</strong> {formatDate(task.created_at)}</p>
                <p><strong>Fecha de cierre:</strong> {formatDate(task.closed_at)}</p>
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
      )}
    </div>
  );
};

export default TaskList;
