const { Router } = require('express');
const { db } = require('../database/db');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = Router();

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
        const result = await db.query(
            'INSERT INTO users(username, password, email) VALUES($1,$2,$3) RETURNING id, username, email',
            [username, password, email]
        );
        res.status(201).json(result.rows[0]);
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

    const q = `
      SELECT
        p.id,
        p.title,
        p.content,
        p.datePosted AS dateposted,
        p.userId AS userid,
        p.likes,
        (CASE WHEN $3::INT IS NULL THEN false ELSE EXISTS(SELECT 1 FROM post_likes pl WHERE pl.postId = p.id AND pl.userId = $3) END) AS liked,
        u.username,
        u.avatar,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', c.id,
              'userid', c.userId,
              'postid', c.postId,
              'content', c.content,
              'dateposted', c.datePosted,
              'likes', c.likes,
              'liked', (CASE WHEN $3::INT IS NULL THEN false ELSE EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.commentId = c.id AND cl.userId = $3) END),
              'username', cu.username,
              'avatar', cu.avatar
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS comments
      FROM posts p
      LEFT JOIN users u ON u.id = p.userId
      LEFT JOIN comments c ON c.postId = p.id
      LEFT JOIN users cu ON cu.id = c.userId
      GROUP BY p.id, u.username, u.avatar
      ORDER BY ${orderColumn} ${direction}
      OFFSET $1 LIMIT $2;`;

    const result = await db.query(q, [offset, limit, userId]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/posts/:id', optionalAuth, async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const userId = req.user?.id || null;
        const postQ = 'SELECT p.id, p.title, p.content, p.datePosted AS dateposted, p.userId AS userid, p.likes AS likes, (CASE WHEN $2::INT IS NULL THEN false ELSE EXISTS(SELECT 1 FROM post_likes pl WHERE pl.postId = p.id AND pl.userId = $2) END) AS liked, u.username FROM posts p LEFT JOIN users u ON u.id = p.userId WHERE p.id = $1';
        const post = await db.query(postQ, [postId, userId]);
        if (!post.rows.length) return res.status(404).json({ error: 'Post not found' });

        const commentsQ = 'SELECT c.id, c.content, c.datePosted AS dateposted, c.userId AS userid, c.likes AS likes, (CASE WHEN $2::INT IS NULL THEN false ELSE EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.commentId = c.id AND cl.userId = $2) END) AS liked, u.username FROM comments c LEFT JOIN users u ON u.id = c.userId WHERE c.postId = $1 ORDER BY c.datePosted';
        const comments = await db.query(commentsQ, [postId, userId]);

        res.json({ post: post.rows[0], comments: comments.rows });
    } catch (err) { next(err); }
});

