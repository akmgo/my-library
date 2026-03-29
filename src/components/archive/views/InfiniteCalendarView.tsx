// src/components/archive/views/InfiniteCalendarView.tsx
"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

export default function InfiniteCalendarView({ readingLogs }: { readingLogs: any[] }) {
  // ===== 核心动态算法：生成从“此刻”追溯到“2026年4月”的所有月份网格 =====
  const today = new Date();
  let currentY = today.getFullYear();
  let currentM = today.getMonth(); // 0-indexed (0是1月，3是4月)

  const START_YEAR = 2026;
  const START_MONTH = 3; // 起点：4月

  // 兜底逻辑：如果当前时间还没到 2026 年 4 月（比如本地测试系统时间不准），强制让它至少渲染一个 4 月，避免白屏
  if (currentY < START_YEAR || (currentY === START_YEAR && currentM < START_MONTH)) {
    currentY = START_YEAR;
    currentM = START_MONTH;
  }

  const monthsToRender = [];
  
  // 倒推循环：从当前年份一直递减到起点年份
  for (let y = currentY; y >= START_YEAR; y--) {
    // 当前年份的终止月是“此刻的月份”，以前的年份则是“12月(index 11)”
    const mEnd = y === currentY ? currentM : 11;
    // 起点年份的起始月是“4月(index 3)”，以后的年份则是“1月(index 0)”
    const mStart = y === START_YEAR ? START_MONTH : 0;

    for (let m = mEnd; m >= mStart; m--) {
      monthsToRender.push({ year: y, month: m });
    }
  }

  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月",
  ];

  // 性能优化：利用哈希表 (Map) 极速映射真实的阅读打卡日志
  const calendarDataMap = useMemo(() => {
    const map = new Map();
    readingLogs.forEach((log) => {
      if (log.date && log.book) {
        const d = new Date(log.date);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        map.set(key, log.book);
      }
    });
    return map;
  }, [readingLogs]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-10"
    >
      <div className="mb-20 text-center">
        <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center justify-center gap-3">
          时光阅读拼图
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm font-medium tracking-wide">
          从 2026 年 4 月启程，岁月会自动为你刻下每一本书的印记
        </p>
      </div>

      <div className="space-y-16">
        {monthsToRender.map((period) => {
          const daysInMonth = new Date(period.year, period.month + 1, 0).getDate();
          
          // ✨ 周一作为一周的开始：核心占位计算
          const firstDayOfDate = new Date(period.year, period.month, 1).getDay(); // 0(周日) ~ 6(周六)
          // 如果是周日(0)，意味着前面要空出 6 个格子；否则空出 firstDayOfDate - 1 个格子
          const emptyCellsCount = firstDayOfDate === 0 ? 6 : firstDayOfDate - 1;

          const calendarCells = [];
          for (let i = 0; i < emptyCellsCount; i++) calendarCells.push(null);
          for (let i = 1; i <= daysInMonth; i++) {
            const book = calendarDataMap.get(`${period.year}-${period.month}-${i}`);
            calendarCells.push({ day: i, book: book });
          }

          // 精确判断“本月”与“今日”，避免跨年 BUG
          const isCurrentMonth = period.year === today.getFullYear() && period.month === today.getMonth();

          return (
            <div 
              key={`${period.year}-${period.month}`} 
              className="relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/5 rounded-[3rem] p-8 md:p-14 shadow-2xl overflow-hidden"
            >
              {/* 背景大面积水印：柔和的月份数字 */}
              <div className="absolute -top-16 -right-10 text-[16rem] font-black text-slate-200/50 dark:text-slate-800/30 -z-10 pointer-events-none select-none tracking-tighter opacity-60">
                {period.month + 1}
              </div>

              {/* 月份标题栏 */}
              <div className="mb-10 flex items-center gap-5 relative z-10">
                <h3 className="text-3xl font-black text-slate-800 dark:text-slate-200 tracking-tight">
                  {period.year}{" "}
                  <span className="text-indigo-500">{monthNames[period.month]}</span>
                </h3>
                <div className="flex-1 h-[2px] bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent rounded-full"></div>
              </div>

              {/* 表头：以周一作为起始 */}
              <div className="grid grid-cols-7 gap-4 md:gap-6 mb-5 relative z-10">
                {["一", "二", "三", "四", "五", "六", "日"].map((day) => (
                  <div key={day} className="text-center text-sm font-black text-slate-500 dark:text-slate-400 tracking-widest">
                    周{day}
                  </div>
                ))}
              </div>

              {/* 日历网格主体 */}
              <div className="grid grid-cols-7 gap-4 md:gap-6 relative z-10">
                {calendarCells.map((cell, index) => {
                  if (!cell) {
                    return <div key={`empty-${index}`} className="aspect-[2/3] rounded-2xl opacity-0" />;
                  }

                  const hasBook = !!cell.book;
                  const coverToUse = hasBook ? cell.book.coverUrl : null;
                  const isToday = isCurrentMonth && cell.day === today.getDate();

                  return (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "50px" }}
                      transition={{ duration: 0.4, delay: (index % 7) * 0.05 }}
                      key={`day-${cell.day}`}
                      className={`relative aspect-[2/3] rounded-2xl overflow-hidden group transition-all duration-500 ${
                        hasBook
                          ? "shadow-xl hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-2 z-10 border border-slate-200 dark:border-white/10"
                          : "bg-white/80 dark:bg-slate-900/50 backdrop-blur-md border border-slate-300 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 shadow-sm"
                      } ${
                        isToday && !hasBook
                          ? "ring-2 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-900"
                          : ""
                      }`}
                    >
                      {hasBook ? (
                        <>
                          <img
                            src={coverToUse}
                            alt={cell.book.title}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover transform group-hover:scale-110 group-hover:saturate-125 transition-all duration-700 bg-slate-100 dark:bg-slate-800"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                            <span className="text-white font-black text-sm truncate drop-shadow-md mb-1">
                              {cell.book.title}
                            </span>
                            <span className="text-white/70 text-[10px] truncate">
                              {cell.book.author}
                            </span>
                          </div>
                          <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                            {cell.day}
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span
                            className={`text-2xl md:text-3xl font-black ${
                              isToday
                                ? "text-indigo-500"
                                : "text-slate-400 dark:text-slate-600"
                            } transition-colors group-hover:text-slate-500 dark:group-hover:text-slate-400`}
                          >
                            {cell.day}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}