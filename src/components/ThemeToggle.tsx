// src/components/ThemeToggle.tsx
"use client";

import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // 避免服务端渲染和客户端首屏的 hydration 不匹配
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  // 判断当前到底是什么模式（兼容 system 模式）
  const currentTheme = theme === "system" ? systemTheme : theme;

  return (
    <button
      onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
      className="fixed top-8 left-8 z-50 p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl border border-slate-200 dark:border-white/10 shadow-lg text-slate-700 dark:text-indigo-300 hover:scale-110 active:scale-95 transition-all duration-500 overflow-hidden group"
      title="切换深浅色主题"
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {/* 太阳图标 (浅色模式显示，深色模式隐藏) */}
        <Sun 
          className={`absolute w-5 h-5 transition-all duration-500 transform ${
            currentTheme === "dark" ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 text-amber-500"
          }`} 
        />
        {/* 月亮图标 (深色模式显示，浅色模式隐藏) */}
        <Moon 
          className={`absolute w-5 h-5 transition-all duration-500 transform ${
            currentTheme === "dark" ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50"
          }`} 
        />
      </div>
    </button>
  );
}