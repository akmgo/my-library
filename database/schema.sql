-- 1. 把所有竖版封面的链接，覆盖写入到原来的 coverUrl 字段里（前提是它有竖版封面）
UPDATE books 
SET coverUrl = verticalCoverUrl 
WHERE verticalCoverUrl IS NOT NULL AND verticalCoverUrl != '';

-- 2. 丢弃冗余的 verticalCoverUrl 字段 (Cloudflare D1 支持这种现代 SQLite 语法)
ALTER TABLE books DROP COLUMN verticalCoverUrl;