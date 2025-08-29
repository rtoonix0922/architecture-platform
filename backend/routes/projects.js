const { Router } = require('express');
const { pool } = require('../db');
const allow = require('../rbac');
const { guardTenant } = require('../middleware/auth');

const r = Router();

// List projects
r.get('/', guardTenant, async (req, res) => {
  const { tenant_id } = req.ctx;
  const { rows } = await pool.query(
    'SELECT id, title, status, budget FROM projects WHERE tenant_id=$1 ORDER BY id',
    [tenant_id]
  );
  res.json(rows);
});

// Create project (Admin, Editor)
r.post('/', guardTenant, allow('Admin', 'Editor'), async (req, res) => {
  const { tenant_id } = req.ctx;
  const { title, status = 'planned', budget = 0 } = req.body;
  if (!title) return res.status(400).json({ error: 'title is required' });

  const { rows } = await pool.query(
    'INSERT INTO projects(tenant_id,title,status,budget) VALUES ($1,$2,$3,$4) RETURNING id,title,status,budget',
    [tenant_id, title, status, budget]
  );
  res.status(201).json(rows[0]);
});

// Update project (Admin, Editor)
r.put('/:id', guardTenant, allow('Admin', 'Editor'), async (req, res) => {
  const { tenant_id } = req.ctx; const { id } = req.params;
  const { title, status, budget } = req.body;

  const { rows } = await pool.query(
    `UPDATE projects
       SET title = COALESCE($1, title),
           status = COALESCE($2, status),
           budget = COALESCE($3, budget)
     WHERE id = $4 AND tenant_id = $5
     RETURNING id, title, status, budget`,
    [title ?? null, status ?? null, budget ?? null, id, tenant_id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

// Delete project (Admin)
r.delete('/:id', guardTenant, allow('Admin'), async (req, res) => {
  const { tenant_id } = req.ctx; const { id } = req.params;
  const rdel = await pool.query('DELETE FROM projects WHERE id=$1 AND tenant_id=$2', [id, tenant_id]);
  res.status(rdel.rowCount ? 204 : 404).end();
});

module.exports = r;
