// src/components/archive/ArchiveGallery.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import GalleryBookCard from "./GalleryBookCard";

const GALLERY_TABS = [
  { id: "ALL", label: "全部档案" },
  { id: "UNREAD", label: "待读书籍" },
  { id: "FINISHED", label: "已读书籍" },
];

export default function ArchiveGallery({ books }: { books: any[] }) {
  const [galleryTab, setGalleryTab] = useState("ALL");
  const [isMounted, setIsMounted] = useState(false);

  // ✨ 1. 解决 Next.js 随机数导致的 Hydration 报错问题
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // ✨ 2. 核心数据调度中心：使用 useMemo 锁定随机结果，避免页面滚动时乱跳
  const displayBooks = useMemo(() => {
    // 先过滤出对应 Tab 的数据
    let filtered = [...books].filter((book) => {
      if (galleryTab === "ALL") return true;
      return book.status === galleryTab;
    });

    if (galleryTab === "FINISHED") {
      // 📌 已读区域：严格按结束时间倒序排列（最近读完的在最前面）
      filtered.sort((a, b) => {
        const timeA = a.endTime ? new Date(a.endTime).getTime() : 0;
        const timeB = b.endTime ? new Date(b.endTime).getTime() : 0;
        return timeB - timeA; 
      });
    } else {
      // 🎲 全部 & 待读区域：开启随机漫游模式 (Random Shuffle)
      // 注意：必须等待客户端挂载完成 (isMounted) 后才能打乱，否则会引发服务端校验失败
      if (isMounted) {
        filtered.sort(() => Math.random() - 0.5);
      }
    }

    return filtered;
  }, [books, galleryTab, isMounted]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 mt-24 mb-10 border-t border-slate-200/50 dark:border-slate-800/50 pt-16 relative">
      
      {/* 头部：画廊局部导航条 */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <h2 className="text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
          书房全景画廊
          <span className="text-sm px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">
            {displayBooks.length}
          </span>
        </h2>

        {/* 玻璃态子 Tab 切换器 */}
        <div className="flex items-center p-1.5 rounded-2xl bg-slate-200/40 dark:bg-slate-800/40 backdrop-blur-md border border-white/50 dark:border-slate-700/30 shadow-inner">
          {GALLERY_TABS.map((tab) => {
            const isActive = galleryTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setGalleryTab(tab.id)}
                className={`relative px-6 py-2 text-sm font-bold rounded-xl transition-all duration-300 z-10 ${
                  isActive ? "text-slate-800 dark:text-white" : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {isActive && (
                  <motion.div layoutId="gallery-tab-indicator" className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-md border border-slate-100 dark:border-white/5" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-20">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 瀑布流网格 */}
      {displayBooks.length === 0 ? (
        <div className="w-full py-32 flex justify-center text-slate-400 font-bold tracking-widest text-lg">暂无对应的书籍记录</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
          {displayBooks.map((book) => (
            <motion.div
              key={book.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "100px" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <GalleryBookCard 
                book={book} 
                showStatus={galleryTab === "ALL"} 
                isFinishedTab={galleryTab === "FINISHED"}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}