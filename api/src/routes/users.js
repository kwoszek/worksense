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
  if (!userId) return;
  // Ensure user still exists
  const userRes = await db.query('SELECT id FROM users WHERE id = ? LIMIT 1', [userId]);
  if (!userRes.rowCount) return;
  const level = computeStreakLevel(streak);
  if (level === 0) return; // nothing to assign
  // Ensure streak badge definition exists (create if missing)
  const badgeDef = await db.query('SELECT id, maxLevel FROM badges WHERE `key` = ?', ['streak']);
  let badgeId;
  if (!badgeDef.rowCount) {
    // Create definition
    await db.query('INSERT INTO badges(`key`, name, description, maxLevel) VALUES(?,?,?,?)', [
      'streak',
      'Streaker',
      'Awarded for maintaining an activity streak. Levels increase at 1,7,30,100 days.',
      4,
    ]);
    const newDef = await db.query('SELECT id FROM badges WHERE `key` = ? LIMIT 1', ['streak']);
    if (!newDef.rowCount) return; // give up silently
    badgeId = newDef.rows[0].id;
  } else {
    badgeId = badgeDef.rows[0].id;
  }
  // Safe insert/update
  try {
    await db.query(
      `INSERT INTO user_badges(userId,badgeId,level,createdAt,updatedAt)
       VALUES(?,?,?,NOW(),NOW())
       ON DUPLICATE KEY UPDATE level=VALUES(level), updatedAt=NOW()`,
      [userId, badgeId, level]
    );
  } catch (e) {
    // Foreign key issues: silently ignore to avoid crashing /me route
    console.error('upsertStreakBadge failed', e.code);
  }
}
async function getUserBadges(userId) {
  const q = `SELECT b.\`key\`, b.name, b.description, ub.level
             FROM user_badges ub
             JOIN badges b ON b.id = ub.badgeId
             WHERE ub.userId = ?
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
  const q = `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS d FROM checkins WHERE userId = ? GROUP BY d ORDER BY d DESC`;
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
  await db.query('UPDATE users SET streak = ? WHERE id = ?', [streak, userId]);
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
        'SELECT 1 FROM users WHERE username = ? OR email = ? LIMIT 1',
        [username, email]
      );
      if (dup.rowCount) return res.status(409).json({ error: 'Username or email already in use' });

      const pwHash = hashPassword(password);
      const ins = await db.query(
        'INSERT INTO users(username, email, password, avatar, streak) VALUES(?,?,?,?,?)',
        [username, email, pwHash, null, 0]
      );
      const rowData = await db.query('SELECT id, username, email, avatar, streak FROM users WHERE id = ?', [ins.insertId]);
      const row = rowData.rows[0];
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
        WHERE email = ? OR username = ?
        LIMIT 1`;
      const r = await db.query(q, [identifier, identifier]);
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
    // Refresh streak first
    const streak = await computeAndUpdateStreak(req.user.id);
    const r = await db.query('SELECT id, username, email, avatar, streak FROM users WHERE id = ?', [req.user.id]);
    if (!r.rowCount) return res.status(404).json({ error: 'Not found' });
    const row = r.rows[0];
    const user = {
      id: row.id,
      username: row.username,
      email: row.email,
      avatar: row.avatar ? Buffer.from(row.avatar).toString('base64') : null,
      streak: row.streak ?? streak ?? 0,
    };
    await upsertStreakBadge(user.id, user.streak);
    const badges = await getUserBadges(user.id);
    user.badges = badges;
    res.json(user);
  } catch (err) { next(err); }
});

  // Update current user's profile (username, email, avatar)
  router.put('/me', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { username, email, avatarBase64 } = req.body || {};

      // Fetch current user
      const curRes = await db.query('SELECT id, username, email, avatar, streak FROM users WHERE id = ? LIMIT 1', [userId]);
      if (!curRes.rowCount) return res.status(404).json({ error: 'User not found' });
      const current = curRes.rows[0];

      const nextUsername = typeof username === 'string' && username.trim().length ? username.trim() : current.username;
      const nextEmail = typeof email === 'string' && email.trim().length ? email.trim() : current.email;

      // Uniqueness checks if changed
      if (nextUsername !== current.username) {
        const dupU = await db.query('SELECT 1 FROM users WHERE username = ? AND id <> ? LIMIT 1', [nextUsername, userId]);
        if (dupU.rowCount) return res.status(400).json({ error: 'Username already taken' });
      }
      if (nextEmail !== current.email) {
        const dupE = await db.query('SELECT 1 FROM users WHERE email = ? AND id <> ? LIMIT 1', [nextEmail, userId]);
        if (dupE.rowCount) return res.status(400).json({ error: 'Email already taken' });
      }

      let avatarBuffer = current.avatar || null;
      if (typeof avatarBase64 === 'string' && avatarBase64.length) {
        try {
          // strip data URL prefix if present
          const cleaned = avatarBase64.replace(/^data:image\/[^;]+;base64,/, '');
          avatarBuffer = Buffer.from(cleaned, 'base64');
        } catch {
          return res.status(400).json({ error: 'Invalid avatar image data' });
        }
      }

      await db.query('UPDATE users SET username = ?, email = ?, avatar = ? WHERE id = ?', [
        nextUsername,
        nextEmail,
        avatarBuffer,
        userId,
      ]);

      const out = await db.query('SELECT id, username, email, avatar, streak FROM users WHERE id = ?', [userId]);
      const row = out.rows[0];
      const user = {
        id: row.id,
        username: row.username,
        email: row.email,
        avatar: row.avatar ? Buffer.from(row.avatar).toString('base64') : null,
        streak: row.streak ?? 0,
      };
      // issue fresh access token reflecting updated claims
      const { signAccessToken } = require('../services/auth');
      const accessToken = signAccessToken(user);
      return res.json({ user, accessToken });
    } catch (err) { next(err); }
  });

  // Change password
  router.post('/change-password', authMiddleware, async (req, res, next) => {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body || {};
      if (!oldPassword || !newPassword) return res.status(400).json({ error: 'oldPassword and newPassword required' });
      if (newPassword.length < 5 || newPassword.length > 100 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
        return res.status(400).json({ error: 'New password does not meet complexity requirements' });
      }
      const r = await db.query('SELECT id, password FROM users WHERE id = ? LIMIT 1', [userId]);
      if (!r.rowCount) return res.status(404).json({ error: 'User not found' });
      const stored = r.rows[0].password;
      // Use existing comparePassword helper via require to avoid duplication
      const { comparePassword, hashPassword } = require('../services/auth');
      if (!comparePassword(oldPassword, stored)) return res.status(400).json({ error: 'Old password incorrect' });
      const newHash = hashPassword(newPassword);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);
      return res.json({ ok: true });
    } catch (err) { next(err); }
  });

// Get current user's badges with metadata
router.get('/me/badges', authMiddleware, async (req, res, next) => {
  try {
    const q = `
      SELECT ub.badgeId AS id, b.key, b.name, b.description, ub.level, ub.createdAt, ub.updatedAt
      FROM user_badges ub
      JOIN badges b ON b.id = ub.badgeId
      WHERE ub.userId = ?
      ORDER BY ub.level DESC, ub.updatedAt DESC`;
    const r = await db.query(q, [req.user.id]);
    res.json(r.rows);
  } catch (err) { next(err); }
});

router.post('/refresh', async (req, res, next) => {
  try {
    const rt = req.cookies?.rt || req.body?.refreshToken;
    if (!rt) return res.status(401).json({ error: 'No refresh token' });

    if (!(await isRefreshTokenActive(rt))) return res.status(401).json({ error: 'Invalid refresh token' });

    const decoded = verifyRefresh(rt);
    const r = await db.query('SELECT id, username, email, avatar, streak FROM users WHERE id = ?', [decoded.sub]);
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