router.post('/posts', async (req, res, next) => {
    try {
        const { userId, title, content } = req.body;
        const datePosted = new Date().toISOString();
        const q = 'INSERT INTO posts(userId, title, content, datePosted) VALUES($1,$2,$3,$4) RETURNING id, userId AS userid, title, content, datePosted AS dateposted, likes AS likes';
        const result = await db.query(q, [userId, title, content, datePosted]);
        res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
});

// Comments
router.post('/posts/:id/comments', async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const { userId, content } = req.body;
        const datePosted = new Date().toISOString();
        const q = 'INSERT INTO comments(userId, postId, content, datePosted) VALUES($1,$2,$3,$4) RETURNING id, userId AS userid, postId AS postid, content, datePosted AS dateposted';
        const result = await db.query(q, [userId, postId, content, datePosted]);
        res.status(201).json(result.rows[0]);
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
      SELECT
        c.id,
        c.userId AS userid,
        c.postId AS postid,
        c.content,
        c.datePosted AS dateposted,
        c.likes AS likes,
        (CASE WHEN $4::INT IS NULL THEN false ELSE EXISTS(SELECT 1 FROM comment_likes cl WHERE cl.commentId = c.id AND cl.userId = $4) END) AS liked,
        u.username,
        u.avatar
      FROM comments c
      LEFT JOIN users u ON u.id = c.userId
      WHERE c.postId = $1
      ORDER BY c.datePosted ASC, c.id ASC
      OFFSET $2 LIMIT $3;
    `;
    const countQ = 'SELECT COUNT(*)::INT AS total FROM comments WHERE postId = $1';
    const [listResult, countResult] = await Promise.all([
      db.query(listQ, [postId, offset, limit, userId]),
      db.query(countQ, [postId])
    ]);
    res.json({ comments: listResult.rows, total: countResult.rows[0].total });
  } catch (err) { next(err); }
});

// Checkins
router.get('/checkins', async (req, res, next) => {
    try {
      // Explicitly format the `date` column as YYYY-MM-DD in the database to avoid
      // any client-side timezone/Date parsing issues in Node/pg.
      const q = `SELECT c.id,
                        c.userId AS userid,
                        c.stress,
                        c.energy,
                        c.description,
                        to_char(c.date, 'YYYY-MM-DD') AS date,
                        u.username
                 FROM checkins c
                 LEFT JOIN users u ON u.id = c.userId
                 ORDER BY c.date DESC`;
      const result = await db.query(q);
      res.json(result.rows);
    } catch (err) { next(err); }
});

router.post('/checkins', async (req, res, next) => {
    try {
      const { userId, stress, energy, description } = req.body;
      const date = new Date();
      const q = 'INSERT INTO checkins(userId, stress, energy, description, date) VALUES($1,$2,$3,$4,$5) RETURNING id, userId AS userid, stress, energy, description, date';
      const result = await db.query(q, [userId, stress, energy, description, date]);
      res.status(201).json(result.rows[0]);
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
    const exists = await db.query('SELECT id, likes FROM posts WHERE id = $1', [postId]);
    if (!exists.rowCount) return res.status(404).json({ error: 'Post not found' });
    // Insert like if not exists
    const ins = await db.query(
      'INSERT INTO post_likes(userId, postId) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id',
      [userId, postId]
    );
    if (ins.rowCount) {
      await db.query('UPDATE posts SET likes = likes + 1 WHERE id = $1', [postId]);
    }
    const count = await db.query('SELECT likes FROM posts WHERE id = $1', [postId]);
    res.json({ liked: true, likes: count.rows[0].likes });
  } catch (err) { next(err); }
});

router.delete('/posts/:id/like', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const postId = Number(req.params.id);
  if (Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });
  try {
    const del = await db.query('DELETE FROM post_likes WHERE userId = $1 AND postId = $2 RETURNING id', [userId, postId]);
    if (del.rowCount) {
      await db.query('UPDATE posts SET likes = GREATEST(likes - 1,0) WHERE id = $1', [postId]);
    }
    const count = await db.query('SELECT likes FROM posts WHERE id = $1', [postId]);
    res.json({ liked: false, likes: count.rows[0].likes });
  } catch (err) { next(err); }
});

// Likes endpoints (comments)
router.post('/comments/:id/like', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const commentId = Number(req.params.id);
  if (Number.isNaN(commentId)) return res.status(400).json({ error: 'Invalid comment id' });
  try {
    const exists = await db.query('SELECT id, likes FROM comments WHERE id = $1', [commentId]);
    if (!exists.rowCount) return res.status(404).json({ error: 'Comment not found' });
    const ins = await db.query(
      'INSERT INTO comment_likes(userId, commentId) VALUES($1,$2) ON CONFLICT DO NOTHING RETURNING id',
      [userId, commentId]
    );
    if (ins.rowCount) {
      await db.query('UPDATE comments SET likes = likes + 1 WHERE id = $1', [commentId]);
    }
    const count = await db.query('SELECT likes FROM comments WHERE id = $1', [commentId]);
    res.json({ liked: true, likes: count.rows[0].likes });
  } catch (err) { next(err); }
});

router.delete('/comments/:id/like', authMiddleware, async (req, res, next) => {
  const userId = req.user.id;
  const commentId = Number(req.params.id);
  if (Number.isNaN(commentId)) return res.status(400).json({ error: 'Invalid comment id' });
  try {
    const del = await db.query('DELETE FROM comment_likes WHERE userId = $1 AND commentId = $2 RETURNING id', [userId, commentId]);
    if (del.rowCount) {
      await db.query('UPDATE comments SET likes = GREATEST(likes - 1,0) WHERE id = $1', [commentId]);
    }
    const count = await db.query('SELECT likes FROM comments WHERE id = $1', [commentId]);
    res.json({ liked: false, likes: count.rows[0].likes });
  } catch (err) { next(err); }
});
