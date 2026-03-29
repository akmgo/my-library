// src/components/archive/views/YearlyTimelineView.tsx
"use client";

import { motion } from "framer-motion";
import { CalendarDays, Quote, Fingerprint } from "lucide-react";

export default function YearlyTimelineView({ books }: { books: any[] }) {
  // ===== 数据预处理：今年轨迹 =====
  const currentYearNum = new Date().getFullYear();
  const yearlyBooks = books
    .filter(
      (b) =>
        b.status === "FINISHED" &&
        b.endTime &&
        b.endTime.startsWith(currentYearNum.toString())
    )
    .sort(
      (a, b) => new Date(b.endTime).getTime() - new Date(a.endTime).getTime()
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-6xl mx-auto px-6 md:px-12 py-10"
    >
      <div className="mb-20 text-center">
        <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center justify-center gap-3">
          {currentYearNum} 阅读轨迹
          <span className="text-base font-bold text-fuchsia-500 bg-fuchsia-500/10 px-3 py-1 rounded-full">
            {yearlyBooks.length} 本
          </span>
        </h2>
      </div>

      {yearlyBooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 dark:text-slate-500">
          <CalendarDays className="w-16 h-16 mb-4 opacity-50" />
          <p>今年还没有读完的书籍，继续努力哦！</p>
        </div>
      ) : (
        <div className="relative">
          {/* 🌟 中轴发光线 */}
          <div className="absolute left-[39px] md:left-1/2 top-4 bottom-0 w-[2px] bg-gradient-to-b from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 md:-translate-x-1/2 rounded-full z-0"></div>

          {yearlyBooks.map((book, index) => {
            const isLeft = index % 2 === 0;
            const coverToUse = book.coverUrl;
            const endDate = new Date(book.endTime);
            const dateStr = `${endDate.getMonth() + 1}月${endDate.getDate()}日`;

            return (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className={`relative flex items-center justify-between md:justify-center w-full mb-24 group ${
                  isLeft ? "md:flex-row-reverse" : "md:flex-row"
                }`}
              >
                {/* 锚点 */}
                <div className="absolute left-[32px] md:left-1/2 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-[3px] border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] md:-translate-x-1/2 z-20 group-hover:scale-150 transition-transform duration-500" />

                {/* 日期信息 */}
                <div
                  className={`hidden md:flex w-1/2 ${
                    isLeft ? "justify-start pl-20" : "justify-end pr-20"
                  }`}
                >
                  <div className="text-slate-400 dark:text-slate-500 font-bold text-2xl tracking-widest uppercase flex flex-col items-center gap-1 opacity-60 group-hover:opacity-100 group-hover:text-indigo-500 transition-colors duration-500 transform group-hover:-translate-y-2">
                    <span>{dateStr}</span>
                    {book.rating >= 4 && (
                      <span className="text-sm px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full flex items-center gap-1">
                        🔥 强推
                      </span>
                    )}
                  </div>
                </div>

                {/* 📚 书籍 3D 悬浮卡片 */}
                <div
                  className={`w-full md:w-1/2 pl-24 md:pl-0 flex z-10 ${
                    isLeft
                      ? "md:justify-end md:pr-16"
                      : "md:justify-start md:pl-16"
                  }`}
                >
                  <div
                    className={`relative flex ${
                      isLeft ? "flex-row-reverse" : "flex-row"
                    } gap-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/60 dark:border-white/5 shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-500 w-full max-w-[420px] overflow-hidden`}
                  >
                    {/* 卡片内的氛围水印装饰 */}
                    <div
                      className={`absolute pointer-events-none -z-10 text-slate-200 dark:text-slate-800/40 opacity-50 transform rotate-12 ${
                        isLeft ? "-left-6 -bottom-6" : "-right-6 -bottom-6"
                      }`}
                    >
                      <Fingerprint className="w-48 h-48" strokeWidth={0.5} />
                    </div>
                    <Quote
                      className={`absolute pointer-events-none -z-10 w-16 h-16 text-indigo-100 dark:text-indigo-900/30 top-4 ${
                        isLeft ? "left-4" : "right-4"
                      }`}
                    />

                    {/* 竖版封面微缩版 */}
                    <div className="shrink-0 w-28 rounded-2xl overflow-hidden shadow-lg group-hover:shadow-[0_15px_30px_rgba(99,102,241,0.4)] transition-all duration-500 relative bg-slate-100 dark:bg-slate-800 z-10 border border-white/20 dark:border-white/10">
                      <img
                        src={coverToUse}
                        alt={book.title}
                        loading="lazy"
                        className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>

                    {/* 书籍元数据 */}
                    <div
                      className={`flex flex-col justify-center overflow-hidden z-10 w-full ${
                        isLeft ? "text-right" : "text-left"
                      }`}
                    >
                      <span className="md:hidden text-xs font-bold text-indigo-500 mb-2 tracking-wider uppercase">
                        {dateStr}
                      </span>
                      <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 truncate mt-1">
                        {book.author}
                      </p>

                      {book.rating > 0 && (
                        <div
                          className={`flex items-center gap-1 mt-4 ${
                            isLeft ? "justify-end" : "justify-start"
                          }`}
                        >
                          {Array.from({ length: book.rating }).map((_, i) => (
                            <svg
                              key={i}
                              className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}