// src/components/ui/BackButton.tsx
"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  
  return (
    <button
      onClick={() => router.back()} // 智能后退
      className={`group flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-lg shadow-slate-200/20 dark:shadow-black/20 hover:shadow-indigo-500/20 transition-all duration-500 hover:-translate-y-0.5 active:scale-95 z-50 ${className}`}
    >
      <div className="p-1 rounded-full bg-slate-100/50 dark:bg-slate-800/50 group-hover:bg-indigo-500 group-hover:text-white transition-colors duration-500">
      <ArrowLeft className="w-4 h-4 transition-all duration-300 ease-out group-hover:-translate-x-1" />
      </div>
      <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-500 hidden sm:inline">
        返回
      </span>
    </button>
  );
}