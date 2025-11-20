const { Router } = require('express');
const { db } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = Router();

// Ostatni wynik AI użytkownika
router.get('/latest', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const q = `
      SELECT a.id,
             a.checkinId,
             a.moodScore,
             a.message,
             a.progressSummary,
             a.createdAt,
             c.date,
             c.stress,
             c.energy,
             c.description
      FROM checkin_ai_analysis a
      JOIN checkins c ON c.id = a.checkinId
      WHERE a.userId = ?
      ORDER BY a.createdAt DESC
      LIMIT 1`;
    const r = await db.query(q, [userId]);
    if (!r.rowCount) return res.json(null);
    res.json(r.rows[0]);
  } catch (err) { next(err); }
});

// Wszystkie wyniki AI użytkownika (np. do historii)
router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const q = `
      SELECT a.id,
             a.checkinId,
             a.moodScore,
             a.message,
             a.progressSummary,
             a.createdAt,
             c.date,
             c.stress,
             c.energy,
             c.description
      FROM checkin_ai_analysis a
      JOIN checkins c ON c.id = a.checkinId
      WHERE a.userId = ?
      ORDER BY a.createdAt DESC`;
    const r = await db.query(q, [userId]);
    res.json(r.rows);
  } catch (err) { next(err); }
});

module.exports = router;