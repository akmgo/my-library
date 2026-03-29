// src/components/book/EditBookDialog.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Loader2,
  UploadCloud,
  X,
  Settings2,
  BookUp,
  Image as ImageIcon,
} from "lucide-react";
import { updateBook } from "../../app/actions/books";
import { getPresignedUrl } from "../../app/actions/storage";

export default function EditBookDialog({
  book,
  onSuccess,
}: {
  book: {
    id: string;
    title: string;
    author: string;
    coverUrl: string;
  };
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(book.coverUrl);

  useEffect(() => {
    if (open) {
      setTitle(book.title);
      setAuthor(book.author);
      setPreviewUrl(book.coverUrl);
      setSelectedFile(null);
    }
  }, [open, book]);

  const isDirty =
    title.trim() !== book.title ||
    author.trim() !== book.author ||
    selectedFile !== null;

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };
  
  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isUploading || !isDirty) return;
    setIsUploading(true);

    try {
      let finalCoverUrl = book.coverUrl;

      if (selectedFile) {
        const presignRes = await getPresignedUrl(
          selectedFile.name,
          selectedFile.type
        );
        if (!presignRes.success || !presignRes.uploadUrl) {
          alert("❌ 获取图片上传凭证失败");
          setIsUploading(false);
          return;
        }
        await fetch(presignRes.uploadUrl, {
          method: "PUT",
          body: selectedFile,
          headers: { "Content-Type": selectedFile.type },
        });
        finalCoverUrl = presignRes.finalUrl;
      }

      const result = await updateBook(book.id, {
        title: title.trim(),
        author: author.trim(),
        coverUrl: finalCoverUrl,
      });

      if (result.success) {
        setOpen(false);
        onSuccess();
      } else {
        alert("❌ 更新失败：" + result.error);
      }
    } catch (error: any) {
      alert("💥 发生致命异常: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-white/70 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 transition duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm hover:shadow-md dark:shadow-none hover:-translate-y-0.5 active:scale-95 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 backdrop-blur-xl group"
      >
        <Settings2 className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
        <span className="hidden sm:inline">编辑</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center h-[100dvh] w-screen overflow-hidden">
          <div
            className="fixed inset-0 bg-slate-950/20 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => setOpen(false)}
          />

          <div className="relative w-[95%] max-w-[640px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />

            <div className="p-8 relative z-10">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                  <BookUp className="w-6 h-6 text-indigo-500" />
                  编辑档案
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* ✨ 核心重构：左右对齐的分栏布局 */}
                <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-center mt-4">
                  
                  {/* 左侧专区：基础信息 */}
                  <div className="flex-1 w-full flex flex-col justify-center">
                    {/* 1. 书名 */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                        书名 (Title)
                      </label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>

                    {/* ✨ 2. 放大版 Metadata 装饰 */}
                    <div className="flex items-center justify-center w-full relative py-6 opacity-90 hover:opacity-100 transition-opacity duration-500">
                      <div className="h-[2px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-slate-300 dark:to-slate-600 rounded-full"></div>
                      <div className="mx-4 flex items-center gap-3 px-5 py-2.5 rounded-full border border-slate-200/80 dark:border-slate-700/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 dark:bg-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.8)] animate-pulse"></div>
                        <span className="text-xs font-black tracking-[0.25em] uppercase text-slate-500 dark:text-slate-400">
                          Metadata
                        </span>
                      </div>
                      <div className="h-[2px] flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-700 to-slate-300 dark:to-slate-600 rounded-full"></div>
                    </div>

                    {/* 3. 作者 */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                        作者 (Author)
                      </label>
                      <input
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        required
                        className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  {/* 右侧专区：缩小版封面海报 (固定宽度 140px) */}
                  <div className="shrink-0 w-32 md:w-[140px] flex flex-col items-center">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 mb-3 flex items-center gap-1 w-full justify-center">
                      <ImageIcon className="w-3 h-3" /> 实体封面图
                    </label>
                    {previewUrl ? (
                      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-800/50 group transition-all bg-slate-100 dark:bg-slate-950/70 shadow-inner">
                        <img
                          src={previewUrl}
                          className="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500 bg-slate-100 dark:bg-slate-900"
                          alt="封面预览"
                        />
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <UploadCloud className="w-6 h-6 text-white mb-1" />
                          <span className="text-xs text-slate-200">
                            点击替换
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleClearImage();
                          }}
                          className="absolute top-2 right-2 p-1 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-30 hover:bg-rose-500"
                        >
                          <X className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    ) : (
                      <div className="relative aspect-[2/3] w-full rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800/50 hover:border-indigo-400 transition-all bg-indigo-50/50 dark:bg-indigo-950/20 group">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <UploadCloud className="w-8 h-8 text-indigo-300 dark:text-indigo-600/60 mb-3 group-hover:text-indigo-400 transition-colors" />
                          <span className="text-[11px] text-indigo-400/80 font-medium text-center">
                            点击或拖拽
                          </span>
                          <span className="text-[9px] text-indigo-300/60 mt-1 text-center">
                            比例 2:3
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 底部按钮区 */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-4">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-500/30 transition-all duration-300 active:scale-90 shadow-sm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !isDirty}
                    className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 flex items-center gap-2"
                  >
                    {isUploading && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                    {isUploading ? "保存中..." : "保存修改"}
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