// src/components/detail/BookDossier.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Star, Clock, BookOpen, Sparkles, Tags } from "lucide-react";
import TiltCard from "../ui/TiltCard";

const STATUS_OPTIONS = [
  { id: "UNREAD", label: "待读" },
  { id: "READING", label: "在读" },
  { id: "FINISHED", label: "已读完" },
];
const RATING_TEXTS = [
  "",
  "⭐ 一星毒草",
  "⭐⭐ 二星平庸",
  "⭐⭐⭐ 三星粮草",
  "⭐⭐⭐⭐ 四星推荐",
  "🔥 改变人生",
];
// === 常量配置 ===
const PREDEFINED_TAGS = [
  "哲学",
  "历史",
  "人文",
  "经典",
  "社会",
  "政治",
  "经济",
  "法律",
  "心理",
  "思考",
  "成长",
  "教育",
  "管理",
  "商业",
  "投资",
  "技术",
  "文学",
  "传记",
  "艺术",
  "宗教",
  "科普",
  "编程",
];
export default function BookDossier({
  book,
  mainCoverUrl,
  handleBookUpdate,
}: {
  book: any;
  mainCoverUrl: string;
  handleBookUpdate: (u: any) => void;
}) {
  const [hoverRating, setHoverRating] = useState(0);

  // 标签点击逻辑
  const toggleTag = (tag: string) => {
    let newTags = [...(book.tags || [])];
    if (newTags.includes(tag)) newTags = newTags.filter((t) => t !== tag);
    else if (newTags.length < 3) newTags.push(tag);
    else return;
    handleBookUpdate({ tags: newTags });
  };

  return (
    <div className="flex flex-col bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/5 rounded-[3rem] p-6 lg:p-12 shadow-2xl relative group mb-16 overflow-hidden">
      {/* ===== 上半区：封面与状态详情 ===== */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-14 relative z-10 w-full">
        {/* 左侧：3D 悬浮封面区域 */}
        <div className="w-full sm:w-[240px] md:w-[280px] lg:w-[320px] shrink-0 mx-auto md:mx-0 relative z-20">
          <TiltCard>
            <div className="w-full aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/50 dark:border-white/10 relative bg-slate-100 dark:bg-slate-900">
              <Image
                src={mainCoverUrl}
                alt={book.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
                unoptimized={true}
              />
              <div className="absolute inset-0 -translate-x-[150%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:translate-x-[150%] transition-transform duration-[1500ms] ease-in-out skew-x-12 pointer-events-none" />
            </div>
          </TiltCard>
        </div>

        {/* 右侧：交互区 */}
        <div className="flex flex-col flex-1 w-full relative z-10 py-2 justify-between">
          {/* 书名与作者 */}
          <div className="flex items-baseline justify-between gap-6 border-b border-slate-200/50 dark:border-slate-700/50 pb-6 mb-8 w-full">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tighter leading-tight drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 truncate flex-1">
              {book.title}
            </h1>
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase shrink-0 text-right">
              {book.author}
            </p>
          </div>

          {/* 当前状态控制 */}
          <div className="flex flex-col space-y-3 mb-8 w-full">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors">
              <BookOpen className="w-4 h-4" /> 当前状态
            </label>
            <div className="flex p-1 h-11 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl relative transition-colors w-full">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleBookUpdate({ status: opt.id })}
                  className={`relative flex-1 flex items-center justify-center text-sm font-medium transition-colors duration-300 z-10 ${
                    book.status === opt.id
                      ? "text-white"
                      : "text-slate-500 dark:text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
                  }`}
                >
                  {book.status === opt.id && (
                    <motion.div
                      layoutId="status-indicator"
                      className="absolute inset-0 bg-indigo-500 dark:bg-indigo-600 rounded-lg shadow-md dark:shadow-lg"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 25,
                      }}
                    />
                  )}
                  <span className="relative z-20">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 时间线记录 */}
          <div className="flex flex-col space-y-3 mb-8 w-full">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors">
              <Calendar className="w-4 h-4" /> 阅读旅程
            </label>

            {book.status === "UNREAD" ? (
              <div className="h-11 w-full bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl overflow-hidden relative flex items-center px-4 shadow-inner">
                <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent animate-[shimmer_2s_infinite]" />
                <span className="text-slate-400 dark:text-slate-500 text-sm font-medium tracking-wider relative z-10 italic">
                  Waiting for the journey to begin...
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-4 w-full">
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={book.startTime || ""}
                    onChange={(e) =>
                      handleBookUpdate({ startTime: e.target.value })
                    }
                    className="bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-white rounded-xl pl-10 pr-4 h-11 w-full outline-none focus:border-indigo-400 dark:focus:border-indigo-500 cursor-pointer transition-colors dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <span className="text-slate-400 font-bold shrink-0">至</span>
                <div className="flex-1 relative">
                  <input
                    type="date"
                    value={book.endTime || ""}
                    onChange={(e) =>
                      handleBookUpdate({ endTime: e.target.value })
                    }
                    disabled={book.status !== "FINISHED"}
                    className={`bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-white rounded-xl pl-10 pr-4 h-11 w-full outline-none focus:border-indigo-400 dark:focus:border-indigo-500 cursor-pointer transition-colors dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100 ${
                      book.status !== "FINISHED"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 个人评价 */}
          <div className="flex flex-col space-y-3 mt-auto w-full">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors">
              <Star className="w-4 h-4" /> 个人评价
            </label>
            <div className="flex items-center bg-white/50 dark:bg-slate-950/40 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group transition-colors duration-500 w-full">
              <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-yellow-400/10 dark:from-yellow-500/10 to-transparent pointer-events-none transition-opacity duration-300"></div>
              <div
                className="flex gap-2 relative z-10 shrink-0"
                onMouseLeave={() => setHoverRating(0)}
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    onClick={() => handleBookUpdate({ rating: star })}
                    onMouseEnter={() => setHoverRating(star)}
                    className={`w-8 h-8 md:w-10 md:h-10 cursor-pointer transition-all duration-300 ${
                      (hoverRating || book.rating) >= star
                        ? "text-yellow-500 fill-yellow-500 dark:text-yellow-400 dark:fill-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.4)] dark:drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110"
                        : "text-slate-300 dark:text-slate-700 hover:text-slate-400 dark:hover:text-slate-500"
                    }`}
                  />
                ))}
              </div>
              <div className="ml-6 w-56 relative z-10 shrink-0">
                <span className="text-lg md:text-xl font-bold text-yellow-500 dark:text-yellow-400 drop-shadow-sm dark:drop-shadow-md transition-colors">
                  {RATING_TEXTS[hoverRating || book.rating]}
                </span>
              </div>
              <div className="ml-auto relative z-10 flex items-center justify-end gap-1 pr-4 w-32 hidden md:flex">
                {[1, 2, 3, 4, 5].map(
                  (starIndex) =>
                    starIndex <= (hoverRating || book.rating || 0) && (
                      <Sparkles
                        key={`sparkle-${starIndex}`}
                        className="w-5 h-5 text-yellow-500/40 dark:text-yellow-500/30 group-hover:text-yellow-500/60 dark:group-hover:text-yellow-500/50 animate-in fade-in zoom-in spin-in-12 duration-500"
                        style={{ animationDelay: `${starIndex * 50}ms` }}
                      />
                    )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 下半区：沉浸式知识标签图谱 ===== */}
      <div className="mt-8 pt-8 border-t border-slate-200/50 dark:border-slate-700/50 relative z-10 w-full">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors mb-6">
          <label className="flex items-center gap-2">
            <Tags className="w-5 h-5 text-indigo-500" /> 知识标签库
          </label>
          <span>{(book.tags || []).length} / 3</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {PREDEFINED_TAGS.map((tag) => {
            const isSelected = (book.tags || []).includes(tag);
            const isMaxed = (book.tags || []).length >= 3 && !isSelected;
            return (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                disabled={isMaxed}
                className={`px-5 py-2.5 text-sm rounded-xl transition-all duration-300 border ${
                  isSelected
                    ? "bg-indigo-500 dark:bg-indigo-600 text-white border-indigo-400 dark:border-indigo-500 shadow-[0_4px_15px_rgba(99,102,241,0.3)] dark:shadow-[0_0_20px_rgba(79,70,229,0.4)] font-bold scale-105"
                    : isMaxed
                    ? "bg-slate-100 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed"
                    : "bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-white shadow-sm dark:shadow-none"
                }`}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
