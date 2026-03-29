// src/components/archive/GalleryBookCard.tsx
"use client";

import Link from "next/link";
import { Star, CalendarDays } from "lucide-react";

// 评分描述字典
const RATING_TEXTS = ["", "一星毒草", "二星平庸", "三星粮草", "四星推荐", "🔥 改变人生"];

const STATUS_CONFIG: Record<string, { label: string; colorClass: string; dotClass: string }> = {
  FINISHED: {
    label: "已读完",
    colorClass: "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-500/20",
    dotClass: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-[pulse_3s_ease-in-out_infinite]", 
  },
  READING: {
    label: "在读",
    colorClass: "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-500/20",
    dotClass: "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)] animate-[pulse_1.5s_ease-in-out_infinite]", 
  },
  UNREAD: {
    label: "待读",
    colorClass: "bg-slate-100 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 border-slate-500/20",
    dotClass: "bg-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.5)]", 
  },
};

export default function GalleryBookCard({ 
  book, 
  showStatus, 
  isFinishedTab 
}: { 
  book: any; 
  showStatus: boolean;
  isFinishedTab?: boolean;
}) {
  const statusInfo = STATUS_CONFIG[book.status as string] || STATUS_CONFIG.UNREAD;

  const optimizedCover = book.coverUrl?.startsWith("data:")
    ? book.coverUrl
    : `https://wsrv.nl/?url=${encodeURIComponent(book.coverUrl || "")}&w=300&q=70&output=webp`;

  // ✨ 计算阅读历时天数
  const getReadingDays = () => {
    if (!book.startTime || !book.endTime) return "?";
    const start = new Date(book.startTime).getTime();
    const end = new Date(book.endTime).getTime();
    if (isNaN(start) || isNaN(end)) return "?";
    
    // 换算成天数，如果同一天读完（差值为0），则按 1 天算
    const diffDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? 1 : diffDays;
  };

  return (
    <Link href={`/books/${book.id}`} className="group flex flex-col gap-3 focus:outline-none [content-visibility:auto] [contain-intrinsic-size:380px]">
      
      {/* 封面区 (保持极致性能渲染) */}
      <div className="relative w-full aspect-[2/3] rounded-2xl overflow-hidden shadow-md transition-all duration-500 hover:transform-gpu group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.3)] border border-slate-200/50 dark:border-white/10 bg-slate-100 dark:bg-slate-900">
        <img
          src={optimizedCover}
          alt={book.title}
          loading="lazy"
          decoding="async" 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:saturate-125 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 dark:via-white/5 dark:to-white/10 pointer-events-none" />

        {/* 动态胶囊 (只在全部档案中显示) */}
        {showStatus && (
          <div className="absolute top-2 right-2 md:top-3 md:right-3 z-20 pointer-events-none">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${statusInfo.colorClass}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotClass}`} />
              <span className="text-[10px] font-black tracking-widest uppercase">
                {statusInfo.label}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 文本与详细信息区 */}
      <div className="px-1 flex flex-col justify-start">
        {/* 书名与作者 */}
        <h3 className="text-base md:text-lg font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          {book.title}
        </h3>
        <p className="text-xs md:text-sm font-bold text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {book.author}
        </p>

        {/* ✨ 专属战报区：仅在“已读书籍” Tab 下且状态为 FINISHED 时渲染 */}
        {isFinishedTab && book.status === "FINISHED" && (
          <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-2">
            
            {/* 1. 评分行：左侧五星，右侧描述 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-[2px]">
                {book.rating ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-[10px] h-[10px] md:w-3 md:h-3 ${
                        i < book.rating
                          ? "text-amber-400 fill-amber-400 drop-shadow-sm"
                          : "text-slate-200 dark:text-slate-700"
                      }`}
                    />
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400 font-bold tracking-widest">暂无评分</span>
                )}
              </div>
              {book.rating > 0 && (
                <span className="text-[10px] font-bold text-amber-600 dark:text-amber-500">
                  {RATING_TEXTS[book.rating]}
                </span>
              )}
            </div>

            {/* 2. 时间与历时行：左侧起止日期，右侧共几天 */}
            <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-0.5">
              <div className="flex items-center gap-1.5 truncate">
                <CalendarDays className="w-3 h-3 shrink-0" />
                <span className="truncate">
                  {(book.startTime || "").replace(/-/g, "/").slice(2)} - {(book.endTime || "").replace(/-/g, "/").slice(2)}
                </span>
              </div>
              <span className="shrink-0 text-indigo-500 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-1.5 py-0.5 rounded shadow-sm">
                历时 {getReadingDays()} 天
              </span>
            </div>

            {/* 3. 标签行：完整展示三个标签 */}
            {book.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {book.tags.slice(0, 3).map((tag: string) => (
                  <span
                    key={tag}
                    className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200/50 dark:border-slate-700/50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            
          </div>
        )}
      </div>
    </Link>
  );
}