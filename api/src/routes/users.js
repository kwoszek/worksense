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
const { checkAndAwardForAccountAge } = require('../services/badges');
let sharp;
try { sharp = require('sharp'); } catch { sharp = null; }
// Server-side reCAPTCHA verification helper
const https = require('https');
const querystring = require('querystring');

const mysqlLimitFromEnv = Number(process.env.MYSQL_MAX_PACKET_BYTES);
const MYSQL_MAX_PACKET_BYTES = Number.isFinite(mysqlLimitFromEnv) && mysqlLimitFromEnv > 0
  ? mysqlLimitFromEnv
  : 4 * 1024 * 1024;
const mysqlSafetyFromEnv = Number(process.env.MYSQL_PACKET_SAFETY_MARGIN);
const MYSQL_PACKET_SAFETY_MARGIN = Number.isFinite(mysqlSafetyFromEnv) && mysqlSafetyFromEnv >= 0
  ? mysqlSafetyFromEnv
  : 64 * 1024;
const MAX_AVATAR_DB_BYTES = Math.max(64 * 1024, MYSQL_MAX_PACKET_BYTES - MYSQL_PACKET_SAFETY_MARGIN);
const uploadLimitFromEnv = Number(process.env.AVATAR_UPLOAD_MAX_BYTES);
const AVATAR_UPLOAD_MAX_BYTES = Number.isFinite(uploadLimitFromEnv) && uploadLimitFromEnv > 0
  ? uploadLimitFromEnv
  : 40 * 1024 * 1024;
const avatarDimensionFromEnv = Number(process.env.AVATAR_MAX_DIMENSION);
const AVATAR_MAX_DIMENSION = Number.isFinite(avatarDimensionFromEnv) && avatarDimensionFromEnv > 0
  ? avatarDimensionFromEnv
  : 512;

function formatBytes(size) {
  if (!Number.isFinite(size) || size <= 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const idx = Math.min(units.length - 1, Math.floor(Math.log(size) / Math.log(1024)));
  return `${(size / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 1)} ${units[idx]}`;
}

function enforceAvatarDbLimit(buffer) {
  if (buffer.length > MAX_AVATAR_DB_BYTES) {
    const err = new Error(`Avatar too large after compression (> ${formatBytes(MAX_AVATAR_DB_BYTES)} allowed, MySQL max_allowed_packet ${formatBytes(MYSQL_MAX_PACKET_BYTES)})`);
    err.statusCode = 413;
    throw err;
  }
}

function verifyRecaptcha(token, remoteIp) {
  return new Promise((resolve, reject) => {
    if (!process.env.RECAPTCHA_SECRET) return resolve(false);
    const postData = querystring.stringify({
      secret: process.env.RECAPTCHA_SECRET,
      response: token,
      remoteip: remoteIp || ''
    });

    const options = {
      hostname: 'www.google.com',
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data || '{}');
          return resolve(Boolean(parsed.success));
        } catch (e) {
          return resolve(false);
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(postData);
    req.end();
  });
}
// Badge badge logic
const STREAK_LEVEL_THRESHOLDS = [7, 14, 30, 90, 180, 365]; // ascending thresholds for levels 1..6
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
      'Streak',
      'Awarded for maintaining an activity streak. Levels increase at 7,14,30,90,180,365 days.',
      6,
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
  const q = `SELECT b.\`key\` AS badgeKey, b.name, b.description, ub.level, ub.featured
             FROM user_badges ub
             JOIN badges b ON b.id = ub.badgeId
             WHERE ub.userId = ?
             ORDER BY b.id`;
  const r = await db.query(q, [userId]);
  return r.rows.map(row => ({
    key: row.badgeKey,
    name: row.name,
    description: row.description,
    level: row.level,
    featured: !!row.featured,
  }));
}

