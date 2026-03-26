// src/components/book/ReadingProgress.tsx
"use client";

import { useState, useRef } from "react";
import { Minus, Plus, Zap } from "lucide-react";
import { updateBook } from "../../app/actions";
import type { Book } from "../../types";

// 扩展一下本地类型以支持 progress 字段 (建议你后续也可以把它加到 src/types/index.ts 里)
type BookWithProgress = Book & { progress?: number };

export default function ReadingProgress({ book }: { book: BookWithProgress }) {
  const [progress, setProgress] = useState(book.progress || 0);
  const [isUpdating, setIsUpdating] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

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
    // 🚀 全局升级：高级毛玻璃容器，完全融入主页背景
    <div className="w-full h-full flex flex-col justify-center bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-xl relative overflow-hidden group hover:bg-slate-800/60 transition-colors duration-500">
      
      {/* 🌌 深空极光氛围层 */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-700" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none group-hover:bg-purple-500/20 transition-colors duration-700" />

      {/* 标题与百分比 */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-indigo-400" />
          <h3 className="text-sm font-bold text-slate-400 tracking-widest uppercase">
            阅读进度
          </h3>
        </div>
        {/* 极巨化的金属质感数字 */}
        <div className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-indigo-500 drop-shadow-[0_0_20px_rgba(99,102,241,0.5)] transition-all duration-300">
          {progress}<span className="text-2xl text-indigo-400/80 ml-1">%</span>
        </div>
      </div>

      {/* 进度条轨道 */}
      <div 
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative w-full h-6 bg-slate-950/50 rounded-full cursor-pointer border border-slate-800 overflow-hidden z-10 group/track shadow-inner"
      >
        {/* 进度填充区：渐变霓虹 + 头部高光 */}
        <div
          style={{ width: `${progress}%` }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-indigo-600 via-indigo-400 to-purple-500 transition-all duration-500 ease-out flex justify-end"
        >
          {/* 进度条前端的发光点 */}
          <div className="w-4 h-full bg-white/50 blur-sm rounded-full -mr-2 mix-blend-overlay"></div>
        </div>
      </div>

      {/* 控制按钮区 */}
      <div className="flex items-center justify-between mt-8 relative z-10">
        <button 
          onClick={() => handleUpdate(progress - 5)} 
          disabled={progress <= 0 || isUpdating} 
          className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/80 disabled:hover:border-slate-700 disabled:hover:shadow-none"
        >
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-xs font-medium text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-800">
          步进 5%
        </span>
        <button 
          onClick={() => handleUpdate(progress + 5)} 
          disabled={progress >= 100 || isUpdating} 
          className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-slate-800/80 disabled:hover:border-slate-700 disabled:hover:shadow-none"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}