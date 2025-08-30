const { pool } = require('../db');
async function list(tenant_id){
  return (await pool.query(
    'SELECT id,title,status,budget FROM projects WHERE tenant_id=$1 ORDER BY id',[tenant_id]
  )).rows;
}
async function create(tenant_id,{title,status,budget}){
  return (await pool.query(
    'INSERT INTO projects(tenant_id,title,status,budget) VALUES($1,$2,$3,$4) RETURNING id,title,status,budget',
    [tenant_id,title,status,budget]
  )).rows[0];
}
async function update(tenant_id,id,{title,status,budget}){
  return (await pool.query(
    `UPDATE projects SET title=COALESCE($1,title), status=COALESCE($2,status), budget=COALESCE($3,budget)
     WHERE id=$4 AND tenant_id=$5 RETURNING id,title,status,budget`,
    [title ?? null, status ?? null, budget ?? null, id, tenant_id]
  )).rows[0] || null;
}
async function remove(tenant_id,id){
  const r = await pool.query('DELETE FROM projects WHERE id=$1 AND tenant_id=$2',[id,tenant_id]);
  return r.rowCount > 0;
}
module.exports = { list, create, update, remove };
