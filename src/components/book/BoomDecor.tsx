// src/components/book/BoomDecor.tsx
"use client"; // 声明这是客户端组件

import { motion } from "framer-motion";

export default function BoomDecor() {
  return (
    <div className="flex-1 flex items-center justify-center bg-slate-950/50 border border-slate-800/80 rounded-[2rem] p-4 relative overflow-hidden group cursor-pointer pointer-events-auto min-h-[120px]">
      {/* 背景光晕 */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* 极速响应的动画文字 */}
      <motion.div 
        whileHover={{ 
          scale: 1.2, 
          rotate: -5,
          transition: { type: "spring", stiffness: 400, damping: 10 } 
        }}
        whileTap={{ scale: 0.9 }}
        className="relative z-10 select-none"
      >
        <span className="text-4xl md:text-5xl font-black italic tracking-tighter text-slate-800 group-hover:text-white transition-colors duration-200">
          BOOM
          <span className="text-indigo-500 group-hover:text-indigo-400">!</span>
        </span>
      </motion.div>
    </div>
  );
}