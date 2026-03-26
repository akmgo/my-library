// src/components/book/BookCard.tsx
"use client";

import React from "react";
import { Calendar, Clock, Star, BookOpen } from "lucide-react";
import Image from "next/image";
// 🚀 引入全局统一的类型定义，替代组件内零散的 Interface
import type { Book } from "../../types";

export default function BookCard({ book }: { book: Book }) {
  const rawCover = book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";
  
  // 边缘节点实时压缩代理 (3MB -> 30KB)
  const cover = rawCover.startsWith('data:') 
    ? rawCover 
    : `https://wsrv.nl/?url=${encodeURIComponent(rawCover)}&w=400&q=80&output=webp`;

  // 极简状态胶囊
  const renderStatusPill = () => {
    switch (book.status) {
      case "READING":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-medium shadow-sm">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]"></div>
            在读
          </div>
        );
      case "FINISHED":
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-950 border border-indigo-800 text-indigo-400 text-xs font-medium shadow-sm">
            已读完
          </div>
        );
      case "UNREAD":
      default:
        return (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-medium shadow-sm">
            待读
          </div>
        );
    }
  };

  return (
    // 极致流畅：摒弃 backdrop-blur 和复杂光晕，采用深色纯背景 (bg-slate-900)，保证 120 帧丝滑滚动
    <div className="group flex flex-col w-full h-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 transition-all duration-300 hover:-translate-y-1.5 hover:border-slate-600 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.6)] cursor-pointer">
      
      {/* 封面区域 */}
      <div className="w-full aspect-video overflow-hidden relative bg-slate-950 flex items-center justify-center">
        {/* 底层永久骨架 */}
        <BookOpen className="w-8 h-8 text-slate-800 absolute z-0" />

        {/* 瞬间渲染的封面 */}
        <Image
          src={cover}
          alt={book.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 z-10 relative"
          unoptimized={cover.startsWith("data:")}
        />

        {/* 顶部极简遮罩，用于衬托状态标签 */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-transparent h-1/2 z-10 pointer-events-none"></div>

        <div className="absolute top-3 right-3 z-20">{renderStatusPill()}</div>
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
          {book.status === "READING" && book.startTime && (
            <div className="flex items-center text-xs text-slate-400 gap-1.5 font-medium bg-slate-950 p-2 rounded-lg border border-slate-800 w-fit">
              <Calendar className="w-3.5 h-3.5 text-emerald-500/80" />
              <span>开始于 {book.startTime}</span>
            </div>
          )}

          {book.status === "FINISHED" && (
            <div className="flex flex-col gap-3">
              {(book.startTime || book.endTime) && (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 font-medium bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  {book.startTime && (
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />{" "}
                      {book.startTime}
                    </span>
                  )}
                  {book.startTime && book.endTime && (
                    <span className="text-slate-600 px-1">→</span>
                  )}
                  {book.endTime && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />{" "}
                      {book.endTime}
                    </span>
                  )}
                </div>
              )}

              <div className="flex flex-wrap gap-2 items-center mt-1">
                {book.rating && (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-yellow-950/40 border border-yellow-900/50 text-yellow-500/90 text-[11px] font-bold">
                    <Star className="w-3 h-3 fill-yellow-500/50" />
                    {book.rating}
                  </div>
                )}
                {book.tags &&
                  book.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px] font-medium"
                    >
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