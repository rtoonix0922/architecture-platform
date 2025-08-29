const { Router } = require('express');
const { pool } = require('../db');
const allow = require('../rbac');
const { guardTenant } = require('../middleware/auth');

const r = Router();

// Public submit (MVP defaults to t1; later derive from hostname or form)
r.post('/', async (req, res) => {
  const { name, email, message, tenant_id = 't1' } = req.body;
  await pool.query(
    'INSERT INTO inquiries(tenant_id,name,email,message) VALUES ($1,$2,$3,$4)',
    [tenant_id, name, email, message]
  );
  res.status(201).json({ ok: true });
});

// Tenant list
r.get('/', guardTenant, allow('Admin','Editor','Viewer'), async (req, res) => {
  const { tenant_id } = req.ctx;
  const { rows } = await pool.query(
    'SELECT id,name,email,message,created_at FROM inquiries WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT 50',
    [tenant_id]
  );
  res.json(rows);
});

module.exports = r;
