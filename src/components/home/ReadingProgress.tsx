// src/components/book/ReadingProgress.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Target, Minus, Plus } from "lucide-react";
import type { Book } from "../../types";
import { updateBook } from "../../app/actions/books"; 

export default function ReadingProgress({ book }: { book: Book }) {
  const [progress, setProgress] = useState<number>((book as any).progress || 0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (progress === (book as any).progress) return;
    const timer = setTimeout(() => {
      updateBook(book.id, { progress });
    }, 500);
    return () => clearTimeout(timer);
  }, [progress, book.id, book]);

  const handleMinus = (e: React.MouseEvent) => {
    e.preventDefault();
    setProgress((p) => Math.max(0, p - 1));
  };

  const handlePlus = (e: React.MouseEvent) => {
    e.preventDefault();
    setProgress((p) => Math.min(100, p + 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = 0;
    val = Math.max(0, Math.min(100, val));
    setProgress(val);
  };

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      // 🛠️ 调节区 1：外层容器的底部边距
      // 我在这里加了 pb-8 md:pb-10 (以前是和四周一样的 p-6)，这会把卡片内部底部的“地面”垫高，强制把中间数字往上顶。
      className="relative group bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[2rem] p-5 md:p-6 pb-8 md:pb-10 flex flex-col justify-between h-full shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden min-h-[160px]"
    >
       <div className="absolute -right-8 -top-8 w-32 h-32 bg-fuchsia-500/10 blur-[40px] rounded-full group-hover:bg-fuchsia-500/30 transition-all duration-700 pointer-events-none" />

       <div className="relative z-10 flex items-center justify-between mb-2">
         <span className="flex items-center gap-2 text-slate-500 group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400 font-bold text-sm tracking-widest uppercase transition-colors duration-300">
           <Target className="w-4 h-4" /> 进度记录
         </span>
       </div>

       {/* 🛠️ 调节区 2：中间数字区域的位置 */}
       {/* 我在这里加了 mb-2 (margin-bottom)，如果想让数字继续往上走，可以改成 mb-4 或 mb-6 */}
       <div className="relative z-10 flex-1 flex flex-col justify-center items-center py-2 mb-2">
         <div className="flex items-center justify-center gap-2 w-full">
            
            <button 
              onClick={handleMinus}
              className={`p-1.5 md:p-2 rounded-full transition-all duration-300 active:scale-90 ${isHovered ? 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-500/40' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}
            >
              <Minus className="w-5 h-5" />
            </button>

            <div className="flex items-baseline justify-center group/input">
              <input
                type="number"
                value={progress}
                onChange={handleInputChange}
                className={`w-16 md:w-20 text-center text-5xl lg:text-6xl font-black bg-transparent outline-none transition-colors duration-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isHovered ? 'text-transparent bg-clip-text bg-gradient-to-br from-fuchsia-600 to-fuchsia-400 dark:from-white dark:to-fuchsia-500 drop-shadow-md' : 'text-slate-700 dark:text-slate-300'}`}
              />
              <span className={`font-black text-lg transition-colors duration-300 -ml-1 ${isHovered ? 'text-fuchsia-600/60 dark:text-fuchsia-400/60' : 'text-slate-400 dark:text-slate-600'}`}>%</span>
            </div>

            <button 
              onClick={handlePlus}
              className={`p-1.5 md:p-2 rounded-full transition-all duration-300 active:scale-90 ${isHovered ? 'bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-300 hover:bg-fuchsia-200 dark:hover:bg-fuchsia-500/40' : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'}`}
            >
              <Plus className="w-5 h-5" />
            </button>
         </div>
       </div>

       {/* 🛠️ 调节区 3：进度条的高度与粗细 */}
       {/* 这里的 h-3 决定了整个进度条容器的高度 (h-3 = 12px)。如果觉得不够粗，可以改为 h-4 (16px) 或 h-5 (20px) */}
       <div className="absolute bottom-0 left-0 h-5 w-full bg-slate-200/50 dark:bg-slate-800/50">
          <div 
            className="relative h-full bg-gradient-to-r from-fuchsia-500 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          >
             <div className="absolute top-0 right-0 w-3 h-full bg-white/60 blur-[2px] animate-pulse"></div>
          </div>
       </div>
    </div>
  );
}