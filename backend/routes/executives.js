const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/active-count', async (req, res) => {
  const result = await pool.query('SELECT COUNT(*) FROM executives WHERE is_active = true');
  res.json({ count: Number(result.rows[0].count) });
});

router.use(requireAuth);

function toExecutive(row) {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    term: row.term || '',
    phone: row.phone || '',
    isActive: row.is_active
  };
}

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM executives ORDER BY id');
  res.json(result.rows.map(toExecutive));
});

router.post('/', async (req, res) => {
  const { name, position, term, phone, isActive } = req.body;
  if (!name || !position) {
    return res.status(400).json({ error: 'name and position are required' });
  }
  const result = await pool.query(
    `INSERT INTO executives (name, position, term, phone, is_active)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [name, position, term || null, phone || null, isActive !== false]
  );
  res.status(201).json(toExecutive(result.rows[0]));
});

router.put('/:id', async (req, res) => {
  const { name, position, term, phone, isActive } = req.body;
  const result = await pool.query(
    `UPDATE executives SET name=$1, position=$2, term=$3, phone=$4, is_active=$5
     WHERE id=$6 RETURNING *`,
    [name, position, term || null, phone || null, isActive !== false, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Executive not found' });
  res.json(toExecutive(result.rows[0]));
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM executives WHERE id=$1', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
