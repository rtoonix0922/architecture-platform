const { Router } = require('express');
const { pool } = require('../db');
const { guardTenant } = require('../middleware/auth');
const r = Router();

r.get('/overview', guardTenant, async (req, res) => {
  const { tenant_id } = req.ctx;
  const sql = `
    with base as (
      select
        count(*) as projects,
        coalesce(sum(budget),0) as allocated,
        coalesce(sum(contract_amount),0) as awarded
      from projects where tenant_id=$1
    ),
    by_stage as (
      select proc_status as stage, count(*) as cnt
      from projects where tenant_id=$1 group by proc_status
    )
    select (select row_to_json(base) from base) as kpis,
           (select json_agg(by_stage) from by_stage) as by_stage;
  `;
  const { rows } = await pool.query(sql, [tenant_id]);
  res.json(rows[0] || { kpis: {}, by_stage: [] });
});

module.exports = r;
