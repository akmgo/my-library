// src/components/book/ReadingProgress.tsx
"use client";

import { useState, useRef } from "react";
import { Minus, Plus } from "lucide-react";
import { updateBook } from "@/app/actions";

export default function ReadingProgress({ book }: { book: any }) {
  const [progress, setProgress] = useState(book.progress || 0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleUpdate = async (newProgress: number) => {
    let safeProgress = Math.max(0, Math.min(100, newProgress));
    if (safeProgress === progress) return;
    setProgress(safeProgress);
    await updateBook(book.id, { progress: safeProgress });
  };

  const handleTrackClick = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = (clickX / rect.width) * 100;
    const snapped = Math.round(percentage / 5) * 5;
    handleUpdate(snapped);
  };

  return (
    <div className="w-full flex flex-col justify-center h-full bg-slate-950 border border-slate-800 rounded-[2rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden group">
      
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      {/* 【美化 1】：极简的左右对齐标题 */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h3 className="text-xl font-bold text-slate-300 tracking-widest">
          进度条
        </h3>
        <div className="text-4xl font-black italic tracking-tighter text-blue-400 drop-shadow-md">
          {progress}%
        </div>
      </div>

      <div 
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative w-full h-8 bg-slate-900 rounded-full cursor-pointer border border-slate-700 overflow-hidden z-10"
      >
        <div
          style={{ width: `${progress}%` }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500 ease-out"
        />
      </div>

      <div className="flex items-center justify-between mt-8 relative z-10">
        <button onClick={() => handleUpdate(progress - 5)} disabled={progress <= 0} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors active:scale-95">
          <Minus className="w-5 h-5" />
        </button>
        <span className="text-sm font-medium text-slate-500">步进 5%</span>
        <button onClick={() => handleUpdate(progress + 5)} disabled={progress >= 100} className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors active:scale-95">
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}