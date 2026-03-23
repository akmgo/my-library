-- schema.sql
-- schema.sql
DROP TABLE IF EXISTS excerpts;
DROP TABLE IF EXISTS books;

-- 1. 图书表
CREATE TABLE books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  coverUrl TEXT,
  status TEXT DEFAULT 'UNREAD', -- 状态：UNREAD (待读), READING (在读), FINISHED (已读完)
  startTime TEXT,
  endTime TEXT,
  rating INTEGER DEFAULT 0,
  tags TEXT DEFAULT '[]',       -- SQLite 没有数组格式，我们用 JSON 字符串存标签
  addedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. 摘录表 (与图书表通过 bookId 关联)
CREATE TABLE excerpts (
  id TEXT PRIMARY KEY,
  bookId TEXT NOT NULL,
  content TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (bookId) REFERENCES books(id) ON DELETE CASCADE
);