// Streak computation: consecutive days up to last checkin.
// Reset to 0 only if at least one full day gap (i.e. last checkin < today - 1 day)
async function computeAndUpdateStreak(userId) {
  const q = `SELECT DATE_FORMAT(date, '%Y-%m-%d') AS d FROM checkins WHERE userId = ? GROUP BY d ORDER BY d DESC`;
  const r = await db.query(q, [userId]);
  if (!r.rowCount) {
    await db.query('UPDATE users SET streak = 0 WHERE id = ?', [userId]);
    return 0;
  }
  const dateStrings = r.rows.map(row => row.d); // newest first
  const datesSet = new Set(dateStrings);

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const lastKey = dateStrings[0];
  const [ly, lm, ld] = lastKey.split('-').map(n => parseInt(n, 10));
  const lastDate = new Date(ly, lm - 1, ld);
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diffDays = Math.floor((todayDate - lastDate) / (1000 * 60 * 60 * 24));

  // Missed at least one full day: reset
  if (diffDays > 1) {
    await db.query('UPDATE users SET streak = 0 WHERE id = ?', [userId]);
    return 0;
  }

  // Build streak starting from last checkin date backwards
  let streak = 0;
  let cursor = new Date(lastDate);
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}-${String(cursor.getDate()).padStart(2, '0')}`;
    if (datesSet.has(key)) {
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
  body('username')
    .isString().withMessage('Nazwa użytkownika jest wymagana')
    .isLength({ min: 3, max: 30 }).withMessage('Nazwa użytkownika musi mieć od 3 do 30 znaków'),
  body('email')
    .isEmail().withMessage('Niepoprawny adres email')
    .isLength({ max: 100 }).withMessage('Email może mieć maksymalnie 100 znaków'),
  body('password')
    .isString().withMessage('Hasło jest wymagane')
    .isLength({ min: 5, max: 100 }).withMessage('Hasło musi mieć co najmniej 5 znaków')
    .matches(/[A-Z]/).withMessage('Hasło musi zawierać dużą literę')
    .matches(/\d/).withMessage('Hasło musi zawierać cyfrę'),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { username, email, password, captchaToken } = req.body;

      // Verify reCAPTCHA token server-side (if configured)
      if (process.env.RECAPTCHA_SECRET) {
        if (!captchaToken) return res.status(400).json({ error: 'Brak tokena captcha' });
        let passed = false;
        try {
          passed = await verifyRecaptcha(captchaToken, req.ip);
        } catch (e) {
          console.error('recaptcha verify error', e && e.code ? e.code : e);
          passed = false;
        }
        if (!passed) return res.status(400).json({ error: 'Weryfikacja reCAPTCHA nie powiodła się' });
      }


      const dup = await db.query(
        'SELECT 1 FROM users WHERE username = ? OR email = ? LIMIT 1',
        [username, email]
      );
      if (dup.rowCount) return res.status(409).json({ error: 'Nazwa użytkownika lub email jest już zajęty' });


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
        badges: [],
        featuredBadges: [],
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
    .isString().withMessage('Hasło jest wymagane')
    .isLength({ min: 5, max: 100 }).withMessage('Hasło musi mieć co najmniej 5 znaków')
    .matches(/[A-Z]/).withMessage('Hasło musi zawierać dużą literę')
    .matches(/\d/).withMessage('Hasło musi zawierać cyfrę'),
  async (req, res, next) => {
    try {
      const { identifier, password } = req.body || {};
      if (!identifier) return res.status(400).json({ error: 'Nazwa użytkownika lub email jest wymagany' });

      const q = `
        SELECT id, username, email, password, avatar, streak
        FROM users
        WHERE email = ? OR username = ?
        LIMIT 1`;
      const r = await db.query(q, [identifier, identifier]);
      if (!r.rowCount) return res.status(401).json({ error: 'Niepoprawna nazwa użytkownika lub hasło' });

      const userRow = r.rows[0];
      if (!comparePassword(password, userRow.password)) return res.status(401).json({ error: 'Niepoprawna nazwa użytkownika lub hasło' });

      const badges = await getUserBadges(userRow.id);
      const user = {
        id: userRow.id,
        username: userRow.username,
        email: userRow.email,
        avatar: userRow.avatar ? Buffer.from(userRow.avatar).toString('base64') : null,
        streak: userRow.streak ?? 0,
        badges,
        featuredBadges: badges.filter(b => b.featured),
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
    // Award account-age badge based on first checkin date
    try { await checkAndAwardForAccountAge(user.id); } catch (e) { /* ignore badge errors */ }
    const badges = await getUserBadges(user.id);
    user.badges = badges;
      user.featuredBadges = badges.filter(b => b.featured);
      res.json(user);
  } catch (err) { next(err); }
});

      router.put('/me/featured-badges', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const incoming = req.body?.badgeKeys ?? req.body?.badges ?? [];
    if (!Array.isArray(incoming)) return res.status(400).json({ error: 'badgeKeys must be an array' });

    const normalized = [...new Set(
      incoming
        .filter(key => typeof key === 'string')
        .map(key => key.trim())
        .filter(Boolean)
    )];

    if (normalized.length > 3) {
      return res.status(400).json({ error: 'Możesz wyróżnić maksymalnie 3 odznaki' });
    }

    if (normalized.length) {
      const placeholders = normalized.map(() => '?').join(',');
      const ownedQ = `SELECT b.\`key\` AS badgeKey
                      FROM user_badges ub
                      JOIN badges b ON b.id = ub.badgeId
                      WHERE ub.userId = ? AND b.\`key\` IN (${placeholders})`;
      const ownedRes = await db.query(ownedQ, [userId, ...normalized]);
      const ownedKeys = new Set(ownedRes.rows.map(r => r.badgeKey));
      const missing = normalized.filter(key => !ownedKeys.has(key));
      if (missing.length) {
        return res.status(400).json({ error: 'Nie posiadasz jednej z wybranych odznak' });
      }
    }

    await db.query('UPDATE user_badges SET featured = 0 WHERE userId = ?', [userId]);
    if (normalized.length) {
      const placeholders = normalized.map(() => '?').join(',');
      const updateQ = `UPDATE user_badges ub
                       JOIN badges b ON b.id = ub.badgeId
                       SET ub.featured = 1
                       WHERE ub.userId = ? AND b.\`key\` IN (${placeholders})`;
      await db.query(updateQ, [userId, ...normalized]);
    }

    const badges = await getUserBadges(userId);
    res.json({ badges, featuredBadges: badges.filter(b => b.featured) });
  } catch (err) { next(err); }
});

