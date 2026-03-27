-- 1. 删掉带有 action_type 的旧表
DROP TABLE IF EXISTS reading_logs;

-- 2. 重建极简版打卡表
CREATE TABLE reading_logs (
    id TEXT PRIMARY KEY,               -- UUID
    date TEXT NOT NULL,                -- 打卡日期 (如 '2026-03-27')
    book_id TEXT,                      -- 关联书籍 (可选，留给以后备用)
    created_at TEXT NOT NULL           -- 打卡精确时间戳
);

-- 💡 顺手建个索引：因为我们要频繁根据 date 查本月/本周数据，加上索引查询速度快 10 倍！
CREATE INDEX idx_reading_logs_date ON reading_logs(date);