// src/components/book/AddBookDialog.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, UploadCloud, Search, X, BookPlus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { addBookToDB, searchBookByTitle, uploadCoverImage, getPresignedUrl} from "../../app/actions";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

export default function AddBookDialog() {
  const router = useRouter(); // 引入 Next.js 路由用于无感刷新
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // 🔍 智能提取作者
  // ============================================================================
  const handleAutoFill = async () => {
    const currentTitle = titleRef.current?.value.trim();
    if (!currentTitle) {
      alert("请先输入书名！");
      return;
    }

    setIsSearching(true);
    const res = await searchBookByTitle(currentTitle);

    if (res.success && res.book && res.book.author) {
      if (authorRef.current) authorRef.current.value = res.book.author;
    } else {
      alert("开源书库未匹配到该书作者，请手动填写~");
    }
    setIsSearching(false);
  };

  // ============================================================================
  // 🖼️ 封面图片处理
  // ============================================================================
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  // ============================================================================
  // 🚀 提交表单 (前端直传 R2 + 存入 D1)
  // ============================================================================
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isUploading) return;

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    const formElement = e.currentTarget;

    setIsUploading(true);

    try {
      let finalCoverUrl = DEFAULT_COVER;

      if (selectedFile) {
        // 1. 恢复：获取上传凭证
        const presignRes = await getPresignedUrl(selectedFile.name, selectedFile.type);
        if (!presignRes.success || !presignRes.uploadUrl) {
          alert("❌ 获取凭证失败: " + presignRes.error);
          setIsUploading(false);
          return;
        }

        // 2. 恢复：前端直接 PUT 到 R2
        const uploadResponse = await fetch(presignRes.uploadUrl, {
          method: "PUT",
          body: selectedFile,
          headers: { "Content-Type": selectedFile.type },
        });

        if (!uploadResponse.ok) {
          throw new Error(`R2 状态码异常: ${uploadResponse.status}`);
        }
        finalCoverUrl = presignRes.finalUrl;
      }

      // 3. 存入 D1
      const result = await addBookToDB({ title, author, coverUrl: finalCoverUrl });

      if (result.success) {
        formElement.reset();
        handleClearImage();
        setOpen(false);
        router.refresh(); // 或 window.location.reload()
      } else {
        alert("❌ 保存失败：" + result.error);
      }
    } catch (error: any) {
      alert("💥 发生致命异常: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* 🚀 修改点 1：把危险的红色，改成了代表新生的靛蓝色 (Indigo)，并加入了呼吸光效 */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-indigo-500/10 border border-indigo-500/20 transition-all duration-300 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 active:scale-95 text-indigo-300 hover:text-indigo-200 group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/10 to-indigo-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
        录入新书
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        {/* 🚀 修改点 2：弹窗全面升级为高级毛玻璃 (backdrop-blur-2xl) */}
        <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border border-white/10 bg-slate-900/80 backdrop-blur-2xl rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] transform-gpu">
          
          {/* 弹窗背景光晕 */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full pointer-events-none"></div>
          
          <div className="p-7 relative z-10">
            <DialogHeader className="mb-8 text-left space-y-2">
              <DialogTitle className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 flex items-center gap-2">
                <BookPlus className="w-6 h-6 text-indigo-400" />
                添置新书
              </DialogTitle>
              <DialogDescription className="text-sm text-slate-400">
                输入书名后点击搜索图标，可智能提取作者。
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="grid w-full items-center gap-6">
              
              {/* 书名输入框 */}
              <div className="flex flex-col space-y-2.5">
                <Label htmlFor="title" className="font-semibold text-slate-300 text-xs tracking-wider uppercase">书名</Label>
                <div className="relative group/input">
                  <Input
                    id="title"
                    name="title"
                    ref={titleRef}
                    placeholder="例如: 活着"
                    required
                    className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 pr-12 transition-all rounded-xl h-11"
                  />
                  <button
                    type="button"
                    onClick={handleAutoFill}
                    disabled={isSearching}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-slate-800/80 hover:bg-indigo-500 hover:text-white text-slate-400 rounded-lg transition-all disabled:opacity-50"
                    title="智能提取作者"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 作者输入框 */}
              <div className="flex flex-col space-y-2.5">
                <Label htmlFor="author" className="font-semibold text-slate-300 text-xs tracking-wider uppercase">作者</Label>
                <Input
                  id="author"
                  name="author"
                  ref={authorRef}
                  placeholder="例如: 余华"
                  required
                  className="bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-600 focus-visible:ring-indigo-500 focus-visible:border-indigo-500 transition-all rounded-xl h-11"
                />
              </div>

              {/* 封面上传区 */}
              <div className="flex flex-col space-y-2.5 mt-2">
                <Label className="font-semibold text-slate-300 text-xs tracking-wider uppercase">封面图像 (可选)</Label>

                {previewUrl ? (
                  <div className="relative w-full h-36 rounded-xl border border-slate-700 overflow-hidden group shadow-inner">
                    <img src={previewUrl} alt="封面预览" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <button
                        type="button"
                        onClick={handleClearImage}
                        className="p-2 bg-red-500/90 hover:bg-red-600 text-white rounded-full backdrop-blur-md transition-transform hover:scale-110 shadow-lg"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative group cursor-pointer">
                    <Input id="cover" type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="flex flex-col items-center justify-center w-full h-32 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/30 group-hover:bg-indigo-500/5 group-hover:border-indigo-500/50 transition-all duration-300">
                      <div className="p-3 bg-slate-800 rounded-full mb-3 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                        <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-indigo-400" />
                      </div>
                      <span className="text-xs font-medium text-slate-500 group-hover:text-indigo-300 transition-colors">点击或拖拽上传封面</span>
                    </div>
                  </div>
                )}
              </div>

              {/* 底部按钮 */}
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-white/5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border-slate-700 bg-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isUploading}
                  className="rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
                >
                  {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isUploading ? "正在上传..." : "确认录入"}
                </Button>
              </div>
              
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}