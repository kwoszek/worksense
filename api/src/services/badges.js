const { db } = require('../database/db');

// Badge definitions
const BADGES = {
  STREAK_10: { id: 'streak_10', name: '10-day streak', description: 'Checked in for 10 consecutive days' },
  POSTS_2: { id: 'posts_2', name: 'Contributor', description: 'Created 2 posts' },
};

async function getUser(userId) {
  const r = await db.query('SELECT id, badges, streak FROM users WHERE id = $1', [userId]);
  if (!r.rowCount) return null;
  return r.rows[0];
}

async function updateUserBadges(userId, badges) {
  // badges should be an array of strings for the TEXT[] column
  await db.query('UPDATE users SET badges = $1 WHERE id = $2', [badges, userId]);
}

function hasBadge(badges, badgeId) {
  if (!Array.isArray(badges)) return false;
  return badges.some((b) => (typeof b === 'string' ? b === badgeId : (b && b.id === badgeId)));
}

async function awardBadgeIfMissing(userId, badge) {
  const user = await getUser(userId);
  if (!user) return false;
  const current = user.badges || [];
  if (hasBadge(current, badge.id)) return false;
  const awarded = [...current, badge.id];
  await updateUserBadges(userId, awarded);
  return true;
}

async function checkAndAwardForCheckin(userId) {
  // compute streak for user using checkin dates
  const datesRes = await db.query("SELECT to_char(date, 'YYYY-MM-DD') AS d FROM checkins WHERE userId = $1 GROUP BY d ORDER BY d DESC", [userId]);
  const dates = datesRes.rows.map(r => r.d);
  const dateSet = new Set(dates);

  function localYMD(date) {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

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

  // update streak in users table if different
  await db.query('UPDATE users SET streak = $1 WHERE id = $2', [streak, userId]);

  // award badges based on streak
  if (streak >= 10) {
    await awardBadgeIfMissing(userId, BADGES.STREAK_10);
  }
}

async function checkAndAwardForPost(userId) {
  const r = await db.query('SELECT COUNT(*)::INT AS cnt FROM posts WHERE userId = $1', [userId]);
  const cnt = r.rows[0].cnt || 0;
  if (cnt >= 2) {
    await awardBadgeIfMissing(userId, BADGES.POSTS_2);
  }
}

module.exports = {
  BADGES,
  checkAndAwardForCheckin,
  checkAndAwardForPost,
  awardBadgeIfMissing,
};
