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
        const q = `SELECT p.id, p.title, p.content, p.dateposted, p.userid,
            u.username
            FROM posts p
            LEFT JOIN users u ON u.id = p.userid
            ORDER BY p.dateposted DESC, p.id DESC`;
        const result = await db.query(q);
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
