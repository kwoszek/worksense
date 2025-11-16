-- PostgreSQL migration for worksense (converted from MySQL dump)
-- Run with: psql -d worksense -f worksense_pg.sql

BEGIN;

-- users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(30),
  password VARCHAR(100),
  email VARCHAR(50)
);

-- posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
  title VARCHAR(50) NOT NULL,
  content TEXT,
  datePosted DATE NOT NULL
);

-- comments
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
  postId INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  content TEXT,
  datePosted DATE NOT NULL
);

-- checkins
CREATE TABLE IF NOT EXISTS checkins (
  id SERIAL PRIMARY KEY,
  userId INTEGER REFERENCES users(id) ON DELETE SET NULL,
  stress INTEGER NOT NULL,
  energy INTEGER NOT NULL,
  description TEXT,
  date DATE NOT NULL
);

COMMIT;
