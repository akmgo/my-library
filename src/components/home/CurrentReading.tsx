// src/components/home/CurrentReading.tsx
"use client"; // ✨ 声明为客户端组件，解锁 ssr: false

import Link from "next/link";
import Image from "next/image";
import { BookOpenText } from "lucide-react";
import dynamic from "next/dynamic"; // ✨ 引入 dynamic
import type { Book } from "../../types";

// ✨ 1. 就地懒加载：保护 Cloudflare 引擎，只在浏览器端渲染特效
const BoomDecor = dynamic(() => import("./BoomDecor"), { ssr: false });
const ReadingProgress = dynamic(() => import("./ReadingProgress"), { ssr: false });

export default function CurrentReading({ readingBooks }: { readingBooks: Book[] }) {
  const heroBook = readingBooks[0];
  let heroOptimizedCover = "";

  if (heroBook) {
    const coverUrl = heroBook.coverUrl || "";
    heroOptimizedCover = coverUrl.startsWith("data:")
      ? coverUrl
      : coverUrl
      ? `https://wsrv.nl/?url=${encodeURIComponent(coverUrl)}&w=400&q=80&output=webp`
      : "";
  }

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] bg-white/60 dark:bg-slate-900 p-8 md:p-10 shadow-2xl border border-white/60 dark:border-transparent backdrop-blur-2xl transition-colors duration-500">
      {/* 极速光晕背景 */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-300/30 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-colors duration-500" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-300/30 dark:bg-purple-600/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3 transition-colors duration-500" />

      <div className="relative z-20 flex flex-col h-full">
        <div className="mb-6 flex items-center justify-between pointer-events-auto">
          <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
            当前在读
          </h2>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
            {readingBooks.length} 本
          </span>
        </div>

        <div className="flex-1 flex flex-col gap-6 pointer-events-auto">
          {heroBook ? (
            <>
              <div className="flex-[7] flex flex-col sm:flex-row items-stretch gap-6">
                <div className="flex-[6] min-w-0">
                  {/* ... 3D 卡片代码保持不变 ... */}
                  <Link href={`/books/${heroBook.id}`} prefetch={false} className="group relative flex items-center gap-6 md:gap-8 w-full h-full p-5 md:p-6 rounded-[2rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden focus:outline-none [perspective:1000px] hover:-translate-y-1.5">
                    <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/50 dark:via-white/10 to-transparent group-hover:translate-x-[150%] transition-transform duration-[1200ms] ease-in-out skew-x-12 pointer-events-none z-20" />
                    <div className="absolute bottom-0 right-10 w-32 h-32 bg-indigo-500/10 blur-[40px] rounded-full group-hover:bg-indigo-500/30 transition-colors duration-700 pointer-events-none z-0" />
                    <div className="shrink-0 w-28 md:w-36 aspect-[2/3] rounded-r-2xl rounded-l-md relative transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] transform-gpu shadow-md group-hover:shadow-[20px_20px_40px_rgba(0,0,0,0.2)] dark:group-hover:shadow-[20px_20px_40px_rgba(0,0,0,0.6)] z-20 bg-slate-100 dark:bg-slate-950 group-hover:[transform:translateY(-8px)_rotateY(12deg)_rotateZ(-2deg)]">
                      <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/40 via-black/10 to-transparent z-20 pointer-events-none rounded-l-md" />
                      <div className="absolute left-2 top-0 bottom-0 w-[1px] bg-white/30 z-20 pointer-events-none" />
                      <div className="absolute inset-0 rounded-r-2xl rounded-l-md border-t border-r border-white/20 z-20 pointer-events-none" />
                      <div className="absolute inset-0 bg-slate-200/50 dark:bg-slate-800/50 animate-pulse z-0 rounded-r-2xl rounded-l-md" />
                      {heroOptimizedCover && (
                        <Image src={heroOptimizedCover} alt={heroBook.title} fill sizes="(max-width: 768px) 112px, 144px" priority={true} decoding="sync" className="object-cover relative z-10 rounded-r-2xl rounded-l-md" unoptimized={true} />
                      )}
                    </div>
                    <div className="flex flex-col justify-center flex-1 min-w-0 h-full relative z-10 py-1">
                      <div className="transition-transform duration-700 group-hover:translate-x-3">
                        <h3 className="text-center text-2xl md:text-2xl font-black text-slate-800 dark:text-slate-100 leading-tight break-words group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-500">{heroBook.title}</h3>
                        <p className="text-base md:text-xl font-bold text-slate-500 dark:text-slate-400 mt-3 break-words">{heroBook.author}</p>
                      </div>
                      <div className="mt-auto flex items-end justify-between transition-transform duration-500 group-hover:-translate-y-1">
                        <div className="flex flex-wrap gap-2 pr-2">
                          {heroBook.tags?.slice(0, 2).map((tag: string) => (
                            <span key={tag} className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-white/60 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-md">{tag}</span>
                          ))}
                        </div>
                        <div className="relative shrink-0 -mr-2 -mb-2 pointer-events-auto">
                          <div className="absolute inset-0 bg-indigo-500/15 blur-2xl rounded-full group-hover:bg-indigo-500/30 transition-all duration-700 scale-150" />
                          <BookOpenText className="relative z-10 w-10 h-10 md:w-18 md:h-18 text-slate-200 dark:text-slate-800/60 group-hover:text-indigo-500 dark:group-hover:text-indigo-400/80 transition-all duration-700 drop-shadow-2xl group-hover:scale-125 group-hover:-rotate-6 group-hover:-translate-x-2 group-hover:-translate-y-2 origin-bottom-right" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
                
                {/* 进度环组件 */}
                <div className="flex-[4] min-w-[200px]">
                  <ReadingProgress book={heroBook} />
                </div>
              </div>
              
              {/* 底部气泡组件 */}
              <div className="flex-[3] w-full">
                <BoomDecor />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-slate-500 italic font-medium">
              目前没有正在阅读的书籍
            </div>
          )}
        </div>
      </div>
    </div>
  );
}