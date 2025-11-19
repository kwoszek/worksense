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

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS avatar BYTEA,
  ADD COLUMN IF NOT EXISTS streak INTEGER NOT NULL DEFAULT 0;

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
  userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(50) NOT NULL,
  content TEXT,
  datePosted TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  likes INTEGER NOT NULL DEFAULT 0
);

-- comments
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
  postId INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT,
  datePosted TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  likes INTEGER NOT NULL DEFAULT 0
);

-- checkins
CREATE TABLE IF NOT EXISTS checkins (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
  stress INTEGER NOT NULL,
  energy INTEGER NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  moodScore INTEGER               -- nowa kolumna na ocenę z AI (może być NULL)
);

-- refresh tokens for auth
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGSERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  expiresAt TIMESTAMPTZ NOT NULL,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revokedAt TIMESTAMPTZ,
  userAgent TEXT,
  ip TEXT
);

CREATE INDEX IF NOT EXISTS refresh_tokens_user_idx ON refresh_tokens(userId);

-- Upgrade existing columns to TIMESTAMPTZ if they were DATE
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='posts' AND column_name='dateposted' AND data_type='date'
  ) THEN
    ALTER TABLE posts ALTER COLUMN datePosted TYPE TIMESTAMPTZ USING datePosted::timestamptz;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='comments' AND column_name='dateposted' AND data_type='date'
  ) THEN
    ALTER TABLE comments ALTER COLUMN datePosted TYPE TIMESTAMPTZ USING datePosted::timestamptz;
  END IF;
END $$;

COMMIT;
-- likes tables (posts & comments)
CREATE TABLE IF NOT EXISTS post_likes (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  postId INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(userId, postId)
);

CREATE TABLE IF NOT EXISTS comment_likes (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commentId INTEGER NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(userId, commentId)
);

-- Badge (advancement) definitions
CREATE TABLE IF NOT EXISTS badges (
  id SERIAL PRIMARY KEY,
  key TEXT NOT NULL UNIQUE, -- stable identifier e.g. 'streak'
  name TEXT NOT NULL,
  description TEXT,
  maxLevel INTEGER NOT NULL DEFAULT 1
);

-- User badges with level tracking
CREATE TABLE IF NOT EXISTS user_badges (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badgeId INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(userId, badgeId)
);

-- Seed core badge definitions if absent
DO $$
DECLARE
  need_streak BOOLEAN := NOT EXISTS (SELECT 1 FROM badges WHERE key = 'streak');
BEGIN
  IF need_streak THEN
    INSERT INTO badges(key, name, description, maxLevel) VALUES
      ('streak', 'Streaker', 'Awarded for maintaining an activity streak. Levels increase at 1,7,30,100 days.', 4);
  END IF;
END$$;

-- AI analysis results for checkins
CREATE TABLE IF NOT EXISTS checkin_ai_analysis (
  id SERIAL PRIMARY KEY,
  userId INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  checkinId INTEGER NOT NULL REFERENCES checkins(id) ON DELETE CASCADE,
  moodScore INTEGER NOT NULL,
  message TEXT NOT NULL,
  progressSummary TEXT,
  createdAt TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(userId, checkinId)
);
