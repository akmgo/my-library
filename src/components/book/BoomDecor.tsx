// src/components/book/BoomDecor.tsx
"use client";

import { Sparkles } from "lucide-react";

export default function BoomDecor() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-[2rem] p-4 relative overflow-hidden group min-h-[120px] cursor-pointer shadow-xl transition-all duration-500 hover:bg-slate-800/60 hover:border-white/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
      
      {/* 🌌 悬浮时的背景光晕：深空紫蓝渐变 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* ✨ 隐藏的对角线氛围光 */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/40 transition-colors duration-700"></div>
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-purple-500/40 transition-colors duration-700"></div>

      {/* 🚀 核心内容区 */}
      <div className="relative z-10 flex items-center gap-3 transform transition-transform duration-500 group-hover:scale-110">
        
        {/* 左侧星光：悬浮时浮现并旋转 */}
        <Sparkles className="w-5 h-5 text-indigo-400 opacity-0 -rotate-45 group-hover:opacity-100 group-hover:rotate-0 transition-all duration-700" />
        
        {/* 现代优雅的排版：金属字体发光 */}
        <span className="text-3xl lg:text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-500 group-hover:from-indigo-300 group-hover:to-purple-400 transition-all duration-700 drop-shadow-sm group-hover:drop-shadow-[0_0_20px_rgba(129,140,248,0.6)]">
          READ MORE
        </span>

        {/* 右侧星光：悬浮时浮现并反向旋转 */}
        <Sparkles className="w-5 h-5 text-purple-400 opacity-0 rotate-45 group-hover:opacity-100 group-hover:rotate-0 transition-all duration-700" />
        
      </div>
      
    </div>
  );
}