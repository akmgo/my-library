// src/components/book/AddBookDialog.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Loader2,
  UploadCloud,
  Search,
  X,
  BookPlus,
  Image as ImageIcon,
  FileImage,
} from "lucide-react";
import {
  addBookToDB,
  searchBookByTitle,
  getPresignedUrl,
} from "../../app/actions";

const DEFAULT_COVER =
  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

export default function AddBookDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const [verticalFile, setVerticalFile] = useState<File | null>(null);
  const [verticalPreviewUrl, setVerticalPreviewUrl] = useState("");

  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);

  const handleAutoFill = async () => {
    const currentTitle = titleRef.current?.value.trim();
    if (!currentTitle) {
      alert("请先输入书名！");
      return;
    }
    setIsSearching(true);
    const res = await searchBookByTitle(currentTitle);
    if (res.success && res.book?.author) {
      if (authorRef.current) authorRef.current.value = res.book.author;
    } else {
      alert("开源书库未匹配到该书作者，请手动填写~");
    }
    setIsSearching(false);
  };

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

  const handleVerticalImageSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVerticalFile(file);
    setVerticalPreviewUrl(URL.createObjectURL(file));
  };
  const handleClearVerticalImage = () => {
    setVerticalFile(null);
    setVerticalPreviewUrl("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isUploading) return;
    setIsUploading(true);

    try {
      const formData = new FormData(e.currentTarget);
      const title = formData.get("title") as string;
      const author = formData.get("author") as string;

      let finalCoverUrl = DEFAULT_COVER;
      let finalVerticalCoverUrl = DEFAULT_COVER;

      if (selectedFile) {
        const presignRes = await getPresignedUrl(
          selectedFile.name,
          selectedFile.type
        );
        if (!presignRes.success || !presignRes.uploadUrl) {
          alert("❌ 获取横版图片上传凭证失败");
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

      if (verticalFile) {
        const presignRes = await getPresignedUrl(
          verticalFile.name,
          verticalFile.type
        );
        if (!presignRes.success || !presignRes.uploadUrl) {
          alert("❌ 获取竖版图片上传凭证失败");
          setIsUploading(false);
          return;
        }
        await fetch(presignRes.uploadUrl, {
          method: "PUT",
          body: verticalFile,
          headers: { "Content-Type": verticalFile.type },
        });
        finalVerticalCoverUrl = presignRes.finalUrl;
      }

      const result = await addBookToDB({
        title,
        author,
        coverUrl: finalCoverUrl,
        verticalCoverUrl: finalVerticalCoverUrl,
      });

      if (result.success) {
        setOpen(false);
        handleClearImage();
        handleClearVerticalImage();
        router.refresh();
      } else {
        alert("❌ 数据库保存失败：" + result.error);
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
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-indigo-500/10 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 transition-all duration-300 hover:bg-indigo-500/20 hover:border-indigo-500/40 hover:shadow-lg dark:hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 active:scale-95 text-indigo-600 dark:text-indigo-300 backdrop-blur-md group relative overflow-hidden"
      >
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
        录入新书
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
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                  <BookPlus className="w-6 h-6 text-indigo-500" />
                  添置新书
                </h3>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 书名 */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                    书名
                  </label>
                  <div className="relative">
                    <input
                      name="title"
                      ref={titleRef}
                      placeholder="例如: 活着"
                      required
                      className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAutoFill}
                      disabled={isSearching}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 dark:hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all"
                    >
                      {isSearching ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* ✨ 优化对齐黄金网格 */}
                <div className="grid grid-cols-5 gap-6">
                  {/* 左侧专区： Col-span-3 (宽) - 包装为垂直 Flex 容器 */}
                  <div className="col-span-3 flex flex-col">
                    {/* 顶部元素：作者 */}
                    <div className="flex flex-col gap-2">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">
                          作者
                        </label>
                        <input
                          name="author"
                          ref={authorRef}
                          placeholder="例如: 余华"
                          required
                          className="w-full h-11 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    {/* ✨ 优化：全宽科技感枢纽装饰，完美衔接上下区域 */}
                    <div className="flex-grow flex items-center justify-center w-full relative py-2 opacity-80 hover:opacity-100 transition-opacity duration-500">
                      {/* 左侧延展渐变线 */}
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-slate-300 dark:to-slate-700"></div>
                      
                      {/* 中间核心：玻璃态胶囊 + 呼吸指示灯 */}
                      <div className="mx-3 flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200/60 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm shadow-sm">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 dark:bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)] animate-pulse"></div>
                        <span className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-400 dark:text-slate-500">
                          Metadata
                        </span>
                      </div>
                      
                      {/* 右侧延展渐变线 */}
                      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-slate-200 dark:via-slate-800 to-slate-300 dark:to-slate-700"></div>
                    </div>

                    {/* 底部元素：横版图 */}
                    <div className="flex flex-col gap-2 mt-auto">
                      <div className="space-y-2 flex flex-col">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1 flex items-center gap-1">
                          <ImageIcon className="w-3 h-3" /> 横版图
                        </label>
                        <div className="relative flex-1 min-h-[120px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group transition-all">
                          {previewUrl ? (
                            <>
                              <img
                                src={previewUrl}
                                className="w-full h-full object-cover"
                                alt="横版预览"
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
                            </>
                          ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/30 hover:border-indigo-400 transition-all">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                              />
                              <UploadCloud className="w-5 h-5 text-slate-300 dark:text-slate-600 mb-1" />
                              <span className="text-[10px] text-slate-400">
                                上传横版
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右侧专区： Col-span-2 (窄) - 保持原有对齐 */}
                  <div className="col-span-2 space-y-2 flex flex-col">
                    <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500 dark:text-indigo-400 ml-1 flex items-center gap-1">
                      <FileImage className="w-3 h-3" /> 竖版原始图 (推荐)
                    </label>
                    {verticalPreviewUrl ? (
                      <div className="relative aspect-[2/3] w-full rounded-2xl overflow-hidden border border-indigo-200 dark:border-indigo-800/50 group transition-all bg-slate-100 dark:bg-slate-950/70 shadow-inner">
                        <img
                          src={verticalPreviewUrl}
                          className="w-full h-full object-cover rounded-xl transform group-hover:scale-105 transition-transform duration-500 bg-slate-100 dark:bg-slate-900"
                          alt="竖版预览"
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
                          onChange={handleVerticalImageSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleClearVerticalImage();
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
                          onChange={handleVerticalImageSelect}
                          className="absolute inset-0 opacity-0 cursor-pointer z-20"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                          <UploadCloud className="w-8 h-8 text-indigo-300 dark:text-indigo-600/60 mb-3 group-hover:text-indigo-400 transition-colors" />
                          <span className="text-[11px] text-indigo-400/80 font-medium text-center">
                            点击或拖拽
                          </span>
                          <span className="text-[9px] text-indigo-300/60 mt-1 text-center">
                            比例 2:3 最佳
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 底部按钮区 */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-6 py-2.5 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:border-rose-500/30 transition-all duration-300 active:scale-90 shadow-sm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                    {isUploading ? "正在上传..." : "确认录入"}
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
