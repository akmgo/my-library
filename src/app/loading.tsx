// src/app/loading.tsx
import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-xl transition-all duration-500">
      <div className="relative flex items-center justify-center">
        {/* 外圈光晕 */}
        <div className="absolute w-24 h-24 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
        {/* 内圈进度条 */}
        <div className="relative bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-2xl border border-slate-200/50 dark:border-white/10">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </div>
      <p className="mt-6 text-sm font-black tracking-[0.2em] text-slate-500 dark:text-slate-400 uppercase animate-pulse">
        Syncing Neural Archives...
      </p>
    </div>
  );
}