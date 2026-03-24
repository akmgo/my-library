// src/components/book/BoomDecor.tsx
"use client";

export default function BoomDecor() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-950 border border-slate-800 rounded-[2rem] p-4 relative overflow-hidden group min-h-[120px] cursor-pointer">
      
      {/* 悬浮时的背景光晕，改为呼应黄色的暖色调 */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-orange-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-105">
        {/* 【美化 2】：复古衬线美术字 + 深金黄色 + 悬浮黄金发光特效 */}
        <span className="text-4xl lg:text-5xl font-serif font-bold italic tracking-widest text-amber-600/70 group-hover:text-amber-400 transition-all duration-500 drop-shadow-sm group-hover:drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
          Read More
        </span>
      </div>
      
    </div>
  );
}