// src/components/archive/ArchiveClient.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LibraryBig, CalendarDays, CalendarCheck } from "lucide-react";
import { BackButton } from "@/components/ui/BackButton";

// 引入拆分后的三大视图组件
import AllArchiveView from "./views/AllArchiveView";
import YearlyTimelineView from "./views/YearlyTimelineView";
import InfiniteCalendarView from "./views/InfiniteCalendarView";

const TABS = [
  { id: "all", label: "全部档案", icon: LibraryBig },
  { id: "year", label: "今年轨迹", icon: CalendarDays },
  { id: "month", label: "时光拼图", icon: CalendarCheck },
];

export default function ArchiveClient({ books, readingLogs }: { books: any[]; readingLogs: any[] }) {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-500 selection:bg-indigo-500/30 overflow-x-hidden">
      
      {/* 🌌 底层极速光晕背景 (提取到最外层，切换 Tab 时永不重渲染) */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sky-300/30 dark:bg-indigo-600/15 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-1000 animate-in fade-in duration-1000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-300/30 dark:bg-purple-600/15 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-1000 animate-in fade-in duration-1000" />
        <div className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] bg-amber-200/30 dark:bg-transparent blur-[120px] rounded-full mix-blend-multiply transition-colors duration-1000" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10 w-full pt-8 pb-32">
        {/* 顶部悬浮导航栏 */}
        <div className="sticky top-6 z-50 flex justify-center mb-16 px-4">
          <div className="flex items-center p-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-black/50 transition-all duration-500">
            <BackButton className="flex top-8 left-8" />
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-4 md:mx-6" />
            
            <div className="flex items-center gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`group relative flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 z-10 ${
                      isActive ? "text-indigo-600 dark:text-white" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <motion.div layoutId="archive-tab-indicator" className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm dark:shadow-md border border-slate-100 dark:border-white/5" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                    )}
                    <Icon className={`relative z-20 w-4 h-4 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isActive ? "scale-110" : "group-hover:scale-125 group-hover:-rotate-12"}`} />
                    <span className={`relative z-20 hidden sm:inline-block transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-left ${isActive ? "scale-105" : "group-hover:scale-105"}`}>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 策略模式分发器：动态加载对应的视图组件 */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {activeTab === "all" && <AllArchiveView key="all-books" books={books} />}
            {activeTab === "year" && <YearlyTimelineView key="year-timeline" books={books} />}
            {activeTab === "month" && <InfiniteCalendarView key="infinite-calendar" readingLogs={readingLogs} />}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}