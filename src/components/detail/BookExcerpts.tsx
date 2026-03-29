// src/components/detail/BookExcerpts.tsx
"use client";

import dynamic from "next/dynamic"; // ✨ 引入 dynamic

// ✨ 3. 就地懒加载：添加摘录的富文本表单等代码，按需下载
const AddExcerptDialog = dynamic(() => import("../dialogs/AddExcerptDialog"), { 
  ssr: false,
  loading: () => <div className="w-24 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
});

export default function BookExcerpts({ bookId, excerpts, onSuccess }: { bookId: string; excerpts: any[]; onSuccess: () => void }) {
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight drop-shadow-sm dark:drop-shadow-md transition-colors">
          摘录与笔记
        </h2>
        <AddExcerptDialog bookId={bookId} onSuccess={onSuccess} />
      </div>

      {excerpts.length === 0 ? (
        <div className="py-24 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl border border-slate-300 dark:border-slate-800 border-dashed transition-colors duration-500">
          <p className="text-slate-500 dark:text-slate-400 text-lg mb-2 transition-colors">
            这本书还没有留下任何思考的痕迹
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-600 transition-colors">
            点击右上角按钮，记录下你的第一条摘录
          </p>
        </div>
      ) : (
        <div className="columns-1 md:columns-2 gap-6 space-y-6">
          {excerpts.map((excerpt) => (
            <div
              key={excerpt.id}
              className="break-inside-avoid mb-6 p-8 md:p-10 rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-slate-500 transition-colors shadow-xl dark:shadow-2xl relative group inline-block w-full"
            >
              <span className="absolute top-6 left-6 text-6xl text-slate-200 dark:text-slate-700/30 font-serif leading-none select-none transition-colors">
                "
              </span>
              <p className="text-slate-700 dark:text-slate-200 leading-loose font-serif text-lg md:text-xl whitespace-pre-wrap relative z-10 pl-6 transition-colors">
                {excerpt.content}
              </p>
              <div className="mt-8 text-sm text-slate-400 dark:text-slate-500 text-right font-medium transition-colors">
                —— 记录于 {new Date(excerpt.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}