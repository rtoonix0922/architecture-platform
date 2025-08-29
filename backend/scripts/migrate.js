// backend/scripts/migrate.js

require('dotenv').config();
const { Pool } = require('pg'); 

const url = process.env.DATABASE_URL;
if (!url || typeof url !== 'string') {
  console.error('ERROR: DATABASE_URL is missing or not a string. Check backend/.env');
  process.exit(1);
}

const pool = new Pool({ connectionString: url});
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tenants (id text primary key, name text not null);
    CREATE TABLE IF NOT EXISTS users (
      id serial primary key, email text unique not null, password_hash text, role text not null, tenant_id text not null references tenants(id)
    );
    CREATE TABLE IF NOT EXISTS projects (
      id serial primary key, tenant_id text not null references tenants(id),
      title text not null, status text not null, budget numeric default 0
    );
    CREATE TABLE IF NOT EXISTS inquiries (
      id serial primary key, tenant_id text not null references tenants(id),
      name text, email text, message text, created_at timestamptz default now()
    );
    CREATE INDEX IF NOT EXISTS idx_projects_tenant ON projects(tenant_id, id);
    CREATE INDEX IF NOT EXISTS idx_inquiries_tenant ON inquiries(tenant_id, id);
  `);
  console.log('migrated'); process.exit(0);
})();
