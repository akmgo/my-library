// src/components/home/HomeControls.tsx
"use client";

import Link from "next/link";
import { LibraryBig } from "lucide-react";
import dynamic from "next/dynamic";

// ✨ 在 Client Component 里使用 ssr: false 就完全合法了！
const AddBookDialog = dynamic(() => import("../dialogs/AddBookDialog"), {
  ssr: false,
  loading: () => (
    <button className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
  ),
});

export default function HomeControls() {
  return (
    <div className="flex absolute top-8 right-0 z-50 gap-4">
      <Link
        href="/archive"
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-white/60 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/10 transition duration-300 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-500/20 hover:border-fuchsia-200 dark:hover:border-fuchsia-500/30 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 text-slate-600 dark:text-slate-300 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 backdrop-blur-xl group"
      >
        <LibraryBig className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
        全景档案
      </Link>
      <AddBookDialog />
    </div>
  );
}