router.delete('/me', authMiddleware, async (req, res, next) => {
  try {
    const q = 'DELETE FROM users WHERE id = ?';
    const r = await db.query(q, [req.user.id]);
    res.json({ ok: true });
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
        const cleaned = avatarBase64.replace(/^data:image\/[^;]+;base64,/, '');
        let raw;
        try { raw = Buffer.from(cleaned, 'base64'); } catch { return res.status(400).json({ error: 'Invalid avatar image data' }); }
        if (raw.length > AVATAR_UPLOAD_MAX_BYTES) {
          return res.status(413).json({ error: `Avatar too large (> ${formatBytes(AVATAR_UPLOAD_MAX_BYTES)})` });
        }
        if (sharp) {
          try {
            const img = sharp(raw).resize({ width: AVATAR_MAX_DIMENSION, height: AVATAR_MAX_DIMENSION, fit: 'cover' }).png({ quality: 80, compressionLevel: 8 });
            const compressed = await img.toBuffer();
            enforceAvatarDbLimit(compressed);
            avatarBuffer = compressed;
          } catch (e) {
            if (e?.statusCode === 413) {
              return res.status(413).json({ error: e.message });
            }
            return res.status(400).json({ error: 'Przetwarzanie awatara nie powiodło się' });
          }
        } else {
          try {
            enforceAvatarDbLimit(raw);
          } catch (limitErr) {
            return res.status(413).json({ error: limitErr.message });
          }
          avatarBuffer = raw;
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

  // Change password with granular validation messages
  router.post(
    '/change-password',
    authMiddleware,
    body('oldPassword')
      .isString().withMessage('Stare hasło jest wymagane')
      .isLength({ min: 1 }).withMessage('Stare hasło jest wymagane'),
    body('newPassword')
      .isString().withMessage('Nowe hasło jest wymagane')
      .isLength({ min: 5 }).withMessage('Nowe hasło musi mieć co najmniej 5 znaków')
      .isLength({ max: 100 }).withMessage('Nowe hasło może mieć maksymalnie 100 znaków')
      .matches(/[A-Z]/).withMessage('Nowe hasło musi zawierać dużą literę')
      .matches(/\d/).withMessage('Nowe hasło musi zawierać cyfrę'),
    async (req, res, next) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
        const userId = req.user.id;
        const { oldPassword, newPassword } = req.body || {};
        const r = await db.query('SELECT id, password FROM users WHERE id = ? LIMIT 1', [userId]);
        if (!r.rowCount) return res.status(404).json({ error: 'Użytkownik nie znaleziony' });
        const stored = r.rows[0].password;
        const { comparePassword, hashPassword } = require('../services/auth');
        if (!comparePassword(oldPassword, stored)) return res.status(400).json({ error: 'Stare hasło niepoprawne' });
        if (oldPassword === newPassword) return res.status(400).json({ error: 'Nowe hasło musi różnić się od starego' });
        const newHash = hashPassword(newPassword);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [newHash, userId]);
        return res.json({ ok: true });
      } catch (err) { next(err); }
    }
  );

// Get current user's badges with metadata
router.get('/me/badges', authMiddleware, async (req, res, next) => {
  try {
    const badges = await getUserBadges(req.user.id);
    res.json(badges);
  } catch (err) { next(err); }
});

router.put('/me/featured-badges', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const incoming = req.body?.badgeKeys ?? req.body?.badges ?? [];
    if (!Array.isArray(incoming)) return res.status(400).json({ error: 'badgeKeys must be an array' });

    const normalized = [...new Set(
      incoming
        .filter(key => typeof key === 'string')
        .map(key => key.trim())
        .filter(Boolean)
    )];

    if (normalized.length > 3) {
      return res.status(400).json({ error: 'Możesz wyróżnić maksymalnie 3 odznaki' });
    }

    if (normalized.length) {
      const placeholders = normalized.map(() => '?').join(',');
      const ownedQ = `SELECT b.\`key\` AS badgeKey
                      FROM user_badges ub
                      JOIN badges b ON b.id = ub.badgeId
                      WHERE ub.userId = ? AND b.\`key\` IN (${placeholders})`;
      const ownedRes = await db.query(ownedQ, [userId, ...normalized]);
      const ownedKeys = new Set(ownedRes.rows.map(r => r.badgeKey));
      const missing = normalized.filter(key => !ownedKeys.has(key));
      if (missing.length) {
        return res.status(400).json({ error: 'Nie posiadasz jednej z wybranych odznak' });
      }
    }

    await db.query('UPDATE user_badges SET featured = 0 WHERE userId = ?', [userId]);
    if (normalized.length) {
      const placeholders = normalized.map(() => '?').join(',');
      const updateQ = `UPDATE user_badges ub
                       JOIN badges b ON b.id = ub.badgeId
                       SET ub.featured = 1
                       WHERE ub.userId = ? AND b.\`key\` IN (${placeholders})`;
      await db.query(updateQ, [userId, ...normalized]);
    }

    const badges = await getUserBadges(userId);
    res.json({ badges, featuredBadges: badges.filter(b => b.featured) });
  } catch (err) { next(err); }
});

