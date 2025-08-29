module.exports = (...roles) => (req, res, next) => {
  const role = req.ctx?.role;
  if (!role || !roles.includes(role)) return res.status(403).json({ error: 'forbidden' });
  next();
};
