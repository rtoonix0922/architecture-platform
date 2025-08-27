// backend/server.js (minimal, tenant-aware shell)
const express = require('express'); const jwt = require('jsonwebtoken'); const { Pool } = require('pg');
require('dotenv').config();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express(); app.use(express.json());

// auth (demo)
app.post('/auth/login', async (req,res) => {
  const { email, tenant_id="t1" } = req.body; // MVP: accept any known seed user
  const token = jwt.sign({ sub: email, tenant_id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

// tenant middleware
app.use((req, _, next) => {
  const auth = req.headers.authorization || ""; const token = auth.replace("Bearer ","");
  try { req.ctx = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  next();
});
const guardTenant = (req,res,next) => req.ctx?.tenant_id ? next() : res.status(401).json({error:"unauthorized"});

// example read endpoint
app.get('/projects', guardTenant, async (req,res) => {
  const { tenant_id } = req.ctx;
  const { rows } = await pool.query('SELECT id, title, status, budget FROM projects WHERE tenant_id=$1 ORDER BY id', [tenant_id]);
  res.json(rows);
});

app.listen(process.env.PORT, () => console.log('api on :'+process.env.PORT));
