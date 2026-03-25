// src/components/book/BookCard.tsx
"use client";

import React, { useState } from 'react';
import { Calendar, Clock, Star, BookOpen } from 'lucide-react';
import Image from "next/image";

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
  const [isLoaded, setIsLoaded] = useState(false);

  const rawCover = book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";
  const cover = rawCover.startsWith('data:') ? rawCover : `${rawCover}?cors=1`;

  // 极简状态胶囊 (摒弃耗性能的毛玻璃，使用纯色)
  const renderStatusPill = () => {
    switch (book.status) {
      case 'READING':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            在读
          </div>
        );
      case 'FINISHED':
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-medium">
            已读完
          </div>
        );
      case 'UNREAD':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
            待读
          </div>
        );
    }
  };

  return (
    // 【极致流畅】：摒弃 backdrop-blur 和复杂光晕，采用深色纯背景 (bg-slate-900)，保证 120 帧丝滑滚动
    <div 
      className="group flex flex-col w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-600 hover:shadow-2xl cursor-pointer"
    >
      
      {/* 封面区域 */}
      <div className={`w-full aspect-video overflow-hidden relative bg-slate-950 flex items-center justify-center ${!isLoaded ? "animate-pulse" : ""}`}>
        
        {!isLoaded && (
          <BookOpen className="w-8 h-8 text-slate-700" />
        )}

        <Image 
          src={cover} 
          alt={book.title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onLoad={() => setIsLoaded(true)} 
          className={`
            object-cover transition-all duration-500 ease-out
            ${isLoaded ? "opacity-100 group-hover:scale-105" : "opacity-0"}
          `}
          unoptimized={cover.startsWith('data:')}
        />
        
        {/* 顶部极简遮罩，用于衬托状态标签 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 to-transparent h-1/3 z-10 pointer-events-none"></div>
        
        <div className="absolute top-3 right-3 z-20">
          {renderStatusPill()}
        </div>
      </div>

      {/* 文本信息区 */}
      <div className="flex flex-col p-5 flex-1 bg-slate-900">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-1 mt-1 font-medium">
            {book.author}
          </p>
        </div>

        <div className="mt-auto">
          {book.status === 'READING' && book.startTime && (
            <div className="flex items-center text-xs text-slate-400 gap-1.5 font-medium bg-slate-950 p-2 rounded-lg border border-slate-800 w-fit">
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>开始于 {book.startTime}</span>
            </div>
          )}

          {book.status === 'FINISHED' && (
            <div className="flex flex-col gap-3">
              {(book.startTime || book.endTime) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-medium bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {book.startTime && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500"/> {book.startTime}</span>}
                  {book.startTime && book.endTime && <span className="text-slate-600 px-1">→</span>}
                  {book.endTime && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-500"/> {book.endTime}</span>}
                </div>
              )}

              <div className="flex flex-wrap gap-2 items-center mt-1">
                {book.rating && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-yellow-950/50 border border-yellow-900/50 text-yellow-500 text-xs font-bold">
                    <Star className="w-3 h-3 fill-yellow-500/50" />
                    {book.rating}
                  </div>
                )}
                {book.tags && book.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}