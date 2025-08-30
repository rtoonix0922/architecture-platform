const { Router } = require('express');
const { pool } = require('../db');
const allow = require('../rbac');
const { guardTenant } = require('../middleware/auth');
const { z } = require('zod');

const r = Router();

// ---- Schemas ----
const CreateSchema = z.object({
  title: z.string().min(1, 'title is required'),
  status: z.enum(['planned', 'in-progress', 'completed']).optional(),
  budget: z.coerce.number().nonnegative().optional(),
  region: z.string().trim().min(1).optional(),
  province: z.string().trim().min(1).optional(),
});

const UpdateSchema = z.object({
  title: z.string().min(1).optional(),
  status: z.enum(['planned', 'in-progress', 'completed']).optional(),
  budget: z.coerce.number().nonnegative().optional(),
  region: z.string().trim().min(1).optional(),
  province: z.string().trim().min(1).optional(),
});

// ---- Routes ----

// List projects
r.get('/', guardTenant, async (req, res) => {
  const { tenant_id } = req.ctx;
  const { rows } = await pool.query(
    'SELECT id, title, status, budget, region, province, progress_pct, proc_status FROM projects WHERE tenant_id=$1 ORDER BY id',
    [tenant_id]
  );
  res.json(rows);
});

// Get one project
r.get('/:id', guardTenant, async (req, res) => {
  const { tenant_id } = req.ctx;
  const { id } = req.params;
  const { rows } = await pool.query(
    'SELECT id, title, status, budget, region, province, abc_amount, contract_amount, proc_status, progress_pct FROM projects WHERE tenant_id=$1 AND id=$2',
    [tenant_id, id]
  );
  if (!rows[0]) return res.status(404).json({ error: 'not found' });
  res.json(rows[0]);
});

// Create project (Admin, Editor)
r.post('/', guardTenant, allow('Admin', 'Editor'), async (req, res) => {
  const parsed = CreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation', details: parsed.error.flatten() });
  }
  const { tenant_id } = req.ctx;
  const { title, status = 'planned', budget = 0, region = null, province = null } = parsed.data;

  const { rows } = await pool.query(
    `INSERT INTO projects(tenant_id,title,status,budget,region,province)
     VALUES ($1,$2,$3,$4,$5,$6)
     RETURNING id,title,status,budget,region,province`,
    [tenant_id, title, status, budget, region, province]
  );
  res.status(201).json(rows[0]);
});

// Update project (Admin, Editor)
r.put('/:id', guardTenant, allow('Admin', 'Editor'), async (req, res) => {
  const parsed = UpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'validation', details: parsed.error.flatten() });
  }
  const { tenant_id } = req.ctx; const { id } = req.params;
  const { title, status, budget, region, province } = parsed.data;

  const { rows } = await pool.query(
    `UPDATE projects
       SET title = COALESCE($1, title),
           status = COALESCE($2, status),
           budget = COALESCE($3, budget),
           region = COALESCE($4, region),
           province = COALESCE($5, province)
     WHERE id = $6 AND tenant_id = $7
     RETURNING id, title, status, budget, region, province`,
    [title ?? null, status ?? null, budget ?? null, region ?? null, province ?? null, id, tenant_id]
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
