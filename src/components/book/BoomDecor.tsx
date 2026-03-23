// src/components/book/BoomDecor.tsx
"use client";

// 【引入正版组件】注意检查这里的路径是否与你本地一致
import { ComicText } from "../ui/comic-text"; 

export default function BoomDecor() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-900/40 border border-slate-800/60 rounded-[2rem] p-4 backdrop-blur-md relative overflow-hidden group cursor-default min-h-[120px]">
      
      {/* 悬浮光晕 */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* 正版 ComicText 容器 */}
      <div className="relative z-10 transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3">
        {/* 去掉了没必要的嵌套 motion.div，直接让 ComicText 发挥实力 
          增加 will-change-transform 提示浏览器提前分配 GPU 资源加速渲染
        */}
        <div className="will-change-transform">
          <ComicText className="text-4xl lg:text-5xl font-black tracking-tighter text-slate-700/50 group-hover:text-white/90 transition-colors duration-500">
            AKRAM BOOM!
          </ComicText>
        </div>
      </div>

    </div>
  );
}