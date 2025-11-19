const { db } = require('../database/db');

/**
 * Badge service using normalized `badges` and `user_badges` tables.
 */

async function ensureBadge(key, name, description = '', maxLevel = 1) {
  await db.query(
    `INSERT INTO badges(key, name, description, maxLevel) VALUES ($1,$2,$3,$4) ON CONFLICT (key) DO NOTHING`,
    [key, name, description, maxLevel]
  );
  const r = await db.query('SELECT id, key, name, description, maxlevel FROM badges WHERE key = $1', [key]);
  return r.rows[0];
}

async function getUserBadge(userId, badgeId) {
  const r = await db.query('SELECT id, userId, badgeId, level FROM user_badges WHERE userId = $1 AND badgeId = $2', [userId, badgeId]);
  return r.rowCount ? r.rows[0] : null;
}

async function upsertUserBadge(userId, badgeId, level) {
  const existing = await getUserBadge(userId, badgeId);
  if (!existing) {
    await db.query('INSERT INTO user_badges(userId, badgeId, level, createdAt, updatedAt) VALUES($1,$2,$3,NOW(),NOW())', [userId, badgeId, level]);
    return true;
  }
  if (level > existing.level) {
    await db.query('UPDATE user_badges SET level = $1, updatedAt = NOW() WHERE id = $2', [level, existing.id]);
    return true;
  }
  return false;
}

function streakToLevel(streak) {
  if (streak >= 100) return 4;
  if (streak >= 30) return 3;
  if (streak >= 7) return 2;
  if (streak >= 1) return 1;
  return 0;
}

async function checkAndAwardForCheckin(userId) {
  const datesRes = await db.query("SELECT to_char(date, 'YYYY-MM-DD') AS d FROM checkins WHERE userId = $1 GROUP BY d ORDER BY d DESC", [userId]);
  const dates = datesRes.rows.map(r => r.d);
  const dateSet = new Set(dates);

  const today = new Date();
  let cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  let streak = 0;
  while (true) {
    const key = `${cursor.getFullYear()}-${String(cursor.getMonth()+1).padStart(2,'0')}-${String(cursor.getDate()).padStart(2,'0')}`;
    if (dateSet.has(key)) {
      streak += 1;
      cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate() - 1);
    } else {
      break;
    }
  }

  await db.query('UPDATE users SET streak = $1 WHERE id = $2', [streak, userId]);

  const badge = await ensureBadge('streak', 'Streaker', 'Awarded for maintaining an activity streak.', 4);
  const level = streakToLevel(streak);
  if (level > 0) await upsertUserBadge(userId, badge.id, level);
}

async function checkAndAwardForPost(userId) {
  const r = await db.query('SELECT COUNT(*)::INT AS cnt FROM posts WHERE userId = $1', [userId]);
  const cnt = r.rows[0].cnt || 0;
  const badge = await ensureBadge('posts', 'Contributor', 'Created posts in the forum', 1);
  if (cnt >= 2) await upsertUserBadge(userId, badge.id, 1);
}

module.exports = {
  ensureBadge,
  checkAndAwardForCheckin,
  checkAndAwardForPost,
  upsertUserBadge,
};
