const { verifyAccess } = require('../services/auth');

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, username: payload.username, email: payload.email };
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

// Optional variant: does not error if missing/invalid; leaves req.user undefined
function optionalAuth(req, _res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return next();
  try {
    const payload = verifyAccess(token);
    req.user = { id: payload.sub, username: payload.username, email: payload.email };
  } catch (e) {
    // ignore invalid token
  }
  return next();
}

module.exports = { authMiddleware, optionalAuth };