const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/count', async (req, res) => {
  const result = await pool.query('SELECT COUNT(*) FROM residents');
  res.json({ count: Number(result.rows[0].count) });
});

router.use(requireAuth);

function toResident(row) {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone || '',
    email: row.email || '',
    streetName: row.street_name,
    houseNumber: row.house_number,
    type: row.type,
    occupation: row.occupation || '',
    moveInDate: row.move_in_date ? row.move_in_date.toISOString().slice(0, 10) : ''
  };
}

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM residents ORDER BY id');
  res.json(result.rows.map(toResident));
});

router.post('/', async (req, res) => {
  const { name, phone, email, streetName, houseNumber, type, occupation, moveInDate } = req.body;
  if (!name || !streetName || !houseNumber) {
    return res.status(400).json({ error: 'name, streetName and houseNumber are required' });
  }
  const result = await pool.query(
    `INSERT INTO residents (name, phone, email, street_name, house_number, type, occupation, move_in_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [name, phone || null, email || null, streetName, houseNumber, type || 'resident', occupation || null, moveInDate || null]
  );
  res.status(201).json(toResident(result.rows[0]));
});

router.put('/:id', async (req, res) => {
  const { name, phone, email, streetName, houseNumber, type, occupation, moveInDate } = req.body;
  const result = await pool.query(
    `UPDATE residents SET name=$1, phone=$2, email=$3, street_name=$4, house_number=$5, type=$6, occupation=$7, move_in_date=$8
     WHERE id=$9 RETURNING *`,
    [name, phone || null, email || null, streetName, houseNumber, type || 'resident', occupation || null, moveInDate || null, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Resident not found' });
  res.json(toResident(result.rows[0]));
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM residents WHERE id=$1', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
