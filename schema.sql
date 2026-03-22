-- schema.sql
CREATE TABLE IF NOT EXISTS books (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  coverUrl TEXT,
  status TEXT DEFAULT 'UNREAD',
  progress INTEGER DEFAULT 0,
  tags TEXT, -- SQLite 没有数组，存 JSON 字符串
  addedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO books (id, title, author, coverUrl, status, progress, tags) 
VALUES 
  ('b1', '万古神帝', '飞天鱼', 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=300&auto=format&fit=crop', 'READING', 75, '["玄幻", "网文"]'),
  ('b2', '高性能后端架构：RPC实战', '云原生实验室', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=300&auto=format&fit=crop', 'READING', 30, '["Java", "后端开发", "RPC"]');