const express = require('express');
const crypto = require('crypto');
const pool = require('../db');

const router = express.Router();

function toPayment(row) {
  return {
    id: row.id,
    reference: row.reference,
    residentName: row.resident_name,
    propertyAddress: row.property_address,
    amount: row.amount,
    method: row.method,
    createdAt: row.created_at
  };
}

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM payments ORDER BY id DESC');
  res.json(result.rows.map(toPayment));
});

router.post('/', async (req, res) => {
  const { residentName, propertyAddress, amount, method } = req.body;
  if (!residentName || !propertyAddress || !amount) {
    return res.status(400).json({ error: 'residentName, propertyAddress and amount are required' });
  }
  const reference = 'PAY' + crypto.randomBytes(5).toString('hex').toUpperCase();
  const result = await pool.query(
    `INSERT INTO payments (reference, resident_name, property_address, amount, method)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [reference, residentName, propertyAddress, amount, method || 'bank_transfer']
  );
  res.status(201).json(toPayment(result.rows[0]));
});

module.exports = router;
