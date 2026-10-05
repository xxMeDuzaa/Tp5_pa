import express from 'express';
import pg from 'pg';
import cors from 'cors';

const { Pool } = pg;
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'task_db',
  database: process.env.DB_NAME || 'taskdb',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
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
  const {
    project_name, activity_type, status, summary, description,
    priority, reporter, assignee, precondition, sprint
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO tasks (project_name, activity_type, status, summary, description, priority, reporter, assignee, precondition, sprint)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [project_name, activity_type, status, summary, description, priority, reporter, assignee, precondition, sprint]
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
  const {
    project_name, activity_type, status, summary, description,
    priority, reporter, assignee, precondition, sprint
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE tasks SET 
        project_name = $1, activity_type = $2, status = $3, summary = $4, 
        description = $5, priority = $6, reporter = $7, assignee = $8, 
        precondition = $9, sprint = $10
       WHERE id = $11 RETURNING *`,
      [project_name, activity_type, status, summary, description, priority, reporter, assignee, precondition, sprint, id]
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

// PUT (finish) a task
app.put('/api/tasks/:id/finish', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE tasks SET status = 'Finalizada', closed_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [id]
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
