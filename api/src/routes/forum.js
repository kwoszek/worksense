const { Router } = require('express');
const { db } = require('../database/db');

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
router.get('/posts', async (req, res, next) => {
  try {
    const offset = Number(req.query.offset || 0);
    const limit = Number(req.query.limit || 20);

    const q = `
      SELECT
        p.id,
        p.title,
        p.content,
        p.dateposted,
        p.userid,
        u.username,
        COALESCE(
          json_agg(
            jsonb_build_object(
              'id', c.id,
              'userid', c.userid,
              'postid', c.postid,
              'content', c.content,
              'dateposted', c.dateposted,
              'username', cu.username
            )
          ) FILTER (WHERE c.id IS NOT NULL),
          '[]'
        ) AS comments
      FROM posts p
      LEFT JOIN users u ON u.id = p.userid
      LEFT JOIN comments c ON c.postid = p.id
      LEFT JOIN users cu ON cu.id = c.userid
      GROUP BY p.id, u.username
      ORDER BY p.dateposted DESC, p.id DESC
      OFFSET $1 LIMIT $2;
    `;
    const result = await db.query(q, [offset, limit]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/posts/:id', async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const postQ = 'SELECT p.*, u.username FROM posts p LEFT JOIN users u ON u.id = p.userid WHERE p.id = $1';
        const post = await db.query(postQ, [postId]);
        if (!post.rows.length) return res.status(404).json({ error: 'Post not found' });

        const commentsQ = 'SELECT c.id, c.content, c.dateposted, c.userid, u.username FROM comments c LEFT JOIN users u ON u.id = c.userid WHERE c.postid = $1 ORDER BY c.dateposted';
        const comments = await db.query(commentsQ, [postId]);

        res.json({ post: post.rows[0], comments: comments.rows });
    } catch (err) { next(err); }
});

router.post('/posts', async (req, res, next) => {
    try {
        const { userId, title, content } = req.body;
        const datePosted = new Date().toISOString().slice(0,10);
        const q = 'INSERT INTO posts(userid, title, content, dateposted) VALUES($1,$2,$3,$4) RETURNING id, userid, title, content, dateposted';
        const result = await db.query(q, [userId, title, content, datePosted]);
        res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
});

// Comments
router.post('/posts/:id/comments', async (req, res, next) => {
    try {
        const postId = Number(req.params.id);
        const { userId, content } = req.body;
        const datePosted = new Date().toISOString().slice(0,10);
        const q = 'INSERT INTO comments(userid, postid, content, dateposted) VALUES($1,$2,$3,$4) RETURNING id, userid, postid, content, dateposted';
        const result = await db.query(q, [userId, postId, content, datePosted]);
        res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
});

// Comments list (paginated)
router.get('/posts/:id/comments', async (req, res, next) => {
  try {
    const postId = Number(req.params.id);
    if (Number.isNaN(postId)) return res.status(400).json({ error: 'Invalid post id' });

    const offset = Number(req.query.offset || 0);
    const limit = Number(req.query.limit || 20);

    const q = `
      SELECT
        c.id,
        c.userid,
        c.postid,
        c.content,
        c.dateposted,
        u.username
      FROM comments c
      LEFT JOIN users u ON u.id = c.userid
      WHERE c.postid = $1
      ORDER BY c.dateposted ASC, c.id ASC
      OFFSET $2 LIMIT $3;
    `;
    const result = await db.query(q, [postId, offset, limit]);
    res.json(result.rows);
  } catch (err) { next(err); }
});

// Checkins
router.get('/checkins', async (req, res, next) => {
    try {
        const q = 'SELECT c.id, c.userid, c.stress, c.energy, c.description, c.date, u.username FROM checkins c LEFT JOIN users u ON u.id = c.userid ORDER BY c.date DESC';
        const result = await db.query(q);
        res.json(result.rows);
    } catch (err) { next(err); }
});

router.post('/checkins', async (req, res, next) => {
    try {
        const { userId, stress, energy, description } = req.body;
        const date = new Date().toISOString().slice(0,10);
        const q = 'INSERT INTO checkins(userid, stress, energy, description, date) VALUES($1,$2,$3,$4,$5) RETURNING id, userid, stress, energy, description, date';
        const result = await db.query(q, [userId, stress, energy, description, date]);
        res.status(201).json(result.rows[0]);
    } catch (err) { next(err); }
});

module.exports = router;
