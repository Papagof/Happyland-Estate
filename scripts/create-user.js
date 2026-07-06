// Creates or updates an admin/authorized login account.
// Usage: node scripts/create-user.js <username> <password> [admin|authorized]
require('dotenv').config({ path: '.env.local' });
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.PGHOST,
  port: process.env.PGPORT,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

async function main() {
  const [username, password, role = 'authorized'] = process.argv.slice(2);

  if (!username || !password) {
    console.error('Usage: node scripts/create-user.js <username> <password> [admin|authorized]');
    process.exit(1);
  }
  if (!['admin', 'authorized'].includes(role)) {
    console.error('role must be "admin" or "authorized"');
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await pool.query(
    `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)
     ON CONFLICT (username) DO UPDATE SET password_hash = $2, role = $3`,
    [username, passwordHash, role]
  );

  console.log(`User "${username}" saved with role "${role}".`);
  await pool.end();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
