const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { db } = require('../database/db');
const {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
  persistRefreshToken,
  revokeRefreshToken,
  isRefreshTokenActive,
  setRefreshCookie,
  clearRefreshCookie,
} = require('../services/auth');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

router.post(
  '/register',
  body('username').isString().isLength({ min: 3, max: 30 }),
  body('email').isEmail().isLength({ max: 100 }),
  body('password').isString().isLength({ min: 6, max: 100 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { username, email, password } = req.body;

      const dup = await db.query(
        'SELECT 1 FROM users WHERE username = $1 OR email = $2 LIMIT 1',
        [username, email]
      );
      if (dup.rowCount) return res.status(409).json({ error: 'Username or email already in use' });

      const pwHash = hashPassword(password);
      const ins = await db.query(
        'INSERT INTO users(username, email, password) VALUES($1,$2,$3) RETURNING id, username, email',
        [username, email, pwHash]
      );

      const user = ins.rows[0];
      const accessToken = signAccessToken(user);
      const refreshToken = signRefreshToken(user);
      await persistRefreshToken(user.id, refreshToken, req.get('user-agent'), req.ip);
      setRefreshCookie(res, refreshToken);

      res.status(201).json({ user, accessToken });
    } catch (err) { next(err); }
  }
);

router.post(
  '/login',
  body('password').isString().isLength({ min: 6, max: 100 }),
  async (req, res, next) => {
    try {
      const { identifier, password } = req.body || {};
      if (!identifier) return res.status(400).json({ error: 'identifier (email or username) required' });

      const q = `
        SELECT id, username, email, password
        FROM users
        WHERE email = $1 OR username = $1
        LIMIT 1`;
      const r = await db.query(q, [identifier]);
      if (!r.rowCount) return res.status(401).json({ error: 'Invalid credentials' });

      const userRow = r.rows[0];
      if (!comparePassword(password, userRow.password)) return res.status(401).json({ error: 'Invalid credentials' });

      const user = { id: userRow.id, username: userRow.username, email: userRow.email };
      const accessToken = signAccessToken(user);
      const refreshToken = signRefreshToken(user);
      await persistRefreshToken(user.id, refreshToken, req.get('user-agent'), req.ip);
      setRefreshCookie(res, refreshToken);

      res.json({ user, accessToken });
    } catch (err) { next(err); }
  }
);

router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const r = await db.query('SELECT id, username, email FROM users WHERE id = $1', [req.user.id]);
    if (!r.rowCount) return res.status(404).json({ error: 'Not found' });
    res.json(r.rows[0]);
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const rt = req.cookies?.rt || req.body?.refreshToken;
    if (!rt) return res.status(401).json({ error: 'No refresh token' });

    if (!(await isRefreshTokenActive(rt))) return res.status(401).json({ error: 'Invalid refresh token' });

    const decoded = verifyRefresh(rt);
    const r = await db.query('SELECT id, username, email FROM users WHERE id = $1', [decoded.sub]);
    if (!r.rowCount) return res.status(401).json({ error: 'Invalid refresh token' });

    const user = r.rows[0];
    const accessToken = signAccessToken(user);

    const newRt = signRefreshToken(user);
    await revokeRefreshToken(rt);
    await persistRefreshToken(user.id, newRt, req.get('user-agent'), req.ip);
    setRefreshCookie(res, newRt);

    res.json({ accessToken, user });
  } catch (err) { next(err); }
});

router.post('/logout', async (req, res, next) => {
  try {
    const rt = req.cookies?.rt || req.body?.refreshToken;
    if (rt) await revokeRefreshToken(rt);
    clearRefreshCookie(res);
    res.status(204).send();
  } catch (err) { next(err); }
});

module.exports = router;