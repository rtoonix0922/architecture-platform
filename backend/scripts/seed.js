// backend/scripts/seed.js
const { Pool } = require('pg'); const bcrypt = require('bcryptjs');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
(async () => {
  await pool.query(`INSERT INTO tenants(id,name) VALUES ('t1','OpenAI Architects') ON CONFLICT DO NOTHING;`);
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(`
    INSERT INTO users(email,password_hash,role,tenant_id)
    VALUES ('admin@demo.com',$1,'Admin','t1')
    ON CONFLICT (email) DO NOTHING;
  `, [hash]);
  await pool.query(`
    INSERT INTO projects(tenant_id,title,status,budget) VALUES
    ('t1','Bridge Retrofit','in-progress',5000000),
    ('t1','Civic Center','planned',12000000),
    ('t1','Harbor Walk','completed',3200000)
  `);
  await pool.query(`
    INSERT INTO inquiries(tenant_id,name,email,message)
    VALUES ('t1','Jane Doe','jane@example.com','Requesting portfolio & budget info');
  `);
  console.log('seeded'); process.exit(0);
})();
