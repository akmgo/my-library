// src/components/ui/TiltCard.tsx
"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React from "react";

export default function TiltCard({ children }: { children: React.ReactNode }) {
  // 记录鼠标相对卡片中心的位置
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // 添加物理弹簧效果，让回正和倾斜极其丝滑 (阻尼感极强)
  const mouseXSpring = useSpring(x, { stiffness: 150, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 150, damping: 20 });

  // 将鼠标位置映射为 3D 旋转角度 (最大倾斜 10 度)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    // 计算鼠标在卡片上的相对位置 (-0.5 到 0.5)
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    // 鼠标离开时丝滑回正
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="w-full h-full [perspective:1000px] relative z-20 transition-shadow duration-500 hover:shadow-[0_30px_60px_-15px_rgba(99,102,241,0.3)] rounded-[2.5rem]"
    >
      {/* 内部容器反向位移，制造景深感 */}
      <motion.div
        style={{ transform: "translateZ(30px)" }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}