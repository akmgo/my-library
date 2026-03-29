// src/components/archive/views/AllArchiveView.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ArchiveGallery from "../ArchiveGallery"; // 引入我们新建的下半区瀑布流

export default function AllArchiveView({ books }: { books: any[] }) {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

  // 防抖横滑控制 (原版神级代码)
  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target?.closest("#archive-3d-carousel")) return;

      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        e.stopPropagation();

        if (wheelTimeout.current) return;
        const threshold = 15;
        if (e.deltaX > threshold) {
          setCarouselIndex((prev) => (prev + 1) % books.length);
          wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 350) as unknown as NodeJS.Timeout;
        } else if (e.deltaX < -threshold) {
          setCarouselIndex((prev) => (prev - 1 + books.length) % books.length);
          wheelTimeout.current = setTimeout(() => { wheelTimeout.current = null; }, 350) as unknown as NodeJS.Timeout;
        }
      }
    };

    document.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleNativeWheel);
  }, [books.length]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full flex flex-col"
    >
      {/* 3D 轮播控制台 */}
      <div className="px-8 md:px-[10vw] mb-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-3">
            所有珍藏
            <span className="text-base font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
              {books.length}
            </span>
          </h2>
          <p className="text-slate-400 text-sm mt-2">横向滑动触控板，或拖拽转动 3D 展台</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setCarouselIndex((prev) => (prev - 1 + books.length) % books.length)} className="group p-3.5 rounded-full bg-white dark:bg-slate-800/80 shadow-md hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/30 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all active:scale-90 border border-slate-100 dark:border-white/5">
            <ChevronLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1 group-hover:scale-110" />
          </button>
          <button onClick={() => setCarouselIndex((prev) => (prev + 1) % books.length)} className="group p-3.5 rounded-full bg-white dark:bg-slate-800/80 shadow-md hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/30 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all active:scale-90 border border-slate-100 dark:border-white/5">
            <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:scale-110" />
          </button>
        </div>
      </div>

      {/* 3D 画廊主体 */}
      <motion.div
        id="archive-3d-carousel"
        className="relative w-full h-[550px] md:h-[650px] flex items-center justify-center overflow-hidden [perspective:1500px] touch-pan-y overscroll-x-none"
        onPanEnd={(e, info) => {
          const threshold = 40;
          if (info.offset.x < -threshold) setCarouselIndex((prev) => (prev + 1) % books.length);
          else if (info.offset.x > threshold) setCarouselIndex((prev) => (prev - 1 + books.length) % books.length);
        }}
      >
        <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
          {books.map((book, index) => {
            let diff = index - carouselIndex;
            if (diff > Math.floor(books.length / 2)) diff -= books.length;
            if (diff < -Math.floor(books.length / 2)) diff += books.length;

            const absDiff = Math.abs(diff);
            const isCenter = diff === 0;

            const translateX = diff * 210;
            const translateZ = -absDiff * 250;
            const rotateY = diff * -35;
            const scale = isCenter ? 1 : 1 - absDiff * 0.05;
            const opacity = absDiff > 4 ? 0 : 1 - absDiff * 0.15;
            const zIndex = 100 - absDiff;

            return (
              <motion.div
                key={book.id}
                className="absolute cursor-pointer flex flex-col items-center group w-48 md:w-72 will-change-transform"
                initial={false}
                animate={{ x: translateX, z: translateZ, rotateY: rotateY, scale: scale, opacity: opacity, zIndex: zIndex }}
                transition={{ duration: 0.6, type: "spring", stiffness: 220, damping: 25 }}
                onClick={() => setCarouselIndex(index)}
                style={{ originX: 0.5, originY: 0.5 }}
              >
                <div className={`relative w-full aspect-[2/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-700 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 transform-gpu ${isCenter ? "shadow-[0_40px_80px_-20px_rgba(99,102,241,0.5)] dark:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.8)]" : "shadow-2xl dark:shadow-black/70"}`}>
                  <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover transform group-hover:saturate-125 transition-all duration-700" loading={isCenter ? "eager" : "lazy"} />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 dark:via-white/5 dark:to-white/10 pointer-events-none" />
                  {!isCenter && <div className="absolute inset-0 bg-black/30 dark:bg-black/50 group-hover:bg-black/10 transition-colors duration-500" />}
                </div>

                <div className={`flex flex-col items-center text-center px-4 w-full mt-8 transition-all duration-700 ${isCenter ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-2"}`}>
                  <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 truncate w-full drop-shadow-sm">{book.title}</h3>
                  <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 truncate w-full mt-1 tracking-widest uppercase">{book.author}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* ✨ 引入专属的下层瀑布流组件 (只在此视图内展示) */}
      <ArchiveGallery books={books} />
    </motion.div>
  );
}