const { Router } = require('express');
const { db } = require('../database/db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');
const { analyzeCheckinAndProgress } = require('../services/ai');

const router = Router();

const { checkAndAwardForCheckin, checkAndAwardForPost } = require('../services/badges');

// Compute consecutive daily check-in streak ending today and persist on users.streak
async function computeAndUpdateStreak(userId) {
  if (!userId) return 0;
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

// Health
router.get('/', (req, res) => {
  res.json({ message: 'forum api' });
});

// Users
router.get('/users', async (req, res, next) => {
    try {
    const result = await db.query('SELECT id, username, email FROM users ORDER BY id');
        res.json(result.rows);
    } catch (err) { next(err); }
});

router.post('/users', async (req, res, next) => {
    try {
        const { username, password, email } = req.body;
        const ins = await db.query(
          'INSERT INTO users(username, password, email, streak) VALUES(?,?,?,?)',
          [username, password, email, 0]
        );
        const sel = await db.query('SELECT id, username, email FROM users WHERE id = ?', [ins.insertId]);
        res.status(201).json(sel.rows[0]);
    } catch (err) { next(err); }
});

// Posts
router.get('/posts', optionalAuth, async (req, res, next) => {
  try {
    const offset = Number(req.query.offset || 0);
    const limit = Number(req.query.limit || 20);
    const rawOrder = String(req.query.orderBy || 'dateposted').toLowerCase();
    const allowedOrder = new Set(['dateposted', 'likes']);
    const orderKey = allowedOrder.has(rawOrder) ? rawOrder : 'dateposted';
    const direction = String(req.query.direction || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const orderColumn = orderKey === 'dateposted' ? 'p.dateposted' : 'p.likes';
    const userId = req.user?.id || null;

    // 1. Fetch base posts
    const postsQ = `SELECT p.id,
                           p.title,
                           p.content,
                           p.datePosted AS dateposted,
                           p.userId AS userid,
                           p.likes,
                           u.username,
                           u.avatar
                    FROM posts p
                    LEFT JOIN users u ON u.id = p.userId
                    ORDER BY ${orderColumn} ${direction}
                    LIMIT ? OFFSET ?`;
    const postsRes = await db.query(postsQ, [limit, offset]);
    const posts = postsRes.rows;
    if (!posts.length) return res.json([]);

    // 2. Collect post IDs
    const postIds = posts.map(p => p.id);
    const placeholders = postIds.map(() => '?').join(',');

    // 3. Fetch comments for these posts
    const commentsQ = `SELECT c.id,
                              c.userId AS userid,
                              c.postId AS postid,
                              c.content,
                              c.datePosted AS dateposted,
                              c.likes,
                              u.username,
                              u.avatar
                       FROM comments c
                       LEFT JOIN users u ON u.id = c.userId
                       WHERE c.postId IN (${placeholders})
                       ORDER BY c.datePosted ASC, c.id ASC`;
    const commentsRes = await db.query(commentsQ, postIds);
    const comments = commentsRes.rows;

    // 4. Optionally fetch likes for user
    let likedPostIds = new Set();
    let likedCommentIds = new Set();
    if (userId) {
      const likedPostsQ = `SELECT postId FROM post_likes WHERE userId = ? AND postId IN (${placeholders})`;
      const likedPostsRes = await db.query(likedPostsQ, [userId, ...postIds]);
      likedPostIds = new Set(likedPostsRes.rows.map(r => r.postId));

      const commentIds = comments.map(c => c.id);
      if (commentIds.length) {
        const commentPlaceholders = commentIds.map(() => '?').join(',');
        const likedCommentsQ = `SELECT commentId FROM comment_likes WHERE userId = ? AND commentId IN (${commentPlaceholders})`;
        const likedCommentsRes = await db.query(likedCommentsQ, [userId, ...commentIds]);
        likedCommentIds = new Set(likedCommentsRes.rows.map(r => r.commentId));
      }
    }

    // 5. Attach comments to posts
    const commentsByPost = new Map();
    for (const c of comments) {
      if (!commentsByPost.has(c.postid)) commentsByPost.set(c.postid, []);
      commentsByPost.get(c.postid).push({
        id: c.id,
        userid: c.userid,
        postid: c.postid,
        content: c.content,
        dateposted: c.dateposted,
        likes: c.likes,
        liked: userId ? likedCommentIds.has(c.id) : false,
        username: c.username,
        avatar: c.avatar,
      });
    }

    const response = posts.map(p => ({
      id: p.id,
      title: p.title,
      content: p.content,
      dateposted: p.dateposted,
      userid: p.userid,
      likes: p.likes,
      liked: userId ? likedPostIds.has(p.id) : false,
      username: p.username,
      avatar: p.avatar,
      comments: commentsByPost.get(p.id) || [],
    }));

    res.json(response);
  } catch (err) { next(err); }
});

router.get('/posts/:id', optionalAuth, async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const userId = req.user?.id || null;
        const postQ = 'SELECT p.id, p.title, p.content, p.datePosted AS dateposted, p.userId AS userid, p.likes AS likes, IF(? IS NULL, FALSE, EXISTS(SELECT 1 FROM post_likes pl WHERE pl.postId = p.id AND pl.userId = ?)) AS liked, u.username FROM posts p LEFT JOIN users u ON u.id = p.userId WHERE p.id = ?';
        const post = await db.query(postQ, [userId, userId, postId]);
        if (!post.rows.length) return res.status(404).json({ error: 'Post not found' });

        const commentsQ = 'SELECT c.id, c.content, c.datePosted AS dateposted, c.userId AS userid, c.likes AS likes, IF(? IS NULL, FALSE, EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.commentId = c.id AND cl.userId = ?)) AS liked, u.username FROM comments c LEFT JOIN users u ON u.id = c.userId WHERE c.postId = ? ORDER BY c.datePosted';
        const comments = await db.query(commentsQ, [userId, userId, postId]);

        res.json({ post: post.rows[0], comments: comments.rows });
    } catch (err) { next(err); }
});

