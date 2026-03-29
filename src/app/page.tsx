// src/app/page.tsx
import { Suspense } from "react";

// === 组件引入 ===
import HeroHeader from "../components/home/HeroHeader";
import LibrarySkeleton from "../components/home/LibrarySkeleton";
import HomeDashboard from "../components/home/HomeDashboard";
import HomeControls from "../components/home/HomeControls"; // ✨ 引入刚拆分出的控件

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="relative pb-24 w-[90%] md:w-[80%] mx-auto flex flex-col items-center min-h-screen">
      
      {/* 顶部控制栏 (封装为 Client Component 解决懒加载限制) */}
      <HomeControls />

      {/* 页面主标题 */}
      <HeroHeader />

      {/* 核心业务数据 (流式服务端渲染 Streaming SSR) */}
      <Suspense fallback={<LibrarySkeleton />}>
        <HomeDashboard />
      </Suspense>

    </div>
  );
}