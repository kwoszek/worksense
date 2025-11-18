const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { db } = require('../database/db');

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || '30d';
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'change_this_access_secret';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'change_this_refresh_secret';

function hashPassword(password) {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function signAccessToken(user) {
  const payload = { sub: user.id, username: user.username, email: user.email };
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

function signRefreshToken(user) {
  const payload = { sub: user.id, typ: 'refresh' };
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_TTL });
}

function verifyAccess(token) {
  return jwt.verify(token, ACCESS_SECRET);
}

function verifyRefresh(token) {
  return jwt.verify(token, REFRESH_SECRET);
}

async function persistRefreshToken(userId, token, userAgent, ip) {
  // decode to get exp
  const decoded = jwt.decode(token);
  const expiresAt = new Date((decoded.exp || 0) * 1000);
  await db.query(
    `INSERT INTO refresh_tokens(userid, token, expiresAt, userAgent, ip)
     VALUES ($1,$2,$3,$4,$5)`,
    [userId, token, expiresAt, userAgent || null, ip || null]
  );
}

async function revokeRefreshToken(token) {
  await db.query(
    `UPDATE refresh_tokens SET revokedAt = NOW() WHERE token = $1 AND revokedAt IS NULL`,
    [token]
  );
}

async function isRefreshTokenActive(token) {
  const res = await db.query(
    `SELECT id FROM refresh_tokens
     WHERE token = $1 AND revokedAt IS NULL AND expiresAt > NOW()
     LIMIT 1`,
    [token]
  );
  return res.rowCount === 1;
}

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('rt', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'lax' : 'lax',
    path: '/api/users',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearRefreshCookie(res) {
  res.clearCookie('rt', { path: '/api/users' });
}

module.exports = {
  hashPassword,
  comparePassword,
  signAccessToken,
  signRefreshToken,
  verifyAccess,
  verifyRefresh,
  persistRefreshToken,
  revokeRefreshToken,
  isRefreshTokenActive,
  setRefreshCookie,
  clearRefreshCookie,
};