router.post('/posts', async (req, res, next) => {
    try {
        const { userId, title, content } = req.body;
        const datePosted = new Date().toISOString();
        const ins = await db.query('INSERT INTO posts(userId,title,content,datePosted,likes) VALUES(?,?,?,?,?)',[userId,title,content,datePosted,0]);
        const sel = await db.query('SELECT id, userId AS userid, title, content, datePosted AS dateposted, likes FROM posts WHERE id = ?', [ins.insertId]);
        try { await checkAndAwardForPost(userId); } catch (e) { /* ignore badge errors */ }
        res.status(201).json(sel.rows[0]);
    } catch (err) { next(err); }
});

// Comments
router.post('/posts/:id/comments', async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const { userId, content } = req.body;
        const datePosted = new Date().toISOString();
        const ins = await db.query('INSERT INTO comments(userId, postId, content, datePosted, likes) VALUES(?,?,?,?,?)',[userId, postId, content, datePosted, 0]);
        const sel = await db.query('SELECT id, userId AS userid, postId AS postid, content, datePosted AS dateposted FROM comments WHERE id = ?', [ins.insertId]);
        res.status(201).json(sel.rows[0]);
    } catch (err) { next(err); }
});

// Comments list (paginated)
router.get('/posts/:id/comments', optionalAuth, async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    if (Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });

    const offset = Number(req.query.offset || 0);
    const limit = Number(req.query.limit || 20);
    const userId = req.user?.id || null;

    const listQ = `
      SELECT c.id,
             c.userId AS userid,
             c.postId AS postid,
             c.content,
             c.datePosted AS dateposted,
             c.likes AS likes,
             IF(? IS NULL, FALSE, EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.commentId = c.id AND cl.userId = ?)) AS liked,
             u.username,
             u.avatar
      FROM comments c
      LEFT JOIN users u ON u.id = c.userId
      WHERE c.postId = ?
      ORDER BY c.datePosted ASC, c.id ASC
      LIMIT ? OFFSET ?`;
    const countQ = 'SELECT COUNT(*) AS total FROM comments WHERE postId = ?';
    const [listResult, countResult] = await Promise.all([
      db.query(listQ, [userId, userId, postId, limit, offset]),
      db.query(countQ, [postId])
    ]);
    res.json({ comments: listResult.rows, total: countResult.rows[0].total });
  } catch (err) { next(err); }
});

