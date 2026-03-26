// src/components/book/AddExcerptDialog.tsx
"use client";

import { useState } from "react";
import { Plus, Loader2, Quote } from "lucide-react";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { addExcerptToDB } from "../../app/actions";

export default function AddExcerptDialog({
  bookId,
  onSuccess,
}: {
  bookId: string;
  onSuccess?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);

    try {
      const result = await addExcerptToDB(bookId, content);

      if (result.success) {
        setOpen(false);
        setContent("");
        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert("❌ 保存摘录失败：" + result.error);
      }
    } catch (error) {
      alert("💥 发生致命异常，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 🚀 修复点 1：把危险的红色替换为代表灵感与记录的“翠绿色 (Emerald)”，并加入扫光特效 */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-emerald-500/10 border border-emerald-500/20 transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95 text-emerald-400 hover:text-emerald-300 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
        添加摘录
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* 🚀 修复点 2：弹窗全面升级为高级毛玻璃 (backdrop-blur-2xl) */}
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] transform-gpu">
          
          {/* 弹窗背景光晕：翠绿灵感之光 */}
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-emerald-500/15 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="p-7 relative z-10">
            <DialogHeader className="mb-8 text-left space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 flex items-center gap-2">
                <Quote className="w-6 h-6 text-emerald-400" />
                新增摘录
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                记录下触动你的那一句话，或是一段深刻的思考。
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid w-full items-center gap-6">
              
              <div className="flex flex-col space-y-2.5">
                <textarea
                  placeholder="请输入摘录内容..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  rows={6}
                  // 🚀 修复点 3：输入框玻璃质感 + 翠绿色高亮圈 + 自定义滚动条
                  className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-none transition-all custom-scrollbar leading-relaxed"
                />
              </div>

              {/* 底部操作区 */}
              <div className="flex justify-end gap-3 mt-4 pt-6 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="rounded-xl bg-emerald-600/90 text-white hover:bg-emerald-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSubmitting ? "正在保存..." : "保存摘录"}
                </Button>
              </div>

            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}