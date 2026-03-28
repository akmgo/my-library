// src/components/book/BoomDecor.tsx
"use client";

import { Sparkles } from "lucide-react";

export default function BoomDecor() {
  return (
    // ✨ 容器双端适配：浅色用半透明白玉，深色用深空毛玻璃。悬浮时加入边框高光发色。
    <div className="flex-1 flex items-center justify-center bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-[2rem] p-4 relative overflow-hidden group min-h-[120px] cursor-pointer shadow-xl transition-all duration-500 hover:bg-white/80 dark:hover:bg-slate-800/60 hover:border-indigo-200 dark:hover:border-white/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.2)]">
      
      {/* 🌌 悬浮时的背景微光层：底色渐变保持不变，双端通用 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
      
      {/* ✨ 隐藏的对角线氛围光：加入光晕膨胀动画 (scale-150)，浅色下适当提亮 */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-400/20 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/40 dark:group-hover:bg-indigo-500/40 transition-all duration-700 group-hover:scale-150 transform"></div>
      <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-purple-400/20 dark:bg-purple-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-purple-500/40 dark:group-hover:bg-purple-500/40 transition-all duration-700 group-hover:scale-150 transform"></div>

      {/* 🚀 核心内容区 */}
      <div className="relative z-10 flex items-center gap-3 transform transition-transform duration-500 group-hover:scale-110">
        
        {/* 左侧星光：浅色下使用更深的 indigo-500 以保证对比度 */}
        <Sparkles className="w-5 h-5 text-indigo-500 dark:text-indigo-400 opacity-0 -rotate-45 group-hover:opacity-100 group-hover:rotate-0 transition-all duration-700" />
        
        {/* 现代优雅的排版：金属字体发光 */}
        {/* ✨ 文本双端适配：
            - 静止时：浅色呈低调银灰 (slate-300->400)，深色呈低调暗灰 (slate-600->500)
            - 悬浮时：浅色爆发出高饱和度的深紫蓝 (600)，深色爆发出明亮的亮紫蓝 (300->400)
            - 投影也做了对应的浓度适配
        */}
        <span className="text-3xl lg:text-4xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-500 group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-indigo-300 dark:group-hover:to-purple-400 transition-all duration-700 drop-shadow-sm group-hover:drop-shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:group-hover:drop-shadow-[0_0_20px_rgba(129,140,248,0.6)]">
          READ MORE
        </span>

        {/* 右侧星光：浅色下使用更深的 purple-500 */}
        <Sparkles className="w-5 h-5 text-purple-500 dark:text-purple-400 opacity-0 rotate-45 group-hover:opacity-100 group-hover:rotate-0 transition-all duration-700" />
        
      </div>
      
    </div>
  );
}