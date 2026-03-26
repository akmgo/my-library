// src/components/ClientOnly.tsx
"use client";

import { useState, useEffect } from "react";

// ============================================================================
// 🛡️ 客户端挂载防卫组件 (Client-Only Wrapper)
// ----------------------------------------------------------------------------
// 作用：强制包裹的子组件只在浏览器端渲染，完美解决 Next.js 的 Hydration Mismatch 报错。
// 常见场景：包含复杂动画、浏览器时间戳、或者强依赖 window/document 对象的组件。
// ============================================================================
export default function ClientOnly({ 
  children, 
  fallback = null 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // 在客户端正式挂载前，渲染传入的骨架屏 (Fallback) 或直接留白
  if (!hasMounted) {
    return <>{fallback}</>;
  }

  // 挂载完成后，安全渲染真实的客户端交互组件
  return <>{children}</>;
}