// Checkins
router.get('/checkins', async (req, res, next) => {
  try {
        const q = `SELECT c.id,
           c.userId AS userid,
           c.stress,
           c.energy,
           c.description,
           DATE_FORMAT(c.date,'%Y-%m-%d') AS date,
           COALESCE(a.moodScore, c.moodScore) AS moodScore,
           u.username
         FROM checkins c
         LEFT JOIN users u ON u.id = c.userId
         LEFT JOIN checkin_ai_analysis a ON a.checkinId = c.id AND a.userId = c.userId
         ORDER BY c.date DESC`;
    const result = await db.query(q);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/checkins', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { stress, energy, description } = req.body;

    // walidacja prostych pól
    if (
      typeof stress !== 'number' ||
      typeof energy !== 'number' ||
      stress < 0 || stress > 10 ||
      energy < 0 || energy > 10
    ) {
      return res.status(400).json({ error: 'stress and energy must be numbers 0–10' });
    }

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    // 1 checkin per day per user
    const existsQ = `SELECT id FROM checkins WHERE userId = ? AND date = ? LIMIT 1`;
    const exists = await db.query(existsQ, [userId, todayStr]);
    if (exists.rowCount) {
      return res.status(400).json({ error: 'You already submitted a check-in for today.' });
    }

    const date = todayStr; // zapis jako DATE
    const insertQ = `INSERT INTO checkins(userId, stress, energy, description, date, moodScore) VALUES(?,?,?,?,?,NULL)`;
    const ins = await db.query(insertQ, [userId, stress, energy, description || '', date]);
    const insertResultRow = await db.query('SELECT id, userId AS userid, stress, energy, description, date FROM checkins WHERE id = ?', [ins.insertId]);
    const insertResult = { rows: insertResultRow.rows };

    // update streak
    const streak = await computeAndUpdateStreak(userId);

    // pobierz historię moodScore dla użytkownika (ostatnie 90 dni)
    const historyQ = `SELECT moodScore FROM checkins WHERE userId = ? AND moodScore IS NOT NULL ORDER BY date ASC, id ASC`;
    const historyRes = await db.query(historyQ, [userId]);
    const moodScores = historyRes.rows.map(r => r.moodScore);

    // wywołanie GPT-5.1 (łączne: checkin + progres)
    const aiResult = await analyzeCheckinAndProgress({
      energy,
      stress,
      description: description || '',
      moodScores,
    });

    console.log('AI result:', aiResult);

    // zapisz wynik AI w osobnej tabeli
    const aiInsertQ = `INSERT INTO checkin_ai_analysis(userId, checkinId, moodScore, message, progressSummary)
                       VALUES(?,?,?,?,?)
                       ON DUPLICATE KEY UPDATE moodScore=VALUES(moodScore), message=VALUES(message), progressSummary=VALUES(progressSummary), createdAt=NOW()`;
    await db.query(aiInsertQ, [userId, insertResult.rows[0].id, aiResult.moodScore, aiResult.message, aiResult.progressSummary]);

    // zaktualizuj moodScore w samym checkinie (do heat mapy)
    await db.query('UPDATE checkins SET moodScore = ? WHERE id = ?', [aiResult.moodScore, insertResult.rows[0].id]);

    res.status(201).json({
      ...insertResult.rows[0],
      streak,
      ai: {
        moodScore: aiResult.moodScore,
        message: aiResult.message,
        progressSummary: aiResult.progressSummary,
      },
    });
  } catch (err) { next(err); }
});

module.exports = router;
// Likes endpoints (posts)
router.post('/posts/:id/like', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const postId = Number(req.params.id);
  if (Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });
  try {
    // Ensure post exists
    const exists = await db.query('SELECT id, likes FROM posts WHERE id = ?', [postId]);
    if (!exists.rowCount) return res.status(404).json({ error: 'Post not found' });
    // Insert like if not exists
    // Try insert, ignore duplicate error
    try {
      await db.query('INSERT INTO post_likes(userId, postId) VALUES(?,?)',[userId, postId]);
      await db.query('UPDATE posts SET likes = likes + 1 WHERE id = ?', [postId]);
    } catch (e) { /* duplicate like */ }
    const count = await db.query('SELECT likes FROM posts WHERE id = ?', [postId]);
    res.json({ liked: true, likes: count.rows[0].likes });
  } catch (err) { next(err); }
});

router.delete('/posts/:id/like', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const postId = Number(req.params.id);
  if (Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });
  try {
    const del = await db.query('DELETE FROM post_likes WHERE userId = ? AND postId = ?', [userId, postId]);
    if (del.rowCount) {
      await db.query('UPDATE posts SET likes = CASE WHEN likes > 0 THEN likes - 1 ELSE 0 END WHERE id = ?', [postId]);
    }
    const count = await db.query('SELECT likes FROM posts WHERE id = ?', [postId]);
    res.json({ liked: false, likes: count.rows[0].likes });
  } catch (err) { next(err); }
});

// Likes endpoints (comments)
router.post('/comments/:id/like', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const commentId = Number(req.params.id);
  if (Number.isNaN(commentId)) return res.status(400).json({ error: 'Invalid comment id' });
  try {
    const exists = await db.query('SELECT id, likes FROM comments WHERE id = ?', [commentId]);
    if (!exists.rowCount) return res.status(404).json({ error: 'Comment not found' });
    try {
      await db.query('INSERT INTO comment_likes(userId, commentId) VALUES(?,?)',[userId, commentId]);
      await db.query('UPDATE comments SET likes = likes + 1 WHERE id = ?', [commentId]);
    } catch (e) { /* duplicate like */ }
    const count = await db.query('SELECT likes FROM comments WHERE id = ?', [commentId]);
    res.json({ liked: true, likes: count.rows[0].likes });
  } catch (err) { next(err); }
});

router.delete('/comments/:id/like', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const commentId = Number(req.params.id);
  if (Number.isNaN(commentId)) return res.status(400).json({ error: 'Invalid comment id' });
  try {
    const del = await db.query('DELETE FROM comment_likes WHERE userId = ? AND commentId = ?', [userId, commentId]);
    if (del.rowCount) {
      await db.query('UPDATE comments SET likes = CASE WHEN likes > 0 THEN likes - 1 ELSE 0 END WHERE id = ?', [commentId]);
    }
    const count = await db.query('SELECT likes FROM comments WHERE id = ?', [commentId]);
    res.json({ liked: false, likes: count.rows[0].likes });
  } catch (err) { next(err); }
});
