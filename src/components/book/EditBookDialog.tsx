// src/components/book/EditBookDialog.tsx
"use client";

import { useState, useEffect } from "react";
import { Loader2, UploadCloud, X, Settings2, BookUp } from "lucide-react";
import { updateBook, getPresignedUrl } from "../../app/actions";

export default function EditBookDialog({
  book,
  onSuccess,
}: {
  book: { id: string; title: string; author: string; coverUrl: string };
  onSuccess: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // 表单状态
  const [title, setTitle] = useState(book.title);
  const [author, setAuthor] = useState(book.author);
  
  // 封面状态
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(book.coverUrl);

  // 每次打开弹窗时，确保数据是最新的回显数据
  useEffect(() => {
    if (open) {
      setTitle(book.title);
      setAuthor(book.author);
      setPreviewUrl(book.coverUrl);
      setSelectedFile(null);
    }
  }, [open, book]);

  // 💡 核心优化：脏值检测。只有信息发生实质性变化，才允许提交
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isUploading || !isDirty) return;
    
    setIsUploading(true);

    try {
      let finalCoverUrl = book.coverUrl; // 默认保留原封面

      // 如果用户选择了新封面，执行 R2 上传流
      if (selectedFile) {
        const presignRes = await getPresignedUrl(selectedFile.name, selectedFile.type);
        
        if (!presignRes.success || !presignRes.uploadUrl) {
          alert("❌ 获取 R2 上传凭证失败: " + presignRes.error);
          setIsUploading(false);
          return;
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

      // 增量更新 D1 数据库
      const result = await updateBook(book.id, { 
        title: title.trim(), 
        author: author.trim(), 
        coverUrl: finalCoverUrl 
      });

      if (result.success) {
        setOpen(false);
        onSuccess(); // 触发外层详情页的数据刷新，实现局部无感刷新
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
      {/* ✨ 触发按钮：与 DeleteBookButton 形成统一的白玉/磨砂视觉基因 */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-white/70 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 transition duration-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:border-indigo-200 dark:hover:border-indigo-500/30 shadow-sm hover:shadow-md dark:shadow-none hover:-translate-y-0.5 active:scale-95 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 backdrop-blur-xl group"
        title="编辑书籍信息"
      >
        <Settings2 className="w-4 h-4 group-hover:rotate-45 transition-transform duration-500" />
        <span className="hidden sm:inline">编辑</span>
      </button>

      {open && (
        // ✨ 完美的视口居中锁定
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
                  <BookUp className="w-6 h-6 text-indigo-500" />
                  编辑档案
                </h3>
                <button onClick={() => setOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">书名</label>
                  <input 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                    className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">作者</label>
                  <input 
                    value={author} 
                    onChange={(e) => setAuthor(e.target.value)} 
                    required 
                    className="w-full h-12 px-4 bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-1">封面图像 (点击更换)</label>
                  <div className="relative h-32 w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 group transition-all cursor-pointer">
                    <img src={previewUrl} className="w-full h-full object-cover" alt="封面预览" />
                    
                    {/* 悬浮时显示重新上传的提示遮罩 */}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <UploadCloud className="w-6 h-6 text-white mb-1" />
                      <span className="text-xs text-slate-200 font-medium">点击替换图片</span>
                    </div>
                    
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-20" title="更换封面" />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-white/5 mt-4">
                  <button type="button" onClick={() => setOpen(false)} className="px-6 py-2.5 text-sm font-bold rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-750 transition-all shadow-sm">
                    取消
                  </button>
                  <button 
                    type="submit" 
                    disabled={isUploading || !isDirty} 
                    className="px-8 py-2.5 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:bg-slate-300 dark:disabled:bg-slate-700 flex items-center gap-2"
                  >
                    {isUploading && <Loader2 className="w-4 h-4 animate-spin" />}
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