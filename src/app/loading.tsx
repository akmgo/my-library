// src/app/loading.tsx
import { Loader2 } from "lucide-react";

// ============================================================================
// ⏳ 全局路由加载回退 UI (Global Loading Fallback)
// ============================================================================
export default function GlobalLoading() {
  return (
    /* 调整高度占比，避免与 Layout 叠加导致加载时出现滚动条抖动 */
    <div className="min-h-[80vh] w-full flex flex-col items-center justify-center relative">
      {/* 背后极其微弱的加载光晕 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-indigo-500/10 blur-[60px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-center">
        <Loader2 className="w-10 h-10 text-indigo-400/80 animate-spin mb-6 drop-shadow-[0_0_10px_rgba(99,102,241,0.4)]" />
        <p className="text-slate-400 font-medium tracking-widest animate-pulse text-sm">
          正在重组数字书房...
        </p>
      </div>
    </div>
  );
}
