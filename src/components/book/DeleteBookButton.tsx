// src/components/book/DeleteBookButton.tsx
"use client";

import { useState, useTransition } from "react";
import { Trash2, Loader2, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteBookFromDB } from "../../app/actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";

export default function DeleteBookButton({
  bookId,
  title,
}: {
  bookId: string;
  title: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteBookFromDB(bookId);
      if (result.success) {
        setOpen(false);
        // 删除成功后瞬间跳转回首页，Next.js 会自动更新路由缓存
        router.push("/");
      } else {
        alert("❌ 删除失败：" + result.error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {/* 🚀 触发按钮：平时极其克制，悬浮时展露红色的破坏性倾向 */}
        <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-white/5 border border-white/10 transition-all duration-300 hover:bg-red-500/15 hover:border-red-500/30 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:-translate-y-0.5 active:scale-95 text-slate-300 hover:text-red-400 group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/10 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
          <Trash2 className="w-4 h-4 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-300" />
          <span>删除此书</span>
        </button>
      </AlertDialogTrigger>

      {/* 🚀 弹窗容器：高级毛玻璃 + 深邃阴影 */}
      <AlertDialogContent className="sm:max-w-[420px] p-0 overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] transform-gpu">
        
        {/* 危险警告氛围光晕 */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-red-500/15 blur-[80px] rounded-full pointer-events-none"></div>

        <div className="p-7 relative z-10">
          <AlertDialogHeader className="mb-6">
            <div className="flex items-center gap-3 text-red-400 mb-3">
              <div className="p-2 bg-red-500/10 rounded-full border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                <AlertTriangle className="w-6 h-6 animate-pulse" />
              </div>
              <AlertDialogTitle className="text-2xl font-black tracking-tight text-white">
                确认删除？
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-slate-400 text-sm leading-relaxed mt-2">
              确定要将 <span className="text-slate-200 font-bold underline decoration-red-500/50 underline-offset-4">《{title}》</span> 移出书房吗？
              <br />
              <span className="text-red-400/80 mt-2 block">此操作将永久抹去这本书及其所有的珍贵摘录，且无法撤销！</span>
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-8 pt-6 border-t border-white/5 flex gap-3 sm:gap-0">
            <AlertDialogCancel className="rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
              我再想想
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isPending}
              className="rounded-xl bg-red-600/90 text-white hover:bg-red-500 border border-red-500 hover:shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-all"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isPending ? "正在抹除..." : "残忍删除"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}