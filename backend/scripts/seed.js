require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const url = process.env.DATABASE_URL;
if (!url || typeof url !== 'string') {
  console.error('ERROR: DATABASE_URL is missing or not a string. Check backend/.env');
  process.exit(1);
}
const pool = new Pool({ connectionString: url });

(async () => {
  // tenant & user
  await pool.query(`INSERT INTO tenants(id,name) VALUES ('t1','OpenAI Architects') ON CONFLICT DO NOTHING;`);
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(`
    INSERT INTO users(email,password_hash,role,tenant_id)
    VALUES ('admin@demo.com',$1,'Admin','t1')
    ON CONFLICT (email) DO NOTHING;`, [hash]);

  // projects
  await pool.query(`
    INSERT INTO projects(tenant_id,title,status,budget,region,province,proc_status,progress_pct)
    VALUES 
      ('t1','Bridge Retrofit','in-progress',5000000,'NCR','Manila','ongoing',35),
      ('t1','Civic Center','planned',12000000,'Region IV-A','Laguna','plan',0),
      ('t1','Harbor Walk','completed',3200000,'NCR','Pasay','complete',100)
    ON CONFLICT (tenant_id, title) DO NOTHING;
  `);

  // fetch project ids
  const { rows: prows } = await pool.query(
    `SELECT id, title FROM projects WHERE tenant_id='t1' AND title IN ('Bridge Retrofit','Civic Center','Harbor Walk')`
  );

  // seed events only if a project has none yet
  for (const p of prows) {
    const { rows: has } = await pool.query(
      `SELECT 1 FROM procurement_events WHERE tenant_id='t1' AND project_id=$1 LIMIT 1`, [p.id]
    );
    if (has.length) continue;

    // insert a few sample events
    await pool.query(
      `INSERT INTO procurement_events(tenant_id,project_id,type,stage,title,notes,happened_at)
       VALUES
       ('t1',$1,'stage_changed','post','ITB posted','PhilGEPS ref: DEMO-ITB-001', now() - interval '40 days'),
       ('t1',$1,'procurement_milestone','open','Bid Opening','3 bidders submitted', now() - interval '32 days'),
       ('t1',$1,'stage_changed','award','Awarded','Winning bidder: Demo Builders Inc.', now() - interval '25 days'),
       ('t1',$1,'stage_changed','ntp','Notice to Proceed','NTP issued', now() - interval '20 days'),
       ('t1',$1,'progress_update','ongoing','Mobilization','Mobilized equipment to site', now() - interval '10 days')`,
      [p.id]
    );
  }

  console.log('seeded');
  await pool.end();
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  await pool.end();
  process.exit(1);
});
