const { Router } = require('express');
const { pool } = require('../db');
const allow = require('../rbac');
const { guardTenant } = require('../middleware/auth');
const r = Router();

// list events
r.get('/events', guardTenant, async (req, res) => {
  const { tenant_id } = req.ctx;
  const { project_id } = req.query;
  const { rows } = await pool.query(
    `select id, project_id, type, stage, title, notes, url, amount, happened_at
     from procurement_events
     where tenant_id=$1 and ($2::int is null or project_id=$2)
     order by happened_at desc
     limit 500`,
    [tenant_id, project_id || null]
  );
  res.json(rows);
});

// add event (Admin/Editor)
r.post('/events', guardTenant, allow('Admin','Editor'), async (req, res) => {
  const { tenant_id } = req.ctx;
  const { project_id, type, stage, title, notes, url, amount, happened_at } = req.body || {};
  if (!project_id || !type) return res.status(400).json({ error:'project_id and type required' });

  const { rows } = await pool.query(
    `insert into procurement_events(tenant_id,project_id,type,stage,title,notes,url,amount,happened_at)
     values($1,$2,$3,$4,$5,$6,$7,$8, coalesce($9, now()))
     returning id, project_id, type, stage, title, notes, url, amount, happened_at`,
    [tenant_id, project_id, type, stage || null, title || null, notes || null, url || null, amount || null, happened_at || null]
  );
  res.status(201).json(rows[0]);
});

module.exports = r;