// Public endpoint: list all badge definitions
router.get('/badges', async (req, res, next) => {
  try {
    const q = 'SELECT id, `key`, name, description, maxLevel FROM badges ORDER BY id';
    const r = await db.query(q);
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
    const badges = await getUserBadges(user.id);
    user.badges = badges;
    user.featuredBadges = badges.filter(b => b.featured);
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

const crypto = require('crypto');
const { sendPasswordReset } = require('../services/mailer');

// Helper to optionally hash reset token before storing
function maybeHashToken(raw) {
  if (process.env.HASH_RESET_TOKEN === 'true') {
    return crypto.createHash('sha256').update(raw).digest('hex');
  }
  return raw;
}

// Request reset (always 200 to avoid user enumeration)
router.post('/request-password-reset', [
  body('email').isEmail().withMessage('Niepoprawny email')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(200).json({ ok: true });

    const { email } = req.body;
    const userRes = await db.query('SELECT id, username FROM users WHERE email = ? LIMIT 1', [email]);
    if (!userRes.rowCount) return res.status(200).json({ ok: true }); // silent

    const user = userRes.rows[0];
    const rawToken = crypto.randomBytes(32).toString('hex');
    const storedToken = maybeHashToken(rawToken);
    const ttlMin = Number(process.env.RESET_TOKEN_TTL_MINUTES || 30);
    const expiresAt = new Date(Date.now() + ttlMin * 60000);

    await db.query(
      'INSERT INTO password_reset_tokens(userId, token, expiresAt) VALUES(?,?,?)',
      [user.id, storedToken, expiresAt]
    );

    // Link always uses raw token (hash only stored when HASH_RESET_TOKEN=true)
    const link = `${process.env.APP_BASE_URL || 'https://worksense.pl'}/login?token=${rawToken}`;
    try {
      await sendPasswordReset(email, user.username, link);
    } catch (e) {
      console.error('Mail error', e);
    }
    return res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// Perform reset
router.post('/reset-password', [
  body('token').isLength({ min: 10 }).withMessage('Token wymagany'),
  body('password')
    .isLength({ min: 6 }).withMessage('Min 6 znaków')
    .matches(/[A-Z]/).withMessage('Wymagana wielka litera')
    .matches(/\d/).withMessage('Wymagana cyfra')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { token, password } = req.body;
    const lookupToken = maybeHashToken(token);

    const tokenRes = await db.query(
      'SELECT id, userId, expiresAt, used FROM password_reset_tokens WHERE token = ? LIMIT 1',
      [lookupToken]
    );
    if (!tokenRes.rowCount) return res.status(400).json({ error: 'Niepoprawny lub wygasły token' });

    const t = tokenRes.rows[0];
    if (t.used) return res.status(400).json({ error: 'Token już użyty' });
    if (new Date(t.expiresAt) < new Date()) return res.status(400).json({ error: 'Token wygasł' });

    // Fetch user
    const userRes = await db.query('SELECT id FROM users WHERE id = ? LIMIT 1', [t.userId]);
    if (!userRes.rowCount) return res.status(400).json({ error: 'Użytkownik nie istnieje' });

    const bcrypt = require('bcryptjs');
    const newHash = await bcrypt.hash(password, 10);

    // Use existing password column (named `password` in registration)
    await db.query('UPDATE users SET password = ? WHERE id = ?', [newHash, t.userId]);
    await db.query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [t.id]);

    return res.json({ ok: true, message: 'Hasło zaktualizowane' });
  } catch (err) {
    next(err);
  }
});

// router.post('/admin/cleanup-reset-tokens', async (req,res,next)=>{ ... });

module.exports = router;