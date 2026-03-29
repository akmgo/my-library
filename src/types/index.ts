// src/types/index.ts

export type BookStatus = "UNREAD" | "READING" | "FINISHED";

export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  status: BookStatus;
  rating: number;
  tags: string[];
  progress:number;
  addedAt: string;
  updatedAt: string;
  startTime: string | null;
  endTime: string | null;
}

export interface Excerpt {
  id: string;
  bookId: string;
  content: string;
  createdAt: string;
}

export interface ReadingLog {
  id: string;
  date: string;
  book_id: string;
  created_at: string;
  book?: Book | null; // 关联查询时拼装的书籍实体
}