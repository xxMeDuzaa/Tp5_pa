import express from 'express';
import pg from 'pg';
import cors from 'cors';

const { Pool, types } = pg;
const app = express();
const port = 3000;

// Devolver TIMESTAMP (1114) y DATE (1082) como texto plano, sin convertirlos
// a Date de JS, para evitar corrimientos de día por zona horaria.
types.setTypeParser(1114, (value) => value);
types.setTypeParser(1082, (value) => value);

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'task_db',
  database: process.env.DB_NAME || 'taskdb',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Convierte strings vacíos en null para guardar campos opcionales correctamente
const toNull = (value) => (value === '' || value === undefined ? null : value);

// Valida que la fecha de cierre no sea anterior a la de creación
const invalidDates = (created_at, closed_at) =>
  created_at && closed_at && new Date(closed_at) < new Date(created_at);

const readTaskBody = (body) => ({
  project_name: body.project_name,
  activity_type: body.activity_type,
  status: body.status,
  summary: body.summary,
  description: toNull(body.description),
  priority: body.priority,
  reporter: body.reporter,
  assignee: toNull(body.assignee),
  precondition: toNull(body.precondition),
  created_at: toNull(body.created_at),
  closed_at: toNull(body.closed_at),
  sprint: toNull(body.sprint),
});

// GET all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST a new task
app.post('/api/tasks', async (req, res) => {
  const t = readTaskBody(req.body);

  if (invalidDates(t.created_at, t.closed_at)) {
    return res.status(400).json({ error: 'La fecha de cierre no puede ser anterior a la de creación' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO tasks (project_name, activity_type, status, summary, description, priority,
                          reporter, assignee, precondition, sprint, created_at, closed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
               COALESCE($11::timestamp, CURRENT_TIMESTAMP),
               CASE WHEN $3 = 'Finalizada' THEN COALESCE($12::timestamp, CURRENT_TIMESTAMP)
                    ELSE $12::timestamp END)
       RETURNING *`,
      [t.project_name, t.activity_type, t.status, t.summary, t.description, t.priority,
       t.reporter, t.assignee, t.precondition, t.sprint, t.created_at, t.closed_at]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT (edit) a task
app.put('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const t = readTaskBody(req.body);

  if (invalidDates(t.created_at, t.closed_at)) {
    return res.status(400).json({ error: 'La fecha de cierre no puede ser anterior a la de creación' });
  }

  try {
    const result = await pool.query(
      `UPDATE tasks SET
        project_name = $1, activity_type = $2, status = $3, summary = $4,
        description = $5, priority = $6, reporter = $7, assignee = $8,
        precondition = $9, sprint = $10,
        created_at = COALESCE($11::timestamp, created_at),
        closed_at = CASE WHEN $3 = 'Finalizada' THEN COALESCE($12::timestamp, CURRENT_TIMESTAMP)
                         ELSE $12::timestamp END
       WHERE id = $13 RETURNING *`,
      [t.project_name, t.activity_type, t.status, t.summary, t.description, t.priority,
       t.reporter, t.assignee, t.precondition, t.sprint, t.created_at, t.closed_at, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT (finish) a task: marca como Finalizada y completa la fecha de cierre
// (usa la fecha enviada por el frontend o, si no viene, la actual)
app.put('/api/tasks/:id/finish', async (req, res) => {
  const { id } = req.params;
  const closed_at = toNull(req.body?.closed_at);
  try {
    const result = await pool.query(
      `UPDATE tasks SET status = 'Finalizada',
              closed_at = COALESCE($2::timestamp, CURRENT_TIMESTAMP)
       WHERE id = $1 RETURNING *`,
      [id, closed_at]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE a task
app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on port ${port}`);
});
