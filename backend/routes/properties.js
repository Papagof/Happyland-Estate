const express = require('express');
const pool = require('../db');

const router = express.Router();

function toProperty(row) {
  return {
    id: row.id,
    streetName: row.street_name,
    houseNumber: row.house_number,
    type: row.type,
    bedrooms: row.bedrooms != null ? row.bedrooms : '',
    bathrooms: row.bathrooms != null ? row.bathrooms : '',
    price: row.price != null ? row.price : '',
    description: row.description || '',
    available: row.available
  };
}

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM properties ORDER BY id');
  res.json(result.rows.map(toProperty));
});

router.post('/', async (req, res) => {
  const { streetName, houseNumber, type, bedrooms, bathrooms, price, description, available } = req.body;
  if (!streetName || !houseNumber) {
    return res.status(400).json({ error: 'streetName and houseNumber are required' });
  }
  const result = await pool.query(
    `INSERT INTO properties (street_name, house_number, type, bedrooms, bathrooms, price, description, available)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
    [streetName, houseNumber, type || 'rent', bedrooms || null, bathrooms || null, price || null, description || null, available !== false]
  );
  res.status(201).json(toProperty(result.rows[0]));
});

router.put('/:id', async (req, res) => {
  const { streetName, houseNumber, type, bedrooms, bathrooms, price, description, available } = req.body;
  const result = await pool.query(
    `UPDATE properties SET street_name=$1, house_number=$2, type=$3, bedrooms=$4, bathrooms=$5, price=$6, description=$7, available=$8
     WHERE id=$9 RETURNING *`,
    [streetName, houseNumber, type || 'rent', bedrooms || null, bathrooms || null, price || null, description || null, available !== false, req.params.id]
  );
  if (result.rows.length === 0) return res.status(404).json({ error: 'Property not found' });
  res.json(toProperty(result.rows[0]));
});

router.delete('/:id', async (req, res) => {
  await pool.query('DELETE FROM properties WHERE id=$1', [req.params.id]);
  res.status(204).end();
});

module.exports = router;
