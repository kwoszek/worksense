-- PostgreSQL migration for worksense (converted from MySQL dump)
-- Run with: psql -d worksense -f worksense_pg.sql

BEGIN;

-- users (auth-ready)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL
);

-- uniqueness for login
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_username_key') THEN
    CREATE UNIQUE INDEX users_username_key ON users (username);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'users_email_key') THEN
    CREATE UNIQUE INDEX users_email_key ON users (email);
  END IF;
END$$;

-- posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(50) NOT NULL,
  content TEXT,
  "datePosted" DATE NOT NULL
);

-- comments
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  "postId" INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT,
  "datePosted" DATE NOT NULL
);

-- checkins
CREATE TABLE IF NOT EXISTS checkins (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER REFERENCES users(id) ON DELETE SET NULL,
  stress INTEGER NOT NULL,
  energy INTEGER NOT NULL,
  description TEXT,
  date DATE NOT NULL
);

-- refresh tokens for auth
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "revokedAt" TIMESTAMPTZ,
  "userAgent" TEXT,
  ip TEXT
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens("userId");

COMMIT;
