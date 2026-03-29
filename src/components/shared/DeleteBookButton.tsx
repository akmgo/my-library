// src/components/book/DeleteBookButton.tsx
"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteBookFromDB } from "../../app/actions/books";

export default function DeleteBookButton({
  bookId,
  title,
}: {
  bookId: string;
  title: string;
}) {
  const router = useRouter();
  
  // 使用 Next.js 原生的 transition 管理 pending 状态
  const [isPending, startTransition] = useTransition();
  // 控制二次确认面板的展开/收起
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBookFromDB(bookId);
      if (result.success) {
        setShowConfirm(false);
        // 删除成功后跳转回首页
        router.push("/");
      } else {
        alert("❌ 删除失败：" + result.error);
      }
    });
  };

  return (
    <div className="relative">
      {!showConfirm ? (
        // ✨ 统一后的删除按钮：默认和返回按钮保持一致的白玉胶囊，悬浮时透出红晕
        <button
          onClick={() => setShowConfirm(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-white/70 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 transition duration-300 hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:border-rose-200 dark:hover:border-rose-500/30 shadow-sm hover:shadow-md dark:shadow-none hover:-translate-y-0.5 active:scale-95 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 backdrop-blur-xl group"
          title={`删除 ${title}`}
        >
          <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">删除</span>
        </button>
      ) : (
        // ✨ 二次确认状态：红色警示色，带平滑滑出动画，完美适配深浅端
        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-full shadow-sm text-sm">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="text-rose-600 dark:text-rose-400 font-bold whitespace-nowrap">确定删除？</span>
          </div>
          
          <button
            onClick={handleDelete}
            disabled={isPending}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-full bg-rose-500 border border-rose-600 text-white transition duration-300 hover:bg-rose-600 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "确认"}
          </button>
          
          <button
            onClick={() => setShowConfirm(false)}
            disabled={isPending}
            className="inline-flex items-center justify-center px-4 py-2.5 text-sm font-bold rounded-full bg-white/70 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-slate-600 dark:text-slate-300 transition duration-300 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 backdrop-blur-xl"
          >
            取消
          </button>
        </div>
      )}
    </div>
  );
}