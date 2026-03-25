// src/app/books/[id]/page.tsx
"use client";

import { useState, useEffect, use, Suspense } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Star,
  Tags,
  Clock,
  BookOpen,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import AddExcerptDialog from "../../../components/book/AddExcerptDialog";
import { getBookDetail, updateBook } from "../../actions";
import PageTransition from "../../../components/PageTransition";
import Image from "next/image";
import DeleteBookButton from "../../../components/book/DeleteBookButton";
import { useRouter } from "next/navigation";

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
// 1. 瞬间渲染的骨架屏
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
// 2. 书籍详情核心组件
// ==========================================
function BookContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<any>(null);
  const [excerpts, setExcerpts] = useState<any[]>([]);
  const [hoverRating, setHoverRating] = useState(0);

  const router = useRouter();

  // 初始化拉取数据
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

  // 乐观 UI 更新 + 后台静默保存
  const handleBookUpdate = async (updates: any) => {
    setBook((prev: any) => ({ ...prev, ...updates }));

    const dbUpdates = { ...updates };
    if (dbUpdates.tags) {
      dbUpdates.tags = JSON.stringify(dbUpdates.tags);
    }
    await updateBook(id, dbUpdates);
  };

  const toggleTag = (tag: string) => {
    let newTags = [...(book.tags || [])];
    if (newTags.includes(tag)) {
      newTags = newTags.filter((t) => t !== tag);
    } else if (newTags.length < 3) {
      newTags.push(tag);
    } else {
      return;
    }
    handleBookUpdate({ tags: newTags });
  };

  if (loading) {
    return <DetailSkeleton />;
  }

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

  const coverUrl =
    book.coverUrl ||
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop";

  return (
    <PageTransition>
      <div className="relative min-h-screen w-full overflow-hidden">
        
        {/* ================= 魔法光晕层：大厂级“封面倒影”全屏背景 ================= */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {/* 1. 把封面本身作为背景，极限放大 + 极限模糊 + 提亮饱和度 */}
          {book?.coverUrl && (
            <Image
              src={coverUrl.startsWith("data:") ? coverUrl : `${coverUrl}?cors=1`}
              alt="Background Blur"
              fill
              className="object-cover scale-[1.5] blur-[120px] saturate-[1.5] opacity-60 animate-in fade-in duration-1000"
              unoptimized={true}
            />
          )}
          {/* 2. 覆盖一层通透的玻璃遮罩：告别死黑，采用带有呼吸感的轻盈深蓝灰 */}
          <div className="absolute inset-0 bg-slate-800/40 backdrop-blur-3xl mix-blend-overlay"></div>
          {/* 3. 底部渐变，保证文字可读性 */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent"></div>
        </div>
        {/* ===================================================================== */}

        <div className="relative z-10 min-h-screen w-full max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-32">
          
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-slate-300 hover:text-white mb-10 transition-colors group bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            返回书架
          </button>

          {book && <DeleteBookButton bookId={id} title={book.title} />}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mt-6">
            
            {/* ================= 左侧：书籍封面 ================= */}
            <div className="lg:col-span-4 flex flex-col space-y-6">
              {/* 改用白色的发光边框，显得更轻盈高贵 */}
              <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.3)] border border-white/20 relative group">
                <Image
                  src={coverUrl.startsWith("data:") ? coverUrl : `${coverUrl}?cors=1`}
                  alt={book.title}
                  fill
                  crossOrigin="anonymous"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  unoptimized={coverUrl.startsWith("data:")}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-60" />
              </div>
            </div>

            {/* ================= 右侧信息 ================= */}
            <div className="lg:col-span-8 flex flex-col">
              
              {/* 标题和作者，增加了阴影以在复杂背景下保持清晰 */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 drop-shadow-lg">
                  {book.title}
                </h1>
                <p className="text-xl text-slate-300 font-medium drop-shadow-md">
                  {book.author}
                </p>
              </div>

              <hr className="border-slate-800/80 my-2" />

              <div className="flex flex-col space-y-8 text-sm pt-4">
                {/* 阅读状态 */}
                <div className="flex flex-col space-y-3">
                  <label className="flex items-center gap-2 text-slate-400 font-medium">
                    <BookOpen className="w-4 h-4" /> 阅读状态
                  </label>
                  <div className="flex p-1.5 bg-slate-900/50 border border-slate-800 rounded-xl relative">
                    {STATUS_OPTIONS.map((opt) => {
                      const isActive = book.status === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => handleBookUpdate({ status: opt.id })}
                          className={`relative flex-1 py-2.5 text-sm font-medium transition-colors duration-300 z-10 ${
                            isActive
                              ? "text-white"
                              : "text-slate-500 hover:text-slate-300"
                          }`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="status-indicator"
                              className="absolute inset-0 bg-slate-700 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-slate-600"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                              }}
                            />
                          )}
                          <span className="relative z-20">{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 时间选择 */}
                <div className="grid grid-cols-2 gap-4">
                  {book.status !== "UNREAD" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col space-y-3"
                    >
                      <label className="flex items-center gap-2 text-slate-400 font-medium">
                        <Calendar className="w-4 h-4" /> 开始于
                      </label>
                      <input
                        type="date"
                        value={book.startTime || ""}
                        onChange={(e) =>
                          handleBookUpdate({ startTime: e.target.value })
                        }
                        className="
                        bg-slate-900/50 border border-slate-700 text-slate-200 
                        rounded-xl px-4 py-2.5 w-full outline-none 
                        transition-all duration-300 shadow-inner
                        hover:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                        [&::-webkit-calendar-picker-indicator]:filter 
                        [&::-webkit-calendar-picker-indicator]:invert 
                        [&::-webkit-calendar-picker-indicator]:opacity-40 
                        [&::-webkit-calendar-picker-indicator]:hover:opacity-100 
                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                        [&::-webkit-calendar-picker-indicator]:transition-opacity
                      "
                        style={{ colorScheme: "dark" }}
                      />
                    </motion.div>
                  )}

                  {book.status === "FINISHED" && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col space-y-3"
                    >
                      <label className="flex items-center gap-2 text-slate-400 font-medium">
                        <Clock className="w-4 h-4" /> 结束于
                      </label>
                      <input
                        type="date"
                        value={book.endTime || ""}
                        onChange={(e) =>
                          handleBookUpdate({ endTime: e.target.value })
                        }
                        className="
                        bg-slate-900/50 border border-slate-700 text-slate-200 
                        rounded-xl px-4 py-2.5 w-full outline-none 
                        transition-all duration-300 shadow-inner
                        hover:bg-slate-800/80 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500
                        [&::-webkit-calendar-picker-indicator]:filter 
                        [&::-webkit-calendar-picker-indicator]:invert 
                        [&::-webkit-calendar-picker-indicator]:opacity-40 
                        [&::-webkit-calendar-picker-indicator]:hover:opacity-100 
                        [&::-webkit-calendar-picker-indicator]:cursor-pointer
                        [&::-webkit-calendar-picker-indicator]:transition-opacity
                      "
                        style={{ colorScheme: "dark" }}
                      />
                    </motion.div>
                  )}
                </div>

                {/* 个人评价 */}
                <div className="flex flex-col space-y-3">
                  <label className="flex items-center gap-2 text-slate-400 font-medium">
                    <Star className="w-4 h-4" /> 个人评价
                  </label>
                  <div className="flex items-center gap-4 bg-slate-900/30 p-3.5 rounded-xl border border-slate-800/50">
                    <div
                      className="flex gap-1.5"
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      {[1, 2, 3, 4, 5].map((star) => {
                        const active = (hoverRating || book.rating) >= star;
                        return (
                          <Star
                            key={star}
                            onClick={() => handleBookUpdate({ rating: star })}
                            onMouseEnter={() => setHoverRating(star)}
                            className={`w-7 h-7 cursor-pointer transition-all duration-300 ${
                              active
                                ? "text-yellow-400 fill-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.6)] scale-110"
                                : "text-slate-700 hover:text-slate-500"
                            }`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-sm font-medium text-yellow-400/90 w-28 transition-all">
                      {RATING_TEXTS[hoverRating || book.rating]}
                    </span>
                  </div>
                </div>

                {/* 图书标签 */}
                <div className="flex flex-col space-y-3 pt-2">
                  <div className="flex items-center justify-between text-slate-400 font-medium">
                    <label className="flex items-center gap-2">
                      <Tags className="w-4 h-4" /> 图书标签
                    </label>
                    <span className="text-xs text-slate-500">
                      {(book.tags || []).length} / 3
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {PREDEFINED_TAGS.map((tag) => {
                      const isSelected = (book.tags || []).includes(tag);
                      const isMaxed =
                        (book.tags || []).length >= 3 && !isSelected;
                      return (
                        <button
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          disabled={isMaxed}
                          className={`px-3.5 py-1.5 text-xs rounded-lg transition-all duration-300 ${
                            isSelected
                              ? "bg-slate-200 text-slate-950 font-bold shadow-[0_0_15px_rgba(255,255,255,0.2)] scale-105"
                              : isMaxed
                              ? "bg-slate-900/20 text-slate-700 border border-slate-800/30 cursor-not-allowed"
                              : "bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-600 hover:text-slate-200"
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
              
              {/* ================= 下方：摘录与笔记 ================= */}
              <div className="mt-16">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
                  <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">
                    摘录与笔记
                  </h2>
                  <AddExcerptDialog bookId={id} onSuccess={fetchBookData} />
                </div>

                <div className="flex flex-col gap-6">
                  {excerpts.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-900/30 backdrop-blur-md rounded-2xl border border-slate-800/50 border-dashed">
                      <p className="text-slate-500 mb-2">
                        这本书还没有留下任何摘录
                      </p>
                      <p className="text-sm text-slate-600">
                        点击右上角按钮记录下你的第一条思考
                      </p>
                    </div>
                  ) : (
                    excerpts.map((excerpt) => (
                      <div
                        key={excerpt.id}
                        className="p-6 rounded-2xl bg-slate-900/50 backdrop-blur-md border border-slate-800/80 hover:border-slate-700 transition-colors shadow-lg"
                      >
                        <p className="text-slate-300 leading-relaxed font-serif text-lg whitespace-pre-wrap">
                          "{excerpt.content}"
                        </p>
                        <div className="mt-4 text-xs text-slate-600 text-right">
                          记录于 {new Date(excerpt.createdAt).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

// ==========================================
// 3. 【页面主入口】：强行接管 Next.js 路由，瞬间渲染占位符
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