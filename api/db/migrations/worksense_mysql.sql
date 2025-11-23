-- MySQL / MariaDB schema for WorkSense
-- Run with: mysql -u USER -p DATABASE < worksense_mysql.sql

-- Use UTF8MB4
SET NAMES utf8mb4;
SET time_zone = '+01:00';

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(30) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL,
  avatar LONGBLOB NULL,
  streak INT NOT NULL DEFAULT 0,
  UNIQUE KEY uniq_users_username (username),
  UNIQUE KEY uniq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,
  title VARCHAR(50) NOT NULL,
  content TEXT,
  datePosted DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  likes INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_posts_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,
  postId INT NOT NULL,
  content TEXT,
  datePosted DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  likes INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_comments_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL,
  CONSTRAINT fk_comments_post FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS checkins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NULL,
  stress INT NOT NULL,
  energy INT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  moodScore INT NULL,
  CONSTRAINT fk_checkins_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_user_date (userId, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS refresh_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token TEXT NOT NULL,
  expiresAt DATETIME NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revokedAt DATETIME NULL,
  userAgent TEXT NULL,
  ip TEXT NULL,
  CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_refresh_user (userId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS post_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  postId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_post (userId, postId),
  CONSTRAINT fk_post_likes_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_post_likes_post FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS comment_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  commentId INT NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_comment (userId, commentId),
  CONSTRAINT fk_comment_likes_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_likes_comment FOREIGN KEY (commentId) REFERENCES comments(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  `key` TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NULL,
  maxLevel INT NOT NULL DEFAULT 1,
  UNIQUE KEY uniq_badges_key (`key`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_badges (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  badgeId INT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_badge (userId, badgeId),
  CONSTRAINT fk_user_badges_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_badges_badge FOREIGN KEY (badgeId) REFERENCES badges(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS checkin_ai_analysis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  checkinId INT NOT NULL,
  moodScore INT NOT NULL,
  message TEXT NOT NULL,
  progressSummary TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_checkin (userId, checkinId),
  CONSTRAINT fk_ai_user FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_ai_checkin FOREIGN KEY (checkinId) REFERENCES checkins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed streak badge if missing
-- Seed streak badge if missing (updated levels: 7,14,30,90,180,365)
INSERT INTO badges(`key`, name, description, maxLevel)
SELECT 'streak', 'Seria', 'Przyznawana za utrzymanie serii aktywności. Poziomy przy 7, 14, 30, 90, 180 i 365 dniach.', 6
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE `key`='streak');

-- Seed contributor (posts) badge
INSERT INTO badges(`key`, name, description, maxLevel)
SELECT 'posts', 'Współtwórca', 'Utworzył wpis na forum (przyznawana za pierwszy post).', 1
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE `key`='posts');

-- Seed commenter badge
INSERT INTO badges(`key`, name, description, maxLevel)
SELECT 'comments', 'Komentujący', 'Skomentował wpis na forum (przyznawana za pierwszy komentarz).', 1
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE `key`='comments');

-- Seed Best Link badge (awarded when a comment containing a link receives at least 10 likes)
INSERT INTO badges(`key`, name, description, maxLevel)
SELECT 'best_link', 'Najlepszy link', 'Opublikował komentarz zawierający link, który otrzymał przynajmniej 10 polubień.', 1
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE `key`='best_link');

-- Seed Best Comment badge (most-liked comment under a post with at least 10 likes)
INSERT INTO badges(`key`, name, description, maxLevel)
SELECT 'best_comment', 'Najlepszy komentarz', 'Opublikował najczęściej polubiony komentarz pod wpisem (wymaga co najmniej 10 polubień).', 1
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE `key`='best_comment');

-- Seed Account Age badge (based on date of first checkin)
INSERT INTO badges(`key`, name, description, maxLevel)
SELECT 'account_age', 'Wiek konta', 'Przyznawana na podstawie daty pierwszego checkinu. Poziomy przy 30, 180, 365 i 730 dniach.', 4
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE `key`='account_age');

-- Seed Lookout badge (manual award by admin for valid bug reports)
INSERT INTO badges(`key`, name, description, maxLevel)
SELECT 'lookout', 'Czujny', 'Zgłosił prawidłowy błąd (przyznawana ręcznie przez administratorów).', 1
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE `key`='lookout');

-- Seed Outstanding badge (manual award by admin for outstanding positive activity)
INSERT INTO badges(`key`, name, description, maxLevel)
SELECT 'outstanding', 'Wyjątkowy', 'Uznany przez administratorów za wyjątkową aktywność na forum (przyznawana ręcznie).', 1
WHERE NOT EXISTS (SELECT 1 FROM badges WHERE `key`='outstanding');

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  token VARCHAR(128) NOT NULL UNIQUE,
  expiresAt DATETIME NOT NULL,
  used TINYINT(1) NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(userId);