// src/app/books/[id]/page.tsx
"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  Star,
  Tags,
  Clock,
  BookOpen,
  Loader2,
  Sparkles,
} from "lucide-react";

// === 组件与动作引入 ===
import AddExcerptDialog from "../../../components/book/AddExcerptDialog";
import DeleteBookButton from "../../../components/book/DeleteBookButton";
import EditBookDialog from "../../../components/book/EditBookDialog";
import { getBookDetail, updateBook } from "../../actions";

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

// ==========================================
// 🧩 模块 1：骨架屏 (双端适配)
// ==========================================
function DetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400 dark:text-slate-500 transition-colors duration-500">
      <Loader2 className="w-10 h-10 animate-spin mb-4 text-indigo-500/50" />
      <p className="tracking-widest animate-pulse">正在从书库深处调取档案...</p>
    </div>
  );
}

// ==========================================
// 🧩 模块 2：详情页核心逻辑与视图
// ==========================================
function BookContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<any>(null);
  const [excerpts, setExcerpts] = useState<any[]>([]);
  const [hoverRating, setHoverRating] = useState(0);

  const fetchBookData = async () => {
    const res = await getBookDetail(id);
    if (res.success) {
      setBook(res.book);
      setExcerpts(res.excerpts || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchBookData();
  }, [id]);

  const handleBookUpdate = async (updates: any) => {
    setBook((prev: any) => ({ ...prev, ...updates }));
    const dbUpdates = { ...updates };
    if (dbUpdates.tags) dbUpdates.tags = JSON.stringify(dbUpdates.tags);
    await updateBook(id, dbUpdates);
  };

  const toggleTag = (tag: string) => {
    let newTags = [...(book.tags || [])];
    if (newTags.includes(tag)) newTags = newTags.filter((t) => t !== tag);
    else if (newTags.length < 3) newTags.push(tag);
    else return;
    handleBookUpdate({ tags: newTags });
  };

  if (loading) return <DetailSkeleton />;
  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 dark:text-slate-400 transition-colors duration-500">
        <p className="mb-4">找不到该书籍或已被删除</p>
        <Link
          href="/"
          className="text-indigo-500 dark:text-white underline underline-offset-4"
        >
          返回书房
        </Link>
      </div>
    );
  }

  const rawCoverUrl =
    book.coverUrl ||
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";
  const bgCoverUrl = rawCoverUrl.startsWith("data:")
    ? rawCoverUrl
    : `https://wsrv.nl/?url=${encodeURIComponent(
        rawCoverUrl
      )}&w=100&q=50&output=webp`;
  const mainCoverUrl = rawCoverUrl.startsWith("data:")
    ? rawCoverUrl
    : `https://wsrv.nl/?url=${encodeURIComponent(
        rawCoverUrl
      )}&w=800&q=80&output=webp`;

  return (
    // ✨ 外层主容器适配
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-800 dark:text-slate-200 transition-colors duration-500">
      {/* === 区块 A：深邃/明亮极光背景层 === */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden transition-opacity duration-700">
        {/* ✨ 修复 1：移除浅色的混合模式，提高光晕浓度为 40% */}
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-sky-400/40 dark:bg-indigo-500/15 blur-[120px] rounded-full dark:mix-blend-screen transition-colors duration-700" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] bg-fuchsia-400/40 dark:bg-purple-500/15 blur-[120px] rounded-full dark:mix-blend-screen transition-colors duration-700" />

        {/* ✨ 修复 2：将浅色下书籍封面的底层透出透明度提亮至 30% */}
        <Image
          src={bgCoverUrl}
          alt="Background"
          fill
          priority
          className="object-cover scale-[1.3] blur-[100px] opacity-30 dark:opacity-60 saturate-[1.5] animate-in fade-in duration-1000 transition-opacity"
          unoptimized={true}
        />

        {/* ✨ 修复 3：削弱浅色白底遮罩的厚度，让底部的光晕和封面颜色能“透”上来 */}
        <div className="absolute inset-0 bg-white/30 dark:bg-slate-900/60 mix-blend-overlay transition-colors duration-700"></div>
        <div className="absolute inset-0 bg-slate-50/50 dark:bg-slate-950/40 transition-colors duration-700"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/60 to-slate-50 dark:via-slate-950/70 dark:to-slate-950 transition-colors duration-700"></div>
      </div>

      {/* === 区块 B：内容主容器 === */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-32 flex flex-col">
        {/* 顶部控制栏 */}
        <div className="flex items-center justify-between mb-10 md:mb-16">
          {/* 返回按钮 */}
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-white/70 dark:bg-white/10 border border-slate-200/80 dark:border-white/10 transition duration-300 hover:bg-white dark:hover:bg-white/20 hover:border-slate-300 dark:hover:border-white/20 shadow-sm hover:shadow-md dark:shadow-none dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 active:scale-95 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-white group backdrop-blur-xl"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            返回书架
          </button>
          
          {/* ✨ 右侧操作组：编辑与删除并排 */}
          <div className="flex items-center gap-3">
            <EditBookDialog book={book} onSuccess={fetchBookData} />
            <DeleteBookButton bookId={id} title={book.title} />
          </div>
        </div>

        {/* 1. 头部英雄卡片 (封面与标题) */}
        {/* ✨ 卡片容器白玉化 */}
        <div className="flex flex-col lg:flex-row bg-white/60 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/5 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden group gap-8 lg:gap-12 mb-16 transition-colors duration-500">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-300/50 dark:group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>

          <div className="w-full sm:w-[320px] lg:w-[380px] shrink-0 aspect-video rounded-2xl overflow-hidden shadow-2xl dark:shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-white dark:border-white/10 relative z-10 transition-shadow">
            <Image
              src={mainCoverUrl}
              alt={book.title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 33vw"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              unoptimized={true}
            />
          </div>

          <div className="flex flex-col flex-1 w-full relative z-10 py-2 lg:py-6">
            <div className="flex-1 flex items-center justify-center min-h-[120px]">
              {/* ✨ 标题文字加深 */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-br from-slate-800 to-slate-500 dark:from-slate-100 dark:to-slate-400 text-center px-4 transition-colors">
                {book.title}
              </h1>
            </div>
            <div className="flex items-center justify-start gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-white/5 transition-colors">
              <div className="w-10 h-[2px] bg-indigo-500/50 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              {/* ✨ 作者文字适配 */}
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium tracking-wide transition-colors">
                {book.author}
              </p>
            </div>
          </div>
        </div>

        {/* 2. 中央控制台 (阅读状态数据) */}
        <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/60 dark:border-slate-700/50 p-6 md:p-10 shadow-2xl flex flex-col gap-8 transition-colors duration-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 状态切换 */}
            <div className="flex flex-col space-y-3">
              <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors">
                <BookOpen className="w-4 h-4" /> 当前状态
              </label>
              <div className="flex p-1 h-11 bg-slate-100/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 rounded-xl relative transition-colors">
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

            {/* 时间记录 */}
            {book.status !== "UNREAD" && (
              <div className="flex flex-col space-y-3">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors">
                  <Calendar className="w-4 h-4" /> 开始于
                </label>
                {/* ✨ 日期选择器双端适配：浅色黑字，深色白字，反转日历图标 */}
                <input
                  type="date"
                  value={book.startTime || ""}
                  onChange={(e) =>
                    handleBookUpdate({ startTime: e.target.value })
                  }
                  className="bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-white rounded-xl px-4 h-11 w-full outline-none focus:border-indigo-400 dark:focus:border-indigo-500 cursor-pointer transition-colors dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
            )}
            {book.status === "FINISHED" && (
              <div className="flex flex-col space-y-3">
                <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors">
                  <Clock className="w-4 h-4" /> 结束于
                </label>
                <input
                  type="date"
                  value={book.endTime || ""}
                  onChange={(e) =>
                    handleBookUpdate({ endTime: e.target.value })
                  }
                  className="bg-white/50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-white rounded-xl px-4 h-11 w-full outline-none focus:border-indigo-400 dark:focus:border-indigo-500 cursor-pointer transition-colors dark:[&::-webkit-calendar-picker-indicator]:filter dark:[&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
            )}
          </div>

          {/* 个人评价 */}
          <div className="flex flex-col space-y-3">
            <label className="flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors">
              <Star className="w-4 h-4" /> 个人评价
            </label>
            <div className="flex items-center bg-white/50 dark:bg-slate-950/40 p-4 md:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/50 relative overflow-hidden group transition-colors duration-500">
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
              <div className="ml-auto relative z-10 flex items-center justify-end gap-1 pr-4 w-32">
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

          {/* 图书标签 */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-medium text-sm transition-colors">
              <label className="flex items-center gap-2">
                <Tags className="w-4 h-4" /> 图书标签
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
                    className={`px-4 py-2 text-sm rounded-xl transition-all duration-300 border ${
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

        {/* 3. 底部摘录瀑布流 */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-200 dark:border-slate-800 transition-colors">
            {/* ✨ 标题深浅色适配 */}
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight drop-shadow-sm dark:drop-shadow-md transition-colors">
              摘录与笔记
            </h2>
            <AddExcerptDialog bookId={id} onSuccess={fetchBookData} />
          </div>

          <div className="flex flex-col gap-6">
            {excerpts.length === 0 ? (
              // ✨ 空状态信纸化
              <div className="py-24 flex flex-col items-center justify-center text-center bg-white/40 dark:bg-slate-900/30 backdrop-blur-md rounded-3xl border border-slate-300 dark:border-slate-800 border-dashed transition-colors duration-500">
                <p className="text-slate-500 dark:text-slate-400 text-lg mb-2 transition-colors">
                  这本书还没有留下任何思考的痕迹
                </p>
                <p className="text-sm text-slate-400 dark:text-slate-600 transition-colors">
                  点击右上角按钮，记录下你的第一条摘录
                </p>
              </div>
            ) : (
              excerpts.map((excerpt) => (
                // ✨ 摘录卡片白底化
                <div
                  key={excerpt.id}
                  className="p-8 md:p-10 rounded-3xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-white/80 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-slate-500 transition-colors shadow-xl dark:shadow-2xl relative group"
                >
                  <span className="absolute top-6 left-6 text-6xl text-slate-200 dark:text-slate-700/30 font-serif leading-none select-none transition-colors">
                    "
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 leading-loose font-serif text-lg md:text-xl whitespace-pre-wrap relative z-10 pl-6 transition-colors">
                    {excerpt.content}
                  </p>
                  <div className="mt-8 text-sm text-slate-400 dark:text-slate-500 text-right font-medium transition-colors">
                    —— 记录于 {new Date(excerpt.createdAt).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 🚀 页面入口：根组件 (UI 挂载与 Suspense)
// ==========================================
export default function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <BookContent params={params} />
    </Suspense>
  );
}
