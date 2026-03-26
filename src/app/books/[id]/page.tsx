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
import { getBookDetail, updateBook } from "../../actions";

// === 常量配置 ===
const PREDEFINED_TAGS = [
  "玄幻",
  "仙侠",
  "历史",
  "哲学",
  "投资",
  "编程",
  "文学",
  "科幻",
  "商业",
  "心理",
  "社会",
  "传记",
  "悬疑",
  "奇幻",
  "武侠",
  "经典",
  "轻小说",
  "管理",
  "艺术",
  "科普",
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
// 🧩 模块 1：骨架屏
// ==========================================
function DetailSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-500">
      <Loader2 className="w-10 h-10 animate-spin mb-4" />
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

  // --- 状态管理 ---
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<any>(null);
  const [excerpts, setExcerpts] = useState<any[]>([]);
  const [hoverRating, setHoverRating] = useState(0);

  // --- 数据获取 ---
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

  // --- 交互逻辑 ---
  const handleBookUpdate = async (updates: any) => {
    setBook((prev: any) => ({ ...prev, ...updates })); // 乐观更新 UI
    const dbUpdates = { ...updates };
    if (dbUpdates.tags) dbUpdates.tags = JSON.stringify(dbUpdates.tags);
    await updateBook(id, dbUpdates); // 后台静默保存
  };

  const toggleTag = (tag: string) => {
    let newTags = [...(book.tags || [])];
    if (newTags.includes(tag)) newTags = newTags.filter((t) => t !== tag);
    else if (newTags.length < 3) newTags.push(tag);
    else return;
    handleBookUpdate({ tags: newTags });
  };

  // --- 视图渲染防卫 ---
  if (loading) return <DetailSkeleton />;
  if (!book) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-slate-400">
        <p className="mb-4">找不到该书籍或已被删除</p>
        <Link href="/" className="text-white underline underline-offset-4">
          返回书房
        </Link>
      </div>
    );
  }

  // --- 边缘计算图片 CDN 优化 ---
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
    <div className="relative min-h-screen w-full bg-slate-950 overflow-hidden text-slate-200">
      {/* === 区块 A：深邃极光背景层 === */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-indigo-500/15 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] bg-purple-500/15 blur-[120px] rounded-full mix-blend-screen" />
        <Image
          src={bgCoverUrl}
          alt="Background"
          fill
          priority
          className="object-cover scale-[1.3] blur-[100px] opacity-60 saturate-[1.5] animate-in fade-in duration-1000"
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-slate-900/60 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-slate-950/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/70 to-slate-950"></div>
      </div>

      {/* === 区块 B：内容主容器 === */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-6 md:px-12 pt-20 pb-32 flex flex-col">
        {/* 顶部控制栏 */}
        <div className="flex items-center justify-between mb-10 md:mb-16">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium rounded-full bg-white/10 border border-white/10 transition duration-300 hover:bg-white/20 hover:border-white/20 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:-translate-y-0.5 active:scale-95 text-slate-300 hover:text-white group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            返回书架
          </button>
          <DeleteBookButton bookId={id} title={book.title} />
        </div>

        {/* 1. 头部英雄卡片 (封面与标题) */}
        <div className="flex flex-col lg:flex-row bg-slate-900/40 backdrop-blur-2xl border border-white/5 rounded-[2.5rem] p-6 lg:p-10 shadow-2xl relative overflow-hidden group gap-8 lg:gap-12 mb-16">
          <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>

          <div className="w-full sm:w-[320px] lg:w-[380px] shrink-0 aspect-video rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.4)] border border-white/10 relative z-10">
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
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight drop-shadow-xl text-transparent bg-clip-text bg-gradient-to-br from-slate-100 to-slate-400 text-center px-4">
                {book.title}
              </h1>
            </div>
            <div className="flex items-center justify-start gap-4 mt-8 pt-6 border-t border-white/5">
              <div className="w-10 h-[2px] bg-indigo-500/50 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              <p className="text-lg md:text-xl text-slate-400 font-medium tracking-wide">
                {book.author}
              </p>
            </div>
          </div>
        </div>

        {/* 2. 中央控制台 (阅读状态数据) */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-6 md:p-10 shadow-2xl flex flex-col gap-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* 状态切换 */}
            <div className="flex flex-col space-y-3">
              <label className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                <BookOpen className="w-4 h-4" /> 当前状态
              </label>
              <div className="flex p-1.5 bg-slate-950/50 border border-slate-700/50 rounded-xl relative">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleBookUpdate({ status: opt.id })}
                    className={`relative flex-1 py-2 text-sm font-medium transition-colors duration-300 z-10 ${
                      book.status === opt.id
                        ? "text-white"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                  >
                    {book.status === opt.id && (
                      <motion.div
                        layoutId="status-indicator"
                        className="absolute inset-0 bg-indigo-600 rounded-lg shadow-lg"
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
                <label className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                  <Calendar className="w-4 h-4" /> 开始于
                </label>
                <input
                  type="date"
                  value={book.startTime || ""}
                  onChange={(e) =>
                    handleBookUpdate({ startTime: e.target.value })
                  }
                  className="bg-slate-950/50 border border-slate-700/50 text-white rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
            )}
            {book.status === "FINISHED" && (
              <div className="flex flex-col space-y-3">
                <label className="flex items-center gap-2 text-slate-400 font-medium text-sm">
                  <Clock className="w-4 h-4" /> 结束于
                </label>
                <input
                  type="date"
                  value={book.endTime || ""}
                  onChange={(e) =>
                    handleBookUpdate({ endTime: e.target.value })
                  }
                  className="bg-slate-950/50 border border-slate-700/50 text-white rounded-xl px-4 py-2 outline-none focus:border-indigo-500 transition-colors [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-60 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
                />
              </div>
            )}
          </div>

          {/* 个人评价 */}
          <div className="flex flex-col space-y-3">
            <label className="flex items-center gap-2 text-slate-400 font-medium text-sm">
              <Star className="w-4 h-4" /> 个人评价
            </label>
            <div className="flex items-center bg-slate-950/40 p-4 md:p-5 rounded-2xl border border-slate-700/50 relative overflow-hidden group">
              <div className="absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l from-yellow-500/10 to-transparent pointer-events-none transition-opacity duration-300"></div>
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
                        ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] scale-110"
                        : "text-slate-700 hover:text-slate-500"
                    }`}
                  />
                ))}
              </div>
              <div className="ml-6 w-56 relative z-10 shrink-0">
                <span className="text-lg md:text-xl font-bold text-yellow-400 drop-shadow-md">
                  {RATING_TEXTS[hoverRating || book.rating]}
                </span>
              </div>
              {/* 动态繁星特效 */}
              <div className="ml-auto relative z-10 flex items-center justify-end gap-1 pr-4 w-32">
                {[1, 2, 3, 4, 5].map(
                  (starIndex) =>
                    starIndex <= (hoverRating || book.rating || 0) && (
                      <Sparkles
                        key={`sparkle-${starIndex}`}
                        className="w-5 h-5 text-yellow-500/30 group-hover:text-yellow-500/50 animate-in fade-in zoom-in spin-in-12 duration-500"
                        style={{ animationDelay: `${starIndex * 50}ms` }}
                      />
                    )
                )}
              </div>
            </div>
          </div>

          {/* 图书标签 */}
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between text-slate-400 font-medium text-sm">
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
                        ? "bg-indigo-600 text-white border-indigo-500 shadow-[0_0_20px_rgba(79,70,229,0.4)] font-bold scale-105"
                        : isMaxed
                        ? "bg-slate-900/30 text-slate-600 border-slate-800 cursor-not-allowed"
                        : "bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white"
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
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
            <h2 className="text-3xl font-bold text-white tracking-tight drop-shadow-md">
              摘录与笔记
            </h2>
            <AddExcerptDialog bookId={id} onSuccess={fetchBookData} />
          </div>

          <div className="flex flex-col gap-6">
            {excerpts.length === 0 ? (
              <div className="py-24 flex flex-col items-center justify-center text-center bg-slate-900/30 backdrop-blur-md rounded-3xl border border-slate-800 border-dashed">
                <p className="text-slate-400 text-lg mb-2">
                  这本书还没有留下任何思考的痕迹
                </p>
                <p className="text-sm text-slate-600">
                  点击右上角按钮，记录下你的第一条摘录
                </p>
              </div>
            ) : (
              excerpts.map((excerpt) => (
                <div
                  key={excerpt.id}
                  className="p-8 md:p-10 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 hover:border-slate-500 transition-colors shadow-2xl relative group"
                >
                  <span className="absolute top-6 left-6 text-6xl text-slate-700/30 font-serif leading-none select-none">
                    "
                  </span>
                  <p className="text-slate-200 leading-loose font-serif text-lg md:text-xl whitespace-pre-wrap relative z-10 pl-6">
                    {excerpt.content}
                  </p>
                  <div className="mt-8 text-sm text-slate-500 text-right font-medium">
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
