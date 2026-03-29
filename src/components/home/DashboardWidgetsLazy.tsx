// src/components/home/DashboardWidgetsLazy.tsx
"use client";

import dynamic from "next/dynamic";

// 专门为重型的图表组件创建一个 Client 懒加载包装器
const DashboardWidgets = dynamic(() => import("./DashboardWidgets"), { 
  ssr: false 
});

export default function DashboardWidgetsLazy() {
  return <DashboardWidgets />;
}