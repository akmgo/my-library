// src/components/book/AddExcerptDialog.tsx
"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
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
        alert("保存摘录失败：" + result.error);
      }
    } catch (error) {
      alert("发生错误，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* 🚀 修复点：彻底去掉 ShimmerButton 嵌套，直接使用清爽的玻璃拟态 button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-300 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 active:scale-95 text-slate-300 hover:text-indigo-300 group"
      >
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        添加摘录
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border border-slate-800 bg-slate-950 rounded-xl shadow-[0_0_40px_-10px_rgba(99,102,241,0.4)] transform-gpu">
          <div className="p-6 relative z-10">
            <DialogHeader className="mb-6 text-left space-y-1.5">
              <DialogTitle className="text-xl font-bold leading-none tracking-tight text-white">
                新增摘录
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400 mt-2">
                记录下触动你的那一句话，或是一段深刻的思考。
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <div className="grid w-full items-center gap-5">
                <div className="flex flex-col space-y-2">
                  <textarea
                    placeholder="输入摘录内容..."
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    required
                    rows={6}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-700 resize-none transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="border-slate-800 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors"
                >
                  {isSubmitting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  保存摘录
                </Button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}