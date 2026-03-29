// src/components/home/HeroHeader.tsx
import React from "react";

export default function HeroHeader() {
  const quote = "我心里一直都在暗暗设想，天堂应该是图书馆的模样";

  return (
    // 最纯粹的 HTML 结构，没有任何 hack 属性
    <header className="mt-20 mb-20 text-center w-full flex flex-col items-center relative z-10">
      
      {/* 极度克制的静态背景光晕：没有任何 pulse 或 spin 动画 */}
      <div className="absolute inset-0 w-full h-full -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[30%] w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[20%] right-[30%] w-[300px] h-[300px] bg-fuchsia-500/10 rounded-full blur-[80px]" />
      </div>

      {/* ================= 标题区 (绝对静态) ================= */}
      <div className="relative mb-14 md:mb-16 pt-6">
        {/* 仅保留静态的渐变色，没有任何背景位移或动画 */}
        <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter pb-2 text-transparent bg-clip-text bg-gradient-to-r from-slate-700 via-indigo-500 to-slate-700 dark:from-slate-400 dark:via-fuchsia-300 dark:to-slate-400 drop-shadow-sm">
          图书馆
        </h1>
      </div>

      {/* ================= 名言区 (绝对静态) ================= */}
      <div className="max-w-2xl px-6 min-h-[60px] flex items-center justify-center relative">
         {/* 纯文本，没有任何阴影呼吸或打字机效果 */}
         <span className="text-xl md:text-2xl leading-relaxed font-serif tracking-widest text-slate-600 dark:text-slate-300">
           {quote}
         </span>
      </div>
      
    </header>
  );
}