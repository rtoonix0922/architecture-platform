const { Router } = require('express');
const { pool } = require('../db');
const { guardTenant } = require('../middleware/auth');

const r = Router();

r.get('/summary', guardTenant, async (req, res) => {
  const { tenant_id } = req.ctx;
  const sql = `
    SELECT p.id AS project_id, p.title,
           COALESCE(p.budget,0) AS allocated,
           COALESCE(SUM(e.amount),0) AS spent,
           COALESCE(p.budget,0) - COALESCE(SUM(e.amount),0) AS remaining
    FROM projects p
    LEFT JOIN project_expenses e
      ON e.project_id = p.id AND e.tenant_id = p.tenant_id
    WHERE p.tenant_id = $1
    GROUP BY p.id, p.title, p.budget
    ORDER BY p.id`;
  const { rows } = await pool.query(sql, [tenant_id]);
  res.json(rows);
});

module.exports = r;
