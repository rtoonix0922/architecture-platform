// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('./db');
const { attachContext } = require('./middleware/auth');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(attachContext);

// Auth (password enforced)
app.post('/auth/login', async (req, res) => {
  const { email, password, tenant_id } = req.body;
  const { rows } = await pool.query(
    'SELECT email, password_hash, role, tenant_id FROM users WHERE email=$1',
    [email]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password || '', user.password_hash || '')))
    return res.status(401).json({ error: 'Invalid credentials' });

  const tid = tenant_id || user.tenant_id;
  const token = jwt.sign(
    { sub: user.email, role: user.role, tenant_id: tid },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
  res.json({ token });
});

// Routes
app.use('/projects', require('./routes/projects'));
app.use('/inquiries', require('./routes/inquiries'));
app.use('/budgets', require('./routes/budgets')); // GET /budgets/summary

app.listen(process.env.PORT, () => console.log('api on :' + process.env.PORT));
