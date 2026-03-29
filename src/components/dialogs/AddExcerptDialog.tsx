// src/components/book/AddExcerptDialog.tsx
"use client";

import { useState } from "react";
import { Plus, Loader2, Quote, Send } from "lucide-react";
import { addExcerptToDB } from "../../app/actions/excerpts";

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
    if (!content.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await addExcerptToDB(bookId, content);
      if (result.success) {
        setOpen(false);
        setContent("");
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-emerald-500/10 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 transition-all duration-300 hover:bg-emerald-500/20 hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:-translate-y-0.5 active:scale-95 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 group relative overflow-hidden backdrop-blur-md"
      >
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
        添加摘录
      </button>

      {open && (
        // ✨ 强制居中定位
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-950/40 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setOpen(false)} 
          />
          
          <div className="relative w-full max-w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-500/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-8 relative z-10">
              <div className="mb-8">
                <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                  <Quote className="w-6 h-6 text-emerald-500" />
                  新增摘录
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <textarea
                    placeholder="输入那些值得被铭记的内容..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required rows={6}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-all resize-none leading-loose font-serif custom-scrollbar"
                  />
                </div>

                {/* 🚀 修复 2：对齐两侧按钮，设计语言统一 */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750 hover:border-slate-300 dark:hover:border-slate-600 transition-all active:scale-95 shadow-sm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !content.trim()}
                    className="px-8 py-2.5 bg-emerald-600 text-white text-sm font-bold rounded-xl hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {isSubmitting ? "保存记录" : "确认保存"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}