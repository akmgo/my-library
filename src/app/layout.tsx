// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "我的数字书房",
  description: "极简的个人阅读展厅",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      {/* 整体背景设为极深的 slate-950，文字默认设为亮色 */}
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500/30 relative overflow-x-hidden">
        
        {/* ================= 固定的深邃氛围光层 (无任何网格) ================= */}
        <div className="fixed inset-0 z-[-1] h-full w-full bg-slate-950">
          {/* 左上角的暗靛蓝色弥散光晕 (透明度调高到 15%，肉眼绝对可见) */}
          <div className="absolute top-[-10%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-600/15 blur-[120px]"></div>
          
          {/* 右下角的暗紫色弥散光晕 */}
          <div className="absolute bottom-[-10%] right-[-10%] h-[600px] w-[600px] rounded-full bg-purple-600/15 blur-[120px]"></div>
        </div>

        {/* ================= 你的主体内容 ================= */}
        <main className="w-full relative z-10">
          {children}
        </main>
        
      </body>
    </html>
  );
}