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

import { ShimmerButton } from "../ui/shimmer-button";
import { BorderBeam } from "../ui/border-beam";

export default function AddExcerptDialog() {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [content, setContent] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    // 模拟网络请求延迟
    setTimeout(() => {
      setIsSubmitting(false);
      setOpen(false);
      setContent("");
    }, 500);
  };

  return (
    <>
      {/* 触发器：流光按钮 */}
      <ShimmerButton 
        onClick={() => setOpen(true)} 
        className="shadow-2xl flex items-center gap-2 px-4 py-2"
      >
        <Plus className="h-4 w-4 text-white" />
        <span className="text-center text-sm leading-none font-medium tracking-tight text-white">
          添加摘录
        </span>
      </ShimmerButton>

      {/* 弹窗本体 */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border border-slate-800 bg-slate-950 rounded-xl shadow-2xl">
          
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
                {/* 极致精简：只有一个巨大的文本输入区 */}
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
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  保存摘录
                </Button>
              </div>
            </form>
          </div>

          <BorderBeam duration={8} size={100} />
        </DialogContent>
      </Dialog>
    </>
  );
}