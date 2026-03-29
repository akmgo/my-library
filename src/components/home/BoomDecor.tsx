// src/components/book/BoomDecor.tsx
"use client";

import React, { useState } from "react";
import { Feather } from "lucide-react";
import { motion } from "framer-motion";

// ✨ 交互式毛玻璃特效：由父组件的 isHovered 状态精确控制
function BlurRevealText({ text, isHovered }: { text: string; isHovered: boolean }) {
  const chars = text.split("");

  return (
    <span>
      {chars.map((char, index) => (
        <motion.span
          key={index}
          // 当 isHovered 为 true 时触发关键帧动画，为 false 时瞬间回归静态
          animate={
            isHovered
              ? {
                  filter: ["blur(6px)", "blur(0px)"],
                  opacity: [0.4, 1],
                  y: [2, 0],
                  scale: [0.98, 1],
                }
              : {
                  filter: "blur(0px)",
                  opacity: 1,
                  y: 0,
                  scale: 1,
                }
          }
          transition={{
            duration: 0.5,
            // 极其讲究的延迟：只有在进入悬浮时有错落感，移出时无缝瞬间还原
            delay: isHovered ? index * 0.04 : 0, 
            ease: "easeOut",
          }}
          className="inline-block"
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

export default function BoomDecor() {
  // 增加 Hover 状态监听
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full h-full rounded-[2rem] p-5 md:p-6 flex items-center justify-between overflow-hidden shadow-sm hover:shadow-xl transition-all duration-700 group min-h-[120px] bg-white/40 dark:bg-slate-800/30 border border-slate-200/50 dark:border-white/5 hover:bg-gradient-to-br hover:from-indigo-500 hover:to-purple-600 dark:hover:from-indigo-950/60 dark:hover:to-purple-900/40 hover:border-transparent cursor-default"
    >
       {/* 纯 CSS 玻璃高光扫过 */}
       <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out skew-x-12 pointer-events-none" />

       {/* 左侧：文字区 (字号已放大) */}
       <div className="flex flex-col flex-1 min-w-0 pr-2 md:pr-4 z-10">
         <h3 className="text-slate-600 dark:text-slate-300 group-hover:text-white font-black text-2xl md:text-[1.75rem] tracking-tight transition-colors duration-500 truncate whitespace-nowrap">
           <BlurRevealText text='"读书，是一场随身携带的避难所。"' isHovered={isHovered} />
         </h3>
         <p className="text-slate-400 dark:text-slate-500 group-hover:text-white/70 text-xs md:text-sm mt-2 font-bold tracking-widest uppercase transition-colors duration-500 truncate whitespace-nowrap">
           W.S. Maugham
         </p>
       </div>

       {/* ✨ 右侧：羽毛笔扇形群落 (尺寸激增，动态散开) */}
       <div className="shrink-0 relative flex items-center justify-center w-20 h-20 md:w-24 md:h-24">
         {/* 背后弥散的光晕 */}
         <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-white/30 transition-colors duration-500"></div>
         
         
         
         {/* 核心主羽毛：正中间最大，悬浮时微微倾斜并变白 */}
         <Feather className="absolute z-10 w-12 h-12 md:w-14 md:h-14 text-slate-500 dark:text-slate-400 group-hover:text-white group-hover:scale-110 group-hover:-rotate-12 transition-all duration-500 ease-out" />
       </div>
       
    </div>
  );
}