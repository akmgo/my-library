// src/components/detail/BookDetailClient.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic"; // ✨ 引入 dynamic

import { getBookDetail, updateBook } from "../../app/actions/books";
import DeleteBookButton from "../shared/DeleteBookButton"; // 注意路径已更新为 shared
import BookDossier from "./BookDossier";
import BookExcerpts from "./BookExcerpts";

// ✨ 2. 就地懒加载：用户不点击编辑，就绝对不下载编辑表单的代码！
const EditBookDialog = dynamic(() => import("../dialogs/EditBookDialog"), { 
  ssr: false 
});

export default function BookDetailClient({ 
  initialBook, 
  initialExcerpts 
}: { 
  initialBook: any; 
  initialExcerpts: any[] 
}) {
  const router = useRouter();
  const [book, setBook] = useState<any>(initialBook);
  const [excerpts, setExcerpts] = useState<any[]>(initialExcerpts);

  const fetchBookData = async () => {
    const res = await getBookDetail(book.id);
    if (res.success) {
      setBook(res.book);
      setExcerpts(res.excerpts || []);
    }
  };

  const handleBookUpdate = async (updates: any) => {
    setBook((prev: any) => ({ ...prev, ...updates }));
    const dbUpdates = { ...updates };
    if (dbUpdates.tags) dbUpdates.tags = JSON.stringify(dbUpdates.tags);
    await updateBook(book.id, dbUpdates);
  };

  const rawCoverUrl = book.verticalCoverUrl || book.coverUrl || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";
  const bgCoverUrl = rawCoverUrl.startsWith("data:") ? rawCoverUrl : `https://wsrv.nl/?url=${encodeURIComponent(rawCoverUrl)}&w=100&q=50&output=webp`;
  const mainCoverUrl = rawCoverUrl.startsWith("data:") ? rawCoverUrl : `https://wsrv.nl/?url=${encodeURIComponent(rawCoverUrl)}&w=800&q=80&output=webp`;

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-200 transition-colors duration-500">
      
      {/* 极速纯 CSS 背景渲染层 */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <Image src={bgCoverUrl} alt="Background" fill priority className="object-cover scale-125 blur-[120px] opacity-20 dark:opacity-40 saturate-200" unoptimized={true} />
        <div className="absolute inset-0 bg-slate-50/60 dark:bg-slate-950/60 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/80 to-slate-50 dark:via-slate-950/80 dark:to-slate-950" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-32 flex flex-col">
        
        {/* 控制栏 */}
        <div className="flex items-center justify-between mb-10 md:mb-12">
          <button onClick={() => router.back()} className="group flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 shadow-lg hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-300 active:scale-95 text-sm font-bold text-slate-600 dark:text-slate-300">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 返回书架
          </button>
          <div className="flex items-center gap-3">
            <EditBookDialog book={book} onSuccess={fetchBookData} />
            <DeleteBookButton bookId={book.id} title={book.title} />
          </div>
        </div>

        <BookDossier book={book} mainCoverUrl={mainCoverUrl} handleBookUpdate={handleBookUpdate} />
        <BookExcerpts bookId={book.id} excerpts={excerpts} onSuccess={fetchBookData} />

      </div>
    </div>
  );
}