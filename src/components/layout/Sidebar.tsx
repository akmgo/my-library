// src/components/layout/Sidebar.tsx
import Link from 'next/link';
import { Home, Library, BookOpen, PenTool, History, Settings } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 border-r border-border bg-muted/30 h-screen flex flex-col p-4">
      {/* 顶部 Logo / 标题区 */}
      <div className="font-semibold text-lg mb-8 px-2 tracking-tight">
        Akram's Library
      </div>

      {/* 主导航区 */}
      <nav className="space-y-1 flex-1">
        <Link href="/" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
          <Home className="w-4 h-4" />
          控制台
        </Link>
        <Link href="/books" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors">
          <Library className="w-4 h-4" />
          我的书架
        </Link>
        
        {/* 自定义书单/标签区 */}
        <div className="pt-6 pb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          探索与阅读
        </div>
        <Link href="/tags/xuanhuan" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors text-muted-foreground">
          <BookOpen className="w-4 h-4" />
          玄幻宇宙
        </Link>
        <Link href="/tags/tech" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors text-muted-foreground">
          <PenTool className="w-4 h-4" />
          技术开发
        </Link>
        <Link href="/tags/history" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors text-muted-foreground">
          <History className="w-4 h-4" />
          历史与哲学
        </Link>
      </nav>

      {/* 底部设置区 */}
      <div className="mt-auto pt-4 border-t border-border">
        <Link href="/settings" className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-muted text-sm font-medium transition-colors text-muted-foreground">
          <Settings className="w-4 h-4" />
          系统设置
        </Link>
      </div>
    </aside>
  );
}