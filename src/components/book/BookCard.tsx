// src/components/book/BookCard.tsx
import React from 'react';
import { Calendar, Clock, Star } from 'lucide-react';

// 定义 Book 类型（如果你的 types 文件里有，可以直接引入）
export interface Book {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  status: 'UNREAD' | 'READING' | 'FINISHED';
  startTime?: string;
  endTime?: string;
  rating?: string;
  tags?: string[];
}

export default function BookCard({ book }: { book: Book }) {
  // 默认占位图，防止空封面影响排版
  const cover = book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

  // 渲染不同状态的高级发光胶囊
  const renderStatusPill = () => {
    switch (book.status) {
      case 'READING':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            在读
          </div>
        );
      case 'FINISHED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            已读完
          </div>
        );
      case 'UNREAD':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-600/50 text-slate-300 text-xs font-medium backdrop-blur-md">
            待读
          </div>
        );
    }
  };

  return (
    <div className="group relative flex flex-col w-full rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-800/60 backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] hover:border-slate-600/60 cursor-pointer">
      
      {/* 1. 顶部：极具电影质感的 16:9 封面 */}
      <div className="w-full aspect-video overflow-hidden relative">
        <img 
          src={cover} 
          alt={book.title} 
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        {/* 底部渐变遮罩，让图片平滑过渡到卡片底色 */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-95"></div>
        
        {/* 状态胶囊绝对定位在右上角，像一个高级徽章 */}
        <div className="absolute top-3 right-3 z-10">
          {renderStatusPill()}
        </div>
      </div>

      {/* 2. 底部信息区：根据状态渐进式展示 */}
      <div className="flex flex-col p-5 pt-2">
        
        {/* 常驻信息：书名与作者 */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-white transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">
            {book.author}
          </p>
        </div>

        {/* 动态信息：根据阅读状态渲染不同内容 */}
        <div className="mt-auto">
          
          {/* 【在读状态】：仅显示开始时间 */}
          {book.status === 'READING' && book.startTime && (
            <div className="flex items-center text-xs text-slate-500 gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>开始于 {book.startTime}</span>
            </div>
          )}

          {/* 【已读完状态】：火力全开，展示所有元数据 */}
          {book.status === 'FINISHED' && (
            <div className="flex flex-col gap-3">
              
              {/* 时间线 */}
              {(book.startTime || book.endTime) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 font-medium">
                  {book.startTime && <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {book.startTime}</span>}
                  {book.startTime && book.endTime && <span className="text-slate-700">→</span>}
                  {book.endTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {book.endTime}</span>}
                </div>
              )}

              {/* 评价与标签 (胶囊流布局) */}
              <div className="flex flex-wrap gap-2 items-center mt-1">
                {/* 评价胶囊 */}
                {book.rating && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[11px] font-medium">
                    <Star className="w-3 h-3 fill-yellow-500/50" />
                    {book.rating}
                  </div>
                )}
                
                {/* 标签胶囊 */}
                {book.tags && book.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-2 py-0.5 rounded-md bg-slate-800/60 border border-slate-700 text-slate-300 text-[11px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

            </div>
          )}

          {/* 【待读状态】：最极简，底部留白，什么都不显示，只靠右上角的胶囊传达状态 */}
          
        </div>
      </div>

    </div>
  );
}