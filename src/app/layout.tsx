// src/app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import ThemeToggle from "../components/providers/ThemeToggle";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Library",
  description: "极简、沉浸式的个人阅读展厅与数据看板",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // ✨ 1. 移除写死的 className="dark"，并添加 suppressHydrationWarning
    <html lang="zh-CN" suppressHydrationWarning>
      {/* ✨ 2. 为 body 添加过渡动画 duration-500，以及浅色/深色的全局背景 */}
      <body 
        className="antialiased min-h-screen custom-scrollbar relative overflow-x-hidden transition-colors duration-500 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system" // 默认跟随系统
          enableSystem
          disableTransitionOnChange={false} // 允许切换时有过渡动画
        >
          {/* 左上角主题切换按钮 */}
          <ThemeToggle />

          {/* --- 全局深邃/明亮氛围底色与环境光 --- */}
          <div className="fixed inset-0 z-[-1] h-full w-full pointer-events-none transition-all duration-700 overflow-hidden">
            
            {/* 1. 左上角光晕 */}
            {/* 深色：神秘靛蓝 (indigo-600) | 浅色：清新天空蓝 (sky-300) */}
            <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-sky-300/20 dark:bg-indigo-600/15 blur-[120px] transition-colors duration-700"></div>
            
            {/* 2. 右下角光晕 */}
            {/* 深色：暗紫色 (purple-600) | 浅色：柔和洋红色 (fuchsia-300) */}
            <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-fuchsia-300/20 dark:bg-purple-600/15 blur-[120px] transition-colors duration-700"></div>
            
            {/* 3. ✨ 浅色模式专属：中间偏下的暖阳色调 (深色模式下透明度为0隐藏) */}
            {/* 加入一抹淡淡的暖黄色，能中和蓝紫色的冷冽，让浅色页面看起来像早晨的阳光一样舒适 */}
            <div className="absolute top-[40%] left-[20%] h-[500px] w-[500px] rounded-full bg-amber-200/20 opacity-100 dark:opacity-0 blur-[120px] transition-opacity duration-700"></div>
            
          </div>

          <main className="w-full relative z-10 flex flex-col min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}