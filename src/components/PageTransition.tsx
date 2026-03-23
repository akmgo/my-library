// src/components/PageTransition.tsx
"use client";

import { motion } from "framer-motion";

export default function PageTransition({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}    // 初始状态：透明且稍微偏下
      animate={{ opacity: 1, y: 0 }}     // 动画结束：完全不透明且归位
      transition={{ 
        duration: 0.6,                   // 动画持续时间（刚好掩盖视频加载时间）
        ease: [0.22, 1, 0.36, 1]         // 高级 Apple 风格阻尼曲线
      }}
    >
      {children}
    </motion.div>
  );
}