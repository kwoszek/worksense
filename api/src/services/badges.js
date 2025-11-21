const { db } = require('../database/db');

/**
 * Badge service using normalized `badges` and `user_badges` tables.
 */

async function ensureBadge(key, name, description = '', maxLevel = 1) {
  try {
    await db.query(
      'INSERT INTO badges(`key`, name, description, maxLevel) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE `key`=`key`',
      [key, name, description, maxLevel]
    );
    const r = await db.query('SELECT id, `key`, name, description, maxLevel FROM badges WHERE `key` = ?', [key]);
    return r.rows[0];
  } catch (err) {
    console.error('ensureBadge error for', key, err && err.message ? err.message : err);
    throw err;
  }
}

async function getUserBadge(userId, badgeId) {
  const r = await db.query('SELECT id, userId, badgeId, level FROM user_badges WHERE userId = ? AND badgeId = ?', [userId, badgeId]);
  return r.rowCount ? r.rows[0] : null;
}

async function upsertUserBadge(userId, badgeId, level) {
  try {
    const existing = await getUserBadge(userId, badgeId);
    if (!existing) {
      const ins = await db.query('INSERT INTO user_badges(userId, badgeId, level, createdAt, updatedAt) VALUES(?,?,?,NOW(),NOW())', [userId, badgeId, level]);
      console.log('upsertUserBadge: inserted', { userId, badgeId, level, insertId: ins.insertId });
      return true;
    }
    if (level > existing.level) {
      await db.query('UPDATE user_badges SET level = ?, updatedAt = NOW() WHERE id = ?', [level, existing.id]);
      console.log('upsertUserBadge: updated', { userId, badgeId, level, id: existing.id });
      return true;
    }
    // no change
    return false;
  } catch (err) {
    console.error('upsertUserBadge error', err && err.message ? err.message : err, { userId, badgeId, level });
    return false;
  }
}

function streakToLevel(streak) {
  // Levels: 0 = none, 1 = 7 days, 2 = 14 days, 3 = 30 days, 4 = 90 days, 5 = 180 days, 6 = 365 days
  if (streak >= 365) return 6;
  if (streak >= 180) return 5;
  if (streak >= 90) return 4;
  if (streak >= 30) return 3;
  if (streak >= 14) return 2;
  if (streak >= 7) return 1;
  return 0;
}

async function checkAndAwardForCheckin(userId) {
  const datesRes = await db.query("SELECT DATE_FORMAT(date, '%Y-%m-%d') AS d FROM checkins WHERE userId = ? GROUP BY d ORDER BY d DESC", [userId]);
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

  await db.query('UPDATE users SET streak = ? WHERE id = ?', [streak, userId]);

  const badge = await ensureBadge('streak', 'Streaker', 'Awarded for maintaining an activity streak.', 6);
  const level = streakToLevel(streak);
  if (level > 0) await upsertUserBadge(userId, badge.id, level);
}

async function checkAndAwardForPost(userId) {
  const r = await db.query('SELECT COUNT(*) AS cnt FROM posts WHERE userId = ?', [userId]);
  const cnt = (r.rows[0].cnt || 0);
  const badge = await ensureBadge('posts', 'Contributor', 'Created posts in the forum', 1);
  // Award contributor at first post
  try {
    if (cnt >= 1) {
      const awarded = await upsertUserBadge(userId, badge.id, 1);
      if (awarded) console.log('checkAndAwardForPost: awarded Contributor to', userId, 'count', cnt);
    }
  } catch (err) {
    console.error('checkAndAwardForPost error', err && err.message ? err.message : err, { userId, cnt });
  }
}

async function checkAndAwardForComment(userId) {
  const r = await db.query('SELECT COUNT(*) AS cnt FROM comments WHERE userId = ?', [userId]);
  const cnt = (r.rows[0].cnt || 0);
  const badge = await ensureBadge('comments', 'Commenter', 'Commented on forum posts', 1);
  try {
    if (cnt >= 1) {
      const awarded = await upsertUserBadge(userId, badge.id, 1);
      if (awarded) console.log('checkAndAwardForComment: awarded Commenter to', userId, 'count', cnt);
    }
  } catch (err) {
    console.error('checkAndAwardForComment error', err && err.message ? err.message : err, { userId, cnt });
  }
}

module.exports = {
  ensureBadge,
  checkAndAwardForCheckin,
  checkAndAwardForPost,
  checkAndAwardForComment,
  upsertUserBadge,
};
