// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "../components/layout/Sidebar";

export const metadata: Metadata = {
  title: "个人图书馆",
  description: "极简的阅读管理与笔记空间",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      {/* h-screen: 让整个页面高度等于屏幕高度
        overflow-hidden: 隐藏最外层的滚动条
        flex: 开启弹性盒子布局 
      */}
      <body className="antialiased flex h-screen overflow-hidden bg-background text-foreground">
        
        {/* 左侧固定的导航栏 */}
        <Sidebar />

        {/* 右侧主内容区，flex-1 占据剩余所有空间，overflow-y-auto 允许内部垂直滚动 */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
        
      </body>
    </html>
  );
}
