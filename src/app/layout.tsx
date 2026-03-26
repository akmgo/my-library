// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

// ============================================================================
// 📄 全局元数据配置 (SEO & 页面标签)
// ============================================================================
export const metadata: Metadata = {
  title: "我的数字书房 | My Library",
  description: "极简、沉浸式的个人阅读展厅与数据看板",
};

// ============================================================================
// 🚀 根布局组件 (Root Layout)
// ============================================================================
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // 强制声明中文与暗黑模式，确保所有 UI 组件默认渲染深色主题
    <html lang="zh-CN" className="dark">
      <body 
        className="antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 relative overflow-x-hidden custom-scrollbar"
      >
        
        {/* --- 区块 A：全局深邃氛围底色与环境光 --- */}
        {/* 加入 pointer-events-none 防止光晕层阻挡底层的鼠标事件 */}
        <div className="fixed inset-0 z-[-1] h-full w-full bg-slate-950 pointer-events-none">
          {/* 左上角：暗靛蓝色弥散光晕 */}
          <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-[120px]"></div>
          
          {/* 右下角：暗紫色弥散光晕 */}
          <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[120px]"></div>
        </div>

        {/* --- 区块 B：页面核心内容路由挂载点 --- */}
        <main className="w-full relative z-10 flex flex-col min-h-screen">
          {children}
        </main>
        
      </body>
    </html>
  );
}