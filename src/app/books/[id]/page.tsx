// src/app/books/[id]/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calendar, Star, Tags, Clock, BookOpen } from "lucide-react";
import { motion } from "framer-motion"; // 引入动画神器
import AddExcerptDialog from "../../../components/book/AddExcerptDialog";

const PREDEFINED_TAGS = [
  "玄幻", "仙侠", "历史", "哲学", "投资", 
  "编程", "文学", "科幻", "商业", "心理", 
  "社会", "传记", "悬疑", "奇幻", "武侠", 
  "经典", "轻小说", "管理", "艺术", "科普"
];

const STATUS_OPTIONS = [
  { id: "UNREAD", label: "待读" },
  { id: "READING", label: "在读" },
  { id: "FINISHED", label: "已读完" }
];

const RATING_TEXTS = ["", "⭐ 一星毒草", "⭐⭐ 二星平庸", "⭐⭐⭐ 三星粮草", "⭐⭐⭐⭐ 四星推荐", "🔥 改变人生"];

export default function BookDetailPage({ params }: { params: { id: string } }) {
  const today = new Date().toISOString().split('T')[0];

  const [book, setBook] = useState({
    title: "百年孤独",
    author: "加西亚·马尔克斯",
    coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=1000&auto=format&fit=crop",
    status: "READING", 
    startTime: today,
    endTime: today,
    rating: 0, // 改为数字，方便做发光星星
    tags: [] as string[],
  });

  const [hoverRating, setHoverRating] = useState(0);

  const toggleTag = (tag: string) => {
    if (book.tags.includes(tag)) {
      setBook({ ...book, tags: book.tags.filter(t => t !== tag) });
    } else {
      if (book.tags.length < 3) {
        setBook({ ...book, tags: [...book.tags, tag] });
      }
    }
  };

  const excerpts: any[] = [];

  return (
    <div className="relative min-h-screen w-full max-w-7xl mx-auto px-6 md:px-12 pt-24 pb-32">
      
      <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white mb-10 transition-colors group">
        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
        返回书房
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-10 gap-16 lg:gap-24">
        
        {/* ================= 左侧：书籍元数据 ================= */}
        <div className="lg:col-span-4 flex flex-col space-y-6">
          
          <div className="w-full aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative group">
            <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-80"></div>
          </div>

          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">{book.title}</h1>
            <p className="text-lg text-slate-400 font-medium">{book.author}</p>
          </div>

          <hr className="border-slate-800/80 my-2" />

          <div className="flex flex-col space-y-8 text-sm pt-2">
            
            {/* 1. 炫酷特效：滑动胶囊状态切换 (彻底抛弃下拉框) */}
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
                      onClick={() => setBook({ ...book, status: opt.id })}
                      className={`relative flex-1 py-2.5 text-sm font-medium transition-colors duration-300 z-10 ${
                        isActive ? "text-white" : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="status-indicator"
                          className="absolute inset-0 bg-slate-700 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.05)] border border-slate-600"
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        />
                      )}
                      <span className="relative z-20">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. 发光文本框：精简版时间选择器 */}
            <div className="grid grid-cols-2 gap-4">
              {book.status !== "UNREAD" && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col space-y-3">
                  <label className="flex items-center gap-2 text-slate-400 font-medium">
                    <Calendar className="w-4 h-4" /> 开始于
                  </label>
                  <input 
                    type="date" 
                    value={book.startTime}
                    onChange={(e) => setBook({ ...book, startTime: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-600 focus:bg-slate-800 transition-all cursor-text text-sm"
                    style={{ colorScheme: "dark" }} 
                  />
                </motion.div>
              )}

              {book.status === "FINISHED" && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col space-y-3">
                  <label className="flex items-center gap-2 text-slate-400 font-medium">
                    <Clock className="w-4 h-4" /> 结束于
                  </label>
                  <input 
                    type="date" 
                    value={book.endTime}
                    onChange={(e) => setBook({ ...book, endTime: e.target.value })}
                    className="w-full bg-slate-900/50 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-slate-600 focus:bg-slate-800 transition-all cursor-text text-sm"
                    style={{ colorScheme: "dark" }}
                  />
                </motion.div>
              )}
            </div>

            {/* 3. 霓虹发光星级评价 (抛弃下拉框) */}
            <div className="flex flex-col space-y-3">
              <label className="flex items-center gap-2 text-slate-400 font-medium">
                <Star className="w-4 h-4" /> 个人评价
              </label>
              <div className="flex items-center gap-4 bg-slate-900/30 p-3.5 rounded-xl border border-slate-800/50">
                <div className="flex gap-1.5" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || book.rating) >= star;
                    return (
                      <Star
                        key={star}
                        onClick={() => setBook({ ...book, rating: star })}
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

            {/* 4. 标签区优化：选中时带有辉光 */}
            <div className="flex flex-col space-y-3 pt-2">
              <div className="flex items-center justify-between text-slate-400 font-medium">
                <label className="flex items-center gap-2">
                  <Tags className="w-4 h-4" /> 图书标签
                </label>
                <span className="text-xs text-slate-500">{book.tags.length} / 3</span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {PREDEFINED_TAGS.map(tag => {
                  const isSelected = book.tags.includes(tag);
                  const isMaxed = book.tags.length >= 3 && !isSelected;
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
        </div>

        {/* ================= 右侧：摘录与笔记 ================= */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800/80">
            <h2 className="text-2xl font-bold text-white tracking-tight">摘录与笔记</h2>
            <AddExcerptDialog />
          </div>

          <div className="flex flex-col gap-6">
            {excerpts.length === 0 ? (
              <div className="py-20 flex flex-col items-center justify-center text-center bg-slate-900/30 rounded-2xl border border-slate-800/50 border-dashed">
                <p className="text-slate-500 mb-2">这本书还没有留下任何摘录</p>
                <p className="text-sm text-slate-600">点击右上角按钮记录下你的第一条思考</p>
              </div>
            ) : (
              excerpts.map((excerpt) => (
                <div key={excerpt.id} className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 transition-colors">
                  <p className="text-slate-300 leading-relaxed font-serif text-lg">
                    "{excerpt.content}"
                  </p>
                  <div className="mt-4 text-xs text-slate-600 text-right">
                    记录于 {excerpt.date}
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