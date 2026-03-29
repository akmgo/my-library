// src/components/book/BookCard.tsx
import Image from "next/image";
import { Star, Clock } from "lucide-react";
import type { Book } from "../../types";

// ✨ 1. 新增 priority 属性，允许父级指定该卡片是否为“首屏核心资产”
export default function BookCard({ book, priority = false }: { book: Book; priority?: boolean }) {
  const coverUrl = book.coverUrl || "";
  const optimizedCover = coverUrl.startsWith("data:")
    ? coverUrl
    : coverUrl
    ? `https://wsrv.nl/?url=${encodeURIComponent(coverUrl)}&w=300&q=80&output=webp`
    : "";

  return (
    // ✨ 2. 移除了外层的 [transform:translateZ(0)] 和 will-change-transform，拒绝 GPU 显存滥用
    <div className="group relative flex w-full h-full items-center gap-4 md:gap-5 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none hover:-translate-y-1.5 hover:border-indigo-300 dark:hover:border-slate-700 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] transition-all duration-300 overflow-hidden cursor-pointer">
      
      {/* 纯 CSS 物理光泽扫过特效 */}
      <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent group-hover:translate-x-[150%] transition-transform duration-[1200ms] ease-in-out skew-x-12 pointer-events-none z-20" />

      {/* 左侧封面容器 (同样移除了多余的 GPU 强制指令) */}
      <div className="shrink-0 w-20 md:w-24 aspect-[2/3] rounded-xl overflow-hidden shadow-sm group-hover:shadow-md relative border border-slate-200 dark:border-slate-800 z-10 bg-slate-100 dark:bg-slate-950">

        <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-800/50 animate-pulse z-0" />

        {optimizedCover && (
          <Image
            src={optimizedCover}
            alt={book.title}
            fill
            sizes="(max-width: 768px) 80px, 96px"
            // ✨ 3. 核心机制：如果是首屏卡片，赋予 priority 且取消 lazy，防止滑动时被浏览器回收
            priority={priority}
            loading={priority ? undefined : "lazy"} 
            decoding={priority ? "sync" : "async"}
            className="object-cover relative z-10 group-hover:scale-105 transition-transform duration-500 ease-out"
            unoptimized={true} 
          />
        )}
      </div>

      {/* 右侧信息 (保持不变) */}
      <div className="flex flex-col flex-1 min-w-0 py-1 z-10 h-full justify-center">
        <div className="mb-2.5">
          <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-300">
            {book.title}
          </h3>
          <p className="text-xs md:text-sm font-medium text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {book.author}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 mt-auto">
          {(book.tags && book.tags.length > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {book.tags.slice(0, 2).map((tag: string, idx: number) => (
                <span key={idx} className="px-2 py-0.5 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 rounded-md border border-slate-200 dark:border-slate-700 truncate max-w-[80px]">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            {book.rating > 0 ? (
              <div className="flex items-center gap-0.5">
                {Array.from({ length: book.rating }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 md:w-3.5 md:h-3.5 text-yellow-500 fill-yellow-500 drop-shadow-sm" />
                ))}
              </div>
            ) : (
              <span className="text-[10px] md:text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {book.status === "FINISHED" ? "已完结" : "待阅读"}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}