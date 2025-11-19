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
// Badge badge logic
const STREAK_LEVEL_THRESHOLDS = [1, 7, 30, 100]; // ascending thresholds for levels 1..4
function computeStreakLevel(streak) {
  let level = 0;
  for (let i = 0; i < STREAK_LEVEL_THRESHOLDS.length; i++) {
    if (streak >= STREAK_LEVEL_THRESHOLDS[i]) level = i + 1;
  }
  return level; // 0 means not earned yet
}
async function upsertStreakBadge(userId, streak) {
  const level = computeStreakLevel(streak);
  if (level === 0) return; // nothing to assign
  const badgeRow = await db.query('SELECT id, maxLevel FROM badges WHERE key=$1', ['streak']);
  if (!badgeRow.rowCount) return; // definition missing
  const badgeId = badgeRow.rows[0].id;
  await db.query(
    `INSERT INTO user_badges(userId,badgeId,level)
     VALUES($1,$2,$3)
     ON CONFLICT (userId,badgeId) DO UPDATE SET level=EXCLUDED.level, updatedAt=NOW()`,
    [userId, badgeId, level]
  );
}
async function getUserBadges(userId) {
  const q = `SELECT b.key, b.name, b.description, ub.level
             FROM user_badges ub
             JOIN badges b ON b.id = ub.badgeId
             WHERE ub.userId = $1
             ORDER BY b.id`;
  const r = await db.query(q, [userId]);
  return r.rows.map(row => ({
    key: row.key,
    name: row.name,
    description: row.description,
    level: row.level,
  }));
}

// Streak computation (same logic as forum.js) and persistence
async function computeAndUpdateStreak(userId) {
  const q = `SELECT to_char(date, 'YYYY-MM-DD') AS d FROM checkins WHERE userId = $1 GROUP BY d ORDER BY d DESC`;
  const r = await db.query(q, [userId]);
  const dates = new Set(r.rows.map(row => row.d));
  const today = new Date();
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let streak = 0;
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (dates.has(key)) {
      streak += 1;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
    } else {
      break;
    }
  }
  await db.query('UPDATE users SET streak = $2 WHERE id = $1', [userId, streak]);
  return streak;
}

const router = Router();

router.post(
  '/register',
  body('username').isString().isLength({ min: 3, max: 30 }),
  body('email').isEmail().isLength({ max: 100 }),
  body('password')
    .isString()
    .isLength({ min: 5, max: 100 }).withMessage('Password must be at least 5 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
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
        'INSERT INTO users(username, email, password) VALUES($1,$2,$3) RETURNING id, username, email, avatar, streak',
        [username, email, pwHash]
      );

      const row = ins.rows[0];
      const user = {
        id: row.id,
        username: row.username,
        email: row.email,
        avatar: row.avatar ? Buffer.from(row.avatar).toString('base64') : null,
        streak: row.streak ?? 0,
      };
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
  body('password')
    .isString()
    .isLength({ min: 5, max: 100 }).withMessage('Password must be at least 5 characters long')
    .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
    .matches(/\d/).withMessage('Password must contain at least one number'),
  async (req, res, next) => {
    try {
      const { identifier, password } = req.body || {};
      if (!identifier) return res.status(400).json({ error: 'identifier (email or username) required' });

      const q = `
        SELECT id, username, email, password, avatar, streak
        FROM users
        WHERE email = $1 OR username = $1
        LIMIT 1`;
      const r = await db.query(q, [identifier]);
      if (!r.rowCount) return res.status(401).json({ error: 'Invalid credentials' });

      const userRow = r.rows[0];
      if (!comparePassword(password, userRow.password)) return res.status(401).json({ error: 'Invalid credentials' });

      const user = {
        id: userRow.id,
        username: userRow.username,
        email: userRow.email,
        avatar: userRow.avatar ? Buffer.from(userRow.avatar).toString('base64') : null,
        streak: userRow.streak ?? 0,
      };
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
    await computeAndUpdateStreak(req.user.id);
    const r = await db.query('SELECT id, username, email, avatar, streak FROM users WHERE id = $1', [req.user.id]);
    if (!r.rowCount) return res.status(404).json({ error: 'Not found' });
    const row = r.rows[0];
    const user = {
      id: row.id,
      username: row.username,
      email: row.email,
      avatar: row.avatar ? Buffer.from(row.avatar).toString('base64') : null,
      streak: row.streak ?? 0,
    };
    await upsertStreakBadge(user.id, user.streak);
    const badges = await getUserBadges(user.id);
    user.badges = badges;
    res.json(user);
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const rt = req.cookies?.rt || req.body?.refreshToken;
    if (!rt) return res.status(401).json({ error: 'No refresh token' });

    if (!(await isRefreshTokenActive(rt))) return res.status(401).json({ error: 'Invalid refresh token' });

    const decoded = verifyRefresh(rt);
    const r = await db.query('SELECT id, username, email, avatar, streak FROM users WHERE id = $1', [decoded.sub]);
    if (!r.rowCount) return res.status(401).json({ error: 'Invalid refresh token' });

    const row = r.rows[0];
    const user = {
      id: row.id,
      username: row.username,
      email: row.email,
      avatar: row.avatar ? Buffer.from(row.avatar).toString('base64') : null,
      streak: row.streak ?? 0,
    };
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