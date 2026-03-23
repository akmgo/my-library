// src/components/book/ReadingProgress.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { Minus, Plus, Target } from "lucide-react";
import { updateBook } from "@/app/actions";

export default function ReadingProgress({ book }: { book: any }) {
  const [progress, setProgress] = useState(book.progress || 0);
  const trackRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();

  useEffect(() => {
    controls.start({ scale: [1, 1.1, 1], transition: { duration: 0.3 } });
  }, [progress, controls]);

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
    // 恢复最初的毛玻璃、深色质感圆角面板
    <div className="w-full flex flex-col justify-center h-full bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden group">
      
      {/* 极简背景光晕 */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">攻克进度</h3>
            <p className="text-xs text-slate-400 mt-0.5">每次点亮，都是一次跨越</p>
          </div>
        </div>
        
        <motion.div animate={controls} className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500">
          {progress}%
        </motion.div>
      </div>

      {/* 轨道与滑块 */}
      <div 
        ref={trackRef}
        onClick={handleTrackClick}
        className="relative w-full h-8 bg-slate-950 rounded-full shadow-inner cursor-pointer border border-slate-800/80 overflow-hidden z-10"
      >
        <div className="absolute inset-0 flex justify-between px-4 items-center pointer-events-none opacity-20">
          {[20, 40, 60, 80].map(mark => (
            <div key={mark} className="w-1 h-1 bg-white rounded-full" />
          ))}
        </div>

        <motion.div
          initial={{ width: `${progress}%` }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.4)] rounded-full"
        />
      </div>

      {/* 底部精确控制按钮 */}
      <div className="flex items-center justify-between mt-8 relative z-10">
        <button
          onClick={() => handleUpdate(progress - 5)}
          disabled={progress <= 0}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
        >
          <Minus className="w-5 h-5" />
        </button>

        <span className="text-sm font-medium text-slate-500">步进 5%</span>

        <button
          onClick={() => handleUpdate(progress + 5)}
          disabled={progress >= 100}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-lg"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}