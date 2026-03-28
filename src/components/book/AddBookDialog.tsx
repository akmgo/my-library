// src/components/book/AddBookDialog.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, UploadCloud, Search, X, BookPlus } from "lucide-react";
import { addBookToDB, searchBookByTitle, getPresignedUrl } from "../../app/actions";

const DEFAULT_COVER = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

export default function AddBookDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const titleRef = useRef<HTMLInputElement>(null);
  const authorRef = useRef<HTMLInputElement>(null);

  const handleAutoFill = async () => {
    const currentTitle = titleRef.current?.value.trim();
    if (!currentTitle) { alert("请先输入书名！"); return; }
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isUploading) return;
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const author = formData.get("author") as string;
    
    setIsUploading(true);

    try {
      let finalCoverUrl = DEFAULT_COVER;

      // 🚀 恢复严格的上传逻辑：如果有选择文件，必须上传成功，否则报错
      if (selectedFile) {
        const presignRes = await getPresignedUrl(selectedFile.name, selectedFile.type);
        
        if (!presignRes.success || !presignRes.uploadUrl) {
          // 还原报错提示
          alert("❌ 获取 R2 上传凭证失败: " + presignRes.error);
          setIsUploading(false);
          return; // 阻断流程，不进行后续数据库操作
        }

        const uploadResponse = await fetch(presignRes.uploadUrl, {
          method: "PUT",
          body: selectedFile,
          headers: { "Content-Type": selectedFile.type },
        });

        if (!uploadResponse.ok) {
          throw new Error(`R2 拒绝了文件上传，状态码: ${uploadResponse.status}`);
        }
        finalCoverUrl = presignRes.finalUrl;
      }

      const result = await addBookToDB({ title, author, coverUrl: finalCoverUrl });
      if (result.success) {
        setOpen(false);
        handleClearImage();
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
        // ✨ 真正的视口锁定居中
        <div className="fixed inset-0 z-[999] flex items-center justify-center h-[100dvh] w-screen overflow-hidden">
          <div 
            className="fixed inset-0 bg-slate-950/20 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setOpen(false)} 
          />
          
          <div className="relative w-[95%] max-w-[420px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="p-8 relative z-10">
              <div className="mb-8 flex items-center justify-between">
                <h3 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
                  <BookPlus className="w-6 h-6 text-indigo-500" />
                  添置新书
                </h3>
                <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">书名</label>
                  <div className="relative">
                    <input name="title" ref={titleRef} placeholder="例如: 活着" required className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
                    <button type="button" onClick={handleAutoFill} disabled={isSearching} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white dark:bg-slate-800 text-slate-400 hover:text-indigo-500 dark:hover:text-white rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all">
                      {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">作者</label>
                  <input name="author" ref={authorRef} placeholder="例如: 余华" required className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">封面图像 (可选)</label>
                  {previewUrl ? (
                    <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group">
                      <img src={previewUrl} className="w-full h-full object-cover" alt="preview" />
                      <button type="button" onClick={handleClearImage} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-6 h-6 text-white" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative h-32 w-full flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/30 hover:border-indigo-400 dark:hover:border-indigo-500/50 transition-all">
                      <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-20" />
                      <UploadCloud className="w-8 h-8 text-slate-300 mb-2" />
                      <span className="text-xs text-slate-400">点击或拖拽上传封面</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-4">
                  <button type="button" onClick={() => setOpen(false)} className="px-6 py-2.5 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm">
                    取消
                  </button>
                  <button type="submit" disabled={isUploading} className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 flex items-center gap-2">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
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