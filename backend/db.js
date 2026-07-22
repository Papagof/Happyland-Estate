import { Pool } from 'pg';

const globalForPg = globalThis;

if (!globalForPg._pool) {
  globalForPg._pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT) || 5432,
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE
  });
}

export default globalForPg._pool;
