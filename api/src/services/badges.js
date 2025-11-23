const { db } = require('../database/db');

/**
 * Badge service using normalized `badges` and `user_badges` tables.
 */

async function ensureBadge(key, name, description = '', maxLevel = 1) {
  await db.query(
    'INSERT INTO badges(`key`, name, description, maxLevel) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE `key`=`key`',
    [key, name, description, maxLevel]
  );
  const r = await db.query('SELECT id, `key`, name, description, maxLevel FROM badges WHERE `key` = ?', [key]);
  return r.rows[0];
}

async function getUserBadge(userId, badgeId) {
  const r = await db.query('SELECT id, userId, badgeId, level FROM user_badges WHERE userId = ? AND badgeId = ?', [userId, badgeId]);
  return r.rowCount ? r.rows[0] : null;
}

async function upsertUserBadge(userId, badgeId, level) {
  const existing = await getUserBadge(userId, badgeId);
  if (!existing) {
    await db.query('INSERT INTO user_badges(userId, badgeId, level, createdAt, updatedAt) VALUES(?,?,?,NOW(),NOW())', [userId, badgeId, level]);
    return true;
  }
  if (level > existing.level) {
    await db.query('UPDATE user_badges SET level = ?, updatedAt = NOW() WHERE id = ?', [level, existing.id]);
    return true;
  }
  return false;
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

  const badge = await ensureBadge('streak', 'Seria', 'Przyznawana za utrzymanie serii aktywności. Poziomy przy 7, 14, 30, 90, 180 i 365 dniach.', 6);
  const level = streakToLevel(streak);
  if (level > 0) await upsertUserBadge(userId, badge.id, level);
}

async function checkAndAwardForPost(userId) {
  const r = await db.query('SELECT COUNT(*) AS cnt FROM posts WHERE userId = ?', [userId]);
  const cnt = (r.rows[0].cnt || 0);
  const badge = await ensureBadge('posts', 'Współtwórca', 'Utworzył wpis na forum (przyznawana za pierwszy post).', 1);
  // Award contributor at first post
  if (cnt >= 1) await upsertUserBadge(userId, badge.id, 1);
}

async function checkAndAwardForComment(userId) {
  const r = await db.query('SELECT COUNT(*) AS cnt FROM comments WHERE userId = ?', [userId]);
  const cnt = (r.rows[0].cnt || 0);
  const badge = await ensureBadge('comments', 'Komentujący', 'Skomentował wpis na forum (przyznawana za pierwszy komentarz).', 1);
  if (cnt >= 1) await upsertUserBadge(userId, badge.id, 1);
}

// Award 'Best Link' when a user's comment that contains a link reaches at least 10 likes
async function checkAndAwardForBestLink(commentId) {
  if (!commentId) return;
  const r = await db.query('SELECT id, userId, content, likes FROM comments WHERE id = ? LIMIT 1', [commentId]);
  if (!r.rowCount) return false;
  const row = r.rows[0];
  const content = row.content || '';
  const likes = Number(row.likes || 0);

  // Simple URL regex: looks for http(s):// or www. domains
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/i;
  if (!urlRegex.test(content)) return false;

  if (likes >= 10) {
    const badge = await ensureBadge('best_link', 'Najlepszy link', 'Opublikował komentarz zawierający link, który otrzymał przynajmniej 10 polubień.', 1);
    try {
      await upsertUserBadge(row.userId, badge.id, 1);
      return true;
    } catch (e) {
      console.error('checkAndAwardForBestLink failed', e && e.code ? e.code : e);
      return false;
    }
  }
  return false;
}

// Award 'Best Comment' when a comment becomes the top-liked comment under its post and has at least 10 likes
async function checkAndAwardForBestComment(commentId) {
  if (!commentId) return false;
  const r = await db.query('SELECT id, userId, postId, content, likes FROM comments WHERE id = ? LIMIT 1', [commentId]);
  if (!r.rowCount) return false;
  const row = r.rows[0];
  const likes = Number(row.likes || 0);
  if (likes < 10) return false;

  // Find top comment for the same post (highest likes). Tie-breaker: lowest id.
  const topRes = await db.query('SELECT id, userId, likes FROM comments WHERE postId = ? ORDER BY likes DESC, id ASC LIMIT 1', [row.postId]);
  if (!topRes.rowCount) return false;
  const top = topRes.rows[0];
  if (top.id !== commentId) return false;

  const badge = await ensureBadge('best_comment', 'Najlepszy komentarz', 'Opublikował najczęściej polubiony komentarz pod wpisem (wymaga co najmniej 10 polubień).', 1);
  try {
    await upsertUserBadge(row.userId, badge.id, 1);
    return true;
  } catch (e) {
    console.error('checkAndAwardForBestComment failed', e && e.code ? e.code : e);
    return false;
  }
}

// Award 'Account Age' based on the user's first checkin date
async function checkAndAwardForAccountAge(userId) {
  if (!userId) return false;
  try {
    const r = await db.query("SELECT MIN(date) AS firstDate FROM checkins WHERE userId = ? LIMIT 1", [userId]);
    if (!r.rowCount) return false;
    const firstDate = r.rows[0].firstDate;
    if (!firstDate) return false;

    const first = new Date(firstDate);
    const today = new Date();
    // normalize to UTC midnight to avoid DST/time issues
    const firstUtc = new Date(Date.UTC(first.getFullYear(), first.getMonth(), first.getDate()));
    const todayUtc = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
    const diffDays = Math.floor((todayUtc - firstUtc) / (1000 * 60 * 60 * 24));

    // thresholds in days for levels 1..4: 30, 180, 365, 730
    let level = 0;
    if (diffDays >= 730) level = 4;
    else if (diffDays >= 365) level = 3;
    else if (diffDays >= 180) level = 2;
    else if (diffDays >= 30) level = 1;

    const badge = await ensureBadge('account_age', 'Wiek konta', 'Przyznawana na podstawie daty pierwszego checkinu. Poziomy przy 30, 180, 365 i 730 dniach.', 4);
    if (level > 0) {
      await upsertUserBadge(userId, badge.id, level);
      return true;
    }
    return false;
  } catch (e) {
    console.error('checkAndAwardForAccountAge failed', e && e.code ? e.code : e);
    return false;
  }
}

module.exports = {
  ensureBadge,
  checkAndAwardForCheckin,
  checkAndAwardForPost,
  checkAndAwardForComment,
  checkAndAwardForBestLink,
  upsertUserBadge,
  checkAndAwardForAccountAge,
};
