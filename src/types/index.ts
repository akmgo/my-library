// src/types/index.ts

// 定义阅读状态的枚举 (类似后端的 Enum)
export type ReadingStatus = 'UNREAD' | 'READING' | 'FINISHED';

// 定义一本书的核心数据结构 (类似后端的 Entity / DTO)
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl: string;       // 封面图链接
  status: ReadingStatus;  // 当前状态
  progress: number;       // 阅读进度 (0-100)
  tags: string[];         // 分类标签
  addedAt: string;        // 入库时间
  updatedAt: string;      // 最后阅读时间
}