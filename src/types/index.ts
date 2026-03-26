// src/types/index.ts

// ==========================================
// 📚 书籍相关类型定义
// ==========================================

export type BookStatus = 'UNREAD' | 'READING' | 'FINISHED';

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  status: BookStatus;
  startTime?: string;
  endTime?: string;
  rating?: string;
  tags?: string[];
  addedAt?: string; // 数据库中的插入时间
}

// ==========================================
// 📝 摘录与笔记类型定义
// ==========================================

export interface Excerpt {
  id: string;
  bookId: string;
  content: string;
  createdAt: string;
}