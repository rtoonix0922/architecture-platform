// backend/server.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const pino = require('pino');               // fast logger
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { pool } = require('./db');
const { attachContext } = require('./middleware/auth');

const app = express();
const logger = pino();

// Middlewares
app.use(helmet());                          // security headers
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use((req, _res, next) => {              // simple request logging
  logger.info({ method: req.method, url: req.url });
  next();
});
app.use(attachContext);

// Health
app.get('/health', (_req, res) => res.send('ok'));

// Auth (password enforced)
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

// Routes
app.use('/projects', require('./routes/projects'));
app.use('/inquiries', require('./routes/inquiries')); 
app.use('/budgets', require('./routes/budgets'));     
app.use('/portfolio', require('./routes/portfolio'));
app.use('/procurement', require('./routes/procurement'));


// Start
app.listen(process.env.PORT, () => {
  logger.info({ msg: `api on :${process.env.PORT}` });
});
