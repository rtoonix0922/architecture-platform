// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');                   // ← add
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');             // ← add
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const app = express();

app.use(cors({ origin: true, credentials: true })); // ← add
app.use(express.json());

// auth (password-enforced)
app.post('/auth/login', async (req, res) => {
  const { email, password, tenant_id } = req.body;

  const { rows } = await pool.query(
    'SELECT email, password_hash, role, tenant_id FROM users WHERE email=$1',
    [email]
  );
  const user = rows[0];

  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password || '', user.password_hash || '');
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const tid = tenant_id || user.tenant_id;
  const token = jwt.sign(
    { sub: user.email, role: user.role, tenant_id: tid },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token });
});

// tenant middleware
app.use((req, _, next) => {
  const auth = req.headers.authorization || '';
  const token = auth.replace('Bearer ', '');
  try { req.ctx = jwt.verify(token, process.env.JWT_SECRET); } catch {}
  next();
});

const guardTenant = (req, res, next) =>
  req.ctx?.tenant_id ? next() : res.status(401).json({ error: 'unauthorized' });

app.get('/projects', guardTenant, async (req, res) => {
  const { tenant_id } = req.ctx;
  const { rows } = await pool.query(
    'SELECT id, title, status, budget FROM projects WHERE tenant_id=$1 ORDER BY id',
    [tenant_id]
  );
  res.json(rows);
});

app.listen(process.env.PORT, () => console.log('api on :' + process.env.PORT));
