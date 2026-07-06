const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth, requireAdmin);

function toUser(row) {
  return { id: row.id, username: row.username, role: row.role, createdAt: row.created_at };
}

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM users ORDER BY id');
  res.json(result.rows.map(toUser));
});

router.post('/', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  if (role && !['admin', 'authorized'].includes(role)) {
    return res.status(400).json({ error: 'role must be "admin" or "authorized"' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3) RETURNING *`,
      [username, passwordHash, role || 'authorized']
    );
    res.status(201).json(toUser(result.rows[0]));
  } catch (err) {
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Username already exists' });
    }
    throw err;
  }
});

router.delete('/:id', async (req, res) => {
  if (Number(req.params.id) === req.user.sub) {
    return res.status(400).json({ error: 'You cannot delete your own account' });
  }
  await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
