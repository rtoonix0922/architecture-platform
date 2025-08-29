const jwt = require('jsonwebtoken');

function attachContext(req, _res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  try { req.ctx = token ? jwt.verify(token, process.env.JWT_SECRET) : null; }
  catch { req.ctx = null; }
  next();
}

function guardTenant(req, res, next) {
  if (req.ctx?.tenant_id) return next();
  return res.status(401).json({ error: 'unauthorized' });
}

module.exports = { attachContext, guardTenant };
