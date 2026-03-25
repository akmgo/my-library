// src/components/book/BookCard.tsx
"use client";

import React, { useState,useRef } from 'react';
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

  const [dominantColor, setDominantColor] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const cover = book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";


  const handleImageLoad = async () => {
    setIsLoaded(true);
    if (imgRef.current && !cover.startsWith('data:')) {
      try {
        const ColorThiefModule = await import('colorthief');
        const ColorThief = ColorThiefModule.default as any;

        const colorThief = new ColorThief();
        const color = colorThief.getColor(imgRef.current);
        // 转换成 rgb 格式存起来
        setDominantColor(`rgb(${color[0]}, ${color[1]}, ${color[2]})`);
      } catch (e) {
        console.log("取色失败", e);
      }
    }
  };

  // 极简状态胶囊 (去掉了复杂的阴影和动画，改用纯色+细边框)
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
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950 border border-amber-800 text-amber-400 text-xs font-medium">
            已读完
          </div>
        );
      case 'UNREAD':
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium">
            待读
          </div>
        );
    }
  };

  return (
    // 【优化1】：移除 backdrop-blur，改用纯背景色 bg-slate-900，极大减轻 GPU 负担
    <div 
    className="group relative flex flex-col w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 transition-transform duration-300 hover:-translate-y-1 hover:border-slate-600 hover:shadow-2xl cursor-pointer"
    style={{
      // 如果取到了色，就用动态色作为悬浮时的阴影和边框高光
      boxShadow: dominantColor ? `0 20px 40px -15px ${dominantColor}` : '',
      borderColor: dominantColor ? `color-mix(in srgb, ${dominantColor} 40%, transparent)` : ''
    }}
    >
      
      <div className="w-full aspect-video overflow-hidden relative bg-slate-950 flex items-center justify-center">
        
        {/* 【优化2】：极简的骨架占位，纯 CSS 无性能损耗 */}
        {!isLoaded && (
          <BookOpen className="w-8 h-8 text-slate-800 animate-pulse" />
        )}

        {/* 【优化3】：用纯 CSS 的 opacity 过渡替代 blur，丝滑且不掉帧 */}
        <Image 
          ref={imgRef as any}
          src={cover} 
          alt={book.title} 
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          crossOrigin="anonymous" // 极其重要：跨域取色必备
          onLoadingComplete={handleImageLoad} // Next.js Image 推荐用这个
          className={`
            object-cover transition-all duration-500 ease-in-out z-10
            ${isLoaded ? "opacity-100 transform group-hover:scale-105" : "opacity-0 scale-100"}
          `}
          unoptimized={cover.startsWith('data:')}
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-90 z-20 pointer-events-none"></div>
        
        <div className="absolute top-3 right-3 z-30">
          {renderStatusPill()}
        </div>
      </div>

      <div className="flex flex-col p-5 pt-2 relative z-30">
        <div className="mb-3">
          <h3 className="text-lg font-bold text-slate-100 line-clamp-1 group-hover:text-blue-400 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-1 mt-0.5">
            {book.author}
          </p>
        </div>

        <div className="mt-auto">
          {book.status === 'READING' && book.startTime && (
            <div className="flex items-center text-xs text-slate-500 gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-emerald-500/70" />
              <span>开始于 {book.startTime}</span>
            </div>
          )}

          {book.status === 'FINISHED' && (
            <div className="flex flex-col gap-3">
              {(book.startTime || book.endTime) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-500 font-medium">
                  {book.startTime && <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {book.startTime}</span>}
                  {book.startTime && book.endTime && <span className="text-slate-700">→</span>}
                  {book.endTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {book.endTime}</span>}
                </div>
              )}

              <div className="flex flex-wrap gap-2 items-center mt-1">
                {book.rating && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-yellow-950 border border-yellow-800 text-yellow-500 text-[11px] font-medium">
                    <Star className="w-3 h-3 fill-yellow-500/50" />
                    {book.rating}
                  </div>
                )}
                {book.tags && book.tags.map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
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