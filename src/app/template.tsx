// src/app/template.tsx
"use client";

import { motion } from "framer-motion";

// ============================================================================
// 🌌 全局路由过渡动画 (Apple iOS 风格: 空间推拉 + 毛玻璃)
// ============================================================================
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // 🚀 初始状态：页面稍微缩小 (96%)，透明度为 0，且带有一点毛玻璃模糊
      initial={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
      // 🚀 进场动画：放大到 100%，完全清晰
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      // 🚀 退场动画：迅速沉降并模糊
      exit={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
      // 🚀 Apple 级阻尼曲线：极其丝滑，开头快，结尾极其缓慢平滑
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className="w-full h-full flex flex-col flex-1"
    >
      {children}
    </motion.div>
  );
}