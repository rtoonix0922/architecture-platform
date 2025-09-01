// backend/scripts/migrate.js
require("dotenv").config();
const { Pool } = require("pg");

const url = process.env.DATABASE_URL;
if (!url || typeof url !== "string") {
  console.error(
    "ERROR: DATABASE_URL is missing or not a string. Check backend/.env"
  );
  process.exit(1);
}
const pool = new Pool({ connectionString: url });

(async () => {
  // ---- Base tables ----
  await pool.query(`
    CREATE TABLE IF NOT EXISTS tenants (
      id   text PRIMARY KEY,
      name text NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id            serial PRIMARY KEY,
      email         text UNIQUE NOT NULL,
      password_hash text,
      role          text NOT NULL,
      tenant_id     text NOT NULL REFERENCES tenants(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
      id        serial PRIMARY KEY,
      tenant_id text NOT NULL REFERENCES tenants(id),
      title     text NOT NULL,
      status    text NOT NULL,
      budget    numeric DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS inquiries (
      id         serial PRIMARY KEY,
      tenant_id  text NOT NULL REFERENCES tenants(id),
      name       text,
      email      text,
      message    text,
      created_at timestamptz DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS project_expenses (
      id         serial PRIMARY KEY,
      tenant_id  text NOT NULL REFERENCES tenants(id),
      project_id int  NOT NULL REFERENCES projects(id),
      amount     numeric(14,2) NOT NULL,
      note       text,
      created_at timestamptz DEFAULT now()
    );
  `);

  // --- Projects: additional columns for procurement & geo ---
  await pool.query(`
    ALTER TABLE projects
      ADD COLUMN IF NOT EXISTS program text,
      ADD COLUMN IF NOT EXISTS region text,
      ADD COLUMN IF NOT EXISTS province text,
      ADD COLUMN IF NOT EXISTS city_muni text,
      ADD COLUMN IF NOT EXISTS latitude numeric,
      ADD COLUMN IF NOT EXISTS longitude numeric,
      ADD COLUMN IF NOT EXISTS abc_amount numeric,
      ADD COLUMN IF NOT EXISTS contract_amount numeric,
      ADD COLUMN IF NOT EXISTS contractor_id int,
      ADD COLUMN IF NOT EXISTS proc_status text DEFAULT 'ongoing',
      ADD COLUMN IF NOT EXISTS start_date date,
      ADD COLUMN IF NOT EXISTS target_end_date date,
      ADD COLUMN IF NOT EXISTS progress_pct int DEFAULT 0;
    CREATE INDEX IF NOT EXISTS idx_projects_region_status ON projects(tenant_id, region, proc_status);
  `);

  // --- Contractors ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS contractors(
      id serial PRIMARY KEY,
      tenant_id text NOT NULL REFERENCES tenants(id),
      name text NOT NULL,
      tax_id text,
      blacklist_flag boolean DEFAULT false,
      rating numeric
    );
    CREATE INDEX IF NOT EXISTS idx_contractors_tenant ON contractors(tenant_id, id);
  `);

  // --- Procurement events (timeline) ---
  await pool.query(`
    CREATE TABLE IF NOT EXISTS procurement_events(
      id serial PRIMARY KEY,
      tenant_id text NOT NULL REFERENCES tenants(id),
      project_id int NOT NULL REFERENCES projects(id),
      type text NOT NULL,           -- stage_changed | doc_uploaded | procurement_milestone
      stage text,                   -- optional: plan/preproc/... when relevant
      title text,
      notes text,
      url text,                     -- link to doc if any
      amount numeric,               -- for financial events if needed
      happened_at timestamptz NOT NULL DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_pe_tenant_proj ON procurement_events(tenant_id, project_id, happened_at);
  `);

  // ---- Helpful indexes (non-unique) ----
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_projects_tenant   ON projects(tenant_id, id);
    CREATE INDEX IF NOT EXISTS idx_inquiries_tenant  ON inquiries(tenant_id, id);
    CREATE INDEX IF NOT EXISTS idx_users_tenant      ON users(tenant_id, id);
    CREATE INDEX IF NOT EXISTS idx_expenses_tenant   ON project_expenses(tenant_id, project_id, id);
  `);

  // ---- Deduplicate existing data BEFORE unique indexes ----
  // projects: keep the lowest ctid per (tenant_id, title)
  await pool.query(`
    DELETE FROM projects p
    USING projects p2
    WHERE p.ctid < p2.ctid
      AND p.tenant_id = p2.tenant_id
      AND p.title     = p2.title;
  `);

  // inquiries: keep the lowest ctid per (tenant_id, email, message)
  await pool.query(`
    DELETE FROM inquiries i
    USING inquiries i2
    WHERE i.ctid < i2.ctid
      AND i.tenant_id = i2.tenant_id
      AND i.email     = i2.email
      AND i.message   = i2.message;
  `);

  // ---- Unique indexes (idempotent) ----
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_projects_tenant_title
      ON projects(tenant_id, title);
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_inquiries_tenant_email_message
      ON inquiries(tenant_id, email, message);
  `);

  // ---- Status check constraint (only add if missing) ----
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'projects_status_chk'
      ) THEN
        ALTER TABLE projects
        ADD CONSTRAINT projects_status_chk
        CHECK (status IN ('planned','in-progress','completed'));
      END IF;
    END
    $$;
  `);

  console.log("migrated");
  await pool.end();
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
