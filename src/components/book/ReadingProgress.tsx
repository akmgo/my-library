// src/components/book/ReadingProgress.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Minus, Plus, TrendingUp } from "lucide-react";
import { updateBook } from "../../app/actions";
import type { Book } from "../../types";

export default function ReadingProgress({ book }: { book: Book }) {
  const [progress, setProgress] = useState(book.progress || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProgress(book.progress || 0);
  }, [book.progress]);

  const handleUpdate = async (newProgress: number) => {
    let safeProgress = Math.max(0, Math.min(100, newProgress));
    if (safeProgress === progress) return;

    setProgress(safeProgress);
    setIsUpdating(true);
    await updateBook(book.id, { progress: safeProgress });
    setIsUpdating(false);
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current || isUpdating) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    const snapped = Math.round(percentage / 5) * 5;
    handleUpdate(snapped);
  };

  return (
    // ✨ 背景提亮
    <div className="w-full flex flex-col justify-center bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden group hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors duration-500">
      {/* 极光层保留，浅色下会更加水润 */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-700" />

      <div className="flex flex-col items-center justify-center mb-6 relative z-10 gap-1">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400 transition-colors" />
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 tracking-widest uppercase transition-colors">
            阅读进度
          </h3>
        </div>

        <div className="flex items-baseline justify-center relative px-6 mt-2">
          {/* ✨ 渐变色双端适配：浅色用深蓝到浅蓝的渐变，深色保持原样 */}
          <span className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-indigo-400 dark:from-white dark:via-indigo-200 dark:to-indigo-500 drop-shadow-sm dark:drop-shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all duration-500">
            {progress}
          </span>
          <span className="text-3xl font-bold text-indigo-500 dark:text-indigo-400/80 ml-2">
            %
          </span>
        </div>
      </div>

      <div className="w-full max-w-md mx-auto z-10 flex flex-col gap-6 relative">
        {/* 进度轨道 */}
        <div
          ref={trackRef}
          onClick={handleTrackClick}
          className="relative w-full h-10 bg-slate-100 dark:bg-slate-950/50 rounded-full cursor-pointer border border-slate-200 dark:border-slate-800 overflow-hidden group/track shadow-inner transition-colors duration-500"
        >
          <div
            style={{ width: `${progress}%` }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-500 via-indigo-400 to-purple-500 transition-all duration-500 ease-out flex justify-end"
          >
            <div className="w-6 h-full bg-white/70 blur-sm rounded-full -mr-3 mix-blend-overlay"></div>
          </div>
        </div>

        {/* 按钮区域 */}
        <div className="flex items-center justify-between w-full">
          <button
            onClick={() => handleUpdate(progress - 5)}
            disabled={progress <= 0 || isUpdating}
            // ✨ 按钮底色提亮
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
          >
            <Minus className="w-6 h-6" />
          </button>

          <button
            onClick={() => handleUpdate(progress + 5)}
            disabled={progress >= 100 || isUpdating}
            className="w-14 h-14 flex items-center justify-center rounded-full bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:border-indigo-300 dark:hover:border-indigo-500/40 transition-all active:scale-95 disabled:opacity-50 flex-shrink-0"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
