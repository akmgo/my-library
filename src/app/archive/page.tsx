// src/app/archive/page.tsx
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  LibraryBig,
  CalendarDays,
  CalendarCheck,
  Quote,
  Fingerprint,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";
import { getAllBooks, getAllReadingLogs } from "../actions";
import { useRouter } from "next/navigation";

const TABS = [
  { id: "all", label: "全部档案", icon: LibraryBig },
  { id: "year", label: "今年轨迹", icon: CalendarDays },
  { id: "month", label: "时光拼图", icon: CalendarCheck },
];

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState("all");
  const [books, setBooks] = useState<any[]>([]);
  // ✨ 新增：存储打卡日志
  const [readingLogs, setReadingLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [carouselIndex, setCarouselIndex] = useState(0);

  // ✨ 1. 用于限制触控板横滑触发频率的锁
  const wheelTimeout = useRef<NodeJS.Timeout | null>(null);

  const router = useRouter();

  // ✨ 2. 全局级事件委托：彻底解决 Tab 切换导致的 Ref 丢失问题
  useEffect(() => {
    const handleNativeWheel = (e: WheelEvent) => {
      // 智能判定：动态寻找鼠标当前所处的 DOM 节点
      const target = e.target as HTMLElement | null;

      // 🎯 核心魔法：如果鼠标不在我们的 3D 画廊内部滑动，直接放行，绝不干扰其他页面的滚动！
      if (!target?.closest("#archive-3d-carousel")) return;

      // 如果在画廊内，且横向滑动幅度大于纵向，立刻击杀系统后退手势
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        e.stopPropagation();

        // 节流防抖
        if (wheelTimeout.current) return;

        const threshold = 15;
        if (e.deltaX > threshold) {
          setCarouselIndex((prev) => (prev + 1) % books.length);
          wheelTimeout.current = setTimeout(() => {
            wheelTimeout.current = null;
          }, 350) as unknown as NodeJS.Timeout;
        } else if (e.deltaX < -threshold) {
          setCarouselIndex((prev) => (prev - 1 + books.length) % books.length);
          wheelTimeout.current = setTimeout(() => {
            wheelTimeout.current = null;
          }, 350) as unknown as NodeJS.Timeout;
        }
      }
    };

    // 挂载到全局 document 上，只要页面不销毁，监听器永远在线
    document.addEventListener("wheel", handleNativeWheel, { passive: false });
    return () => document.removeEventListener("wheel", handleNativeWheel);
  }, [books.length]); // 💡 不再需要依赖 activeTab，因为它是全局监听的！

  // ✨ 修改初始化请求：并发拉取书籍和日志
  useEffect(() => {
    const fetchData = async () => {
      const [booksRes, logsRes] = await Promise.all([
        getAllBooks(),
        getAllReadingLogs(),
      ]);

      if (booksRes.success) setBooks(booksRes.books);
      if (logsRes && logsRes.success) setReadingLogs(logsRes.logs);

      setIsLoading(false);
    };
    fetchData();
  }, []);

  // ===== 预处理：今年轨迹数据 =====
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

  // ===== 预处理：无限时光拼图数据 (生成从今天到 2026 年 1 月的所有月份) =====
  const today = new Date();
  const currentM = today.getMonth();
  const monthsToRender = [];
  const START_YEAR = 2026;

  for (let y = currentYearNum; y >= START_YEAR; y--) {
    const mStart = y === currentYearNum ? currentM : 11;
    for (let m = mStart; m >= 0; m--) {
      monthsToRender.push({ year: y, month: m });
    }
  }

  const monthNames = [
    "一月",
    "二月",
    "三月",
    "四月",
    "五月",
    "六月",
    "七月",
    "八月",
    "九月",
    "十月",
    "十一月",
    "十二月",
  ];

  // ✨ 性能核武器：利用哈希表 (Map) 映射真实的阅读打卡日志
  const calendarDataMap = useMemo(() => {
    const map = new Map();

    // 遍历真实的打卡记录
    readingLogs.forEach((log) => {
      // 你的 SQL 表结构里，打卡日期字段是 'date'
      if (log.date && log.book) {
        const d = new Date(log.date);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

        // 把拼装好的书籍对象放进这个日期的格子里
        // 如果一天有多条记录，这里会用最后遍历到的那条覆盖
        map.set(key, log.book);
      }
    });
    return map;
  }, [readingLogs]); // ✨ 依赖项改为 readingLogs

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 transition-colors duration-500 selection:bg-indigo-500/30 overflow-x-hidden">
      {/* 🌌 底层极速光晕背景 */}
      <div className="fixed inset-0 z-0 pointer-events-none transform-gpu">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-sky-300/30 dark:bg-indigo-600/15 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-1000 animate-in fade-in duration-1000" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-fuchsia-300/30 dark:bg-purple-600/15 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen transition-colors duration-1000 animate-in fade-in duration-1000" />
        <div className="absolute top-[30%] left-[20%] w-[40vw] h-[40vw] bg-amber-200/30 dark:bg-transparent blur-[120px] rounded-full mix-blend-multiply transition-colors duration-1000" />
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay"></div>
      </div>

      {/* 🚀 主体内容 */}
      <div className="relative z-10 w-full pt-8 pb-32">
        {/* 悬浮导航栏 */}
        {/* ✨ 优化：一体化悬浮导航栏 (含返回键) */}
        <div className="sticky top-6 z-50 flex justify-center mb-16 px-4">
          <div className="flex items-center p-1.5 rounded-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-lg shadow-slate-200/50 dark:shadow-black/50 transition-all duration-500">
            {/* 🔙 返回按钮：集成在导航条左侧 */}
            <button
              onClick={() => router.push("/")}
              className="group flex items-center gap-2 px-4 py-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 active:scale-95"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:text-indigo-500 transition-colors" />
              <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-500 transition-colors hidden sm:inline">
                返回
              </span>
            </button>

            {/* 🪄 间距分割线：产生比较大的间距，并起到视觉隔离作用 */}
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700 mx-4 md:mx-6" />

            {/* Tab 切换区 */}
            <div className="flex items-center gap-1">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full transition-colors duration-300 z-10 ${
                      isActive
                        ? "text-indigo-600 dark:text-white"
                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="archive-tab-indicator"
                        className="absolute inset-0 bg-white dark:bg-slate-800 rounded-full shadow-sm dark:shadow-md border border-slate-100 dark:border-white/5"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <Icon
                      className={`relative z-20 w-4 h-4 transition-transform duration-300 ${
                        isActive ? "scale-110" : ""
                      }`}
                    />
                    <span className="relative z-20 hidden sm:inline">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* 内容分发器 */}
        <div className="w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in duration-500">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4 opacity-50" />
              <p className="text-slate-500 dark:text-slate-400 tracking-widest text-sm font-medium animate-pulse">
                正在展开书房全景...
              </p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* ===== 模块 1：全部档案 (3D 空间展览环) ===== */}
              {activeTab === "all" && (
                <motion.div
                  key="all-books"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="w-full flex flex-col"
                >
                  <div className="px-8 md:px-[10vw] mb-4 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-slate-800 dark:text-white flex items-center justify-center md:justify-start gap-3">
                        所有珍藏
                        <span className="text-base font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1 rounded-full">
                          {books.length}
                        </span>
                      </h2>
                      <p className="text-slate-400 text-sm mt-2">
                        横向滑动触控板，或拖拽转动 3D 展台
                      </p>
                    </div>

                    {/* 操控区：左右转动展台 */}
                    <div className="flex gap-3">
                      <button
                        onClick={() =>
                          setCarouselIndex(
                            (prev) => (prev - 1 + books.length) % books.length
                          )
                        }
                        className="p-3.5 rounded-full bg-white dark:bg-slate-800/80 shadow-md hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/30 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all active:scale-90 border border-slate-100 dark:border-white/5"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() =>
                          setCarouselIndex((prev) => (prev + 1) % books.length)
                        }
                        className="p-3.5 rounded-full bg-white dark:bg-slate-800/80 shadow-md hover:shadow-lg hover:bg-indigo-50 dark:hover:bg-indigo-500/30 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 transition-all active:scale-90 border border-slate-100 dark:border-white/5"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* ✨ 核心：3D 空间透视容器 (绑定 ref) */}
                  <motion.div
                    id="archive-3d-carousel" // 👈 加上这行，给顶部的事件委托提供靶标
                    // ✨ 新增 overscroll-x-none，CSS 层面封杀边缘滑动行为
                    className="relative w-full h-[550px] md:h-[650px] flex items-center justify-center overflow-hidden [perspective:1500px] touch-pan-y overscroll-x-none"
                    // 🖱️ 支持鼠标拖拽 / 手机屏幕横滑
                    onPanEnd={(e, info) => {
                      const threshold = 40;
                      if (info.offset.x < -threshold) {
                        setCarouselIndex((prev) => (prev + 1) % books.length);
                      } else if (info.offset.x > threshold) {
                        setCarouselIndex(
                          (prev) => (prev - 1 + books.length) % books.length
                        );
                      }
                    }}
                  >
                    <div className="relative w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
                      {books.map((book, index) => {
                        let diff = index - carouselIndex;
                        if (diff > Math.floor(books.length / 2))
                          diff -= books.length;
                        if (diff < -Math.floor(books.length / 2))
                          diff += books.length;

                        const absDiff = Math.abs(diff);
                        const isCenter = diff === 0;

                        const translateX = diff * 210;
                        const translateZ = -absDiff * 250;
                        const rotateY = diff * -35;
                        const scale = isCenter ? 1 : 1 - absDiff * 0.05;
                        const opacity = absDiff > 4 ? 0 : 1 - absDiff * 0.15;
                        const zIndex = 100 - absDiff;

                        const coverToUse =
                          book.verticalCoverUrl || book.coverUrl;

                        return (
                          <motion.div
                            key={book.id}
                            className="absolute cursor-pointer flex flex-col items-center group w-48 md:w-72"
                            initial={false}
                            animate={{
                              x: translateX,
                              z: translateZ,
                              rotateY: rotateY,
                              scale: scale,
                              opacity: opacity,
                              zIndex: zIndex,
                            }}
                            transition={{
                              duration: 0.6,
                              type: "spring",
                              stiffness: 220,
                              damping: 25,
                            }}
                            onClick={() => setCarouselIndex(index)}
                            style={{ originX: 0.5, originY: 0.5 }}
                          >
                            <div
                              className={`relative w-full aspect-[2/3] rounded-[1.5rem] md:rounded-[2rem] overflow-hidden transition-all duration-700 bg-slate-100 dark:bg-slate-800 border border-slate-200/50 dark:border-white/10 ${
                                isCenter
                                  ? "shadow-[0_40px_80px_-20px_rgba(99,102,241,0.5)] dark:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.8)]"
                                  : "shadow-2xl dark:shadow-black/70"
                              }`}
                            >
                              <img
                                src={coverToUse}
                                alt={book.title}
                                className="w-full h-full object-cover transform group-hover:saturate-125 transition-all duration-700"
                                loading="lazy"
                              />
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 dark:via-white/5 dark:to-white/10 pointer-events-none" />

                              {!isCenter && (
                                <div className="absolute inset-0 bg-black/30 dark:bg-black/50 group-hover:bg-black/10 transition-colors duration-500" />
                              )}
                            </div>

                            <div
                              className={`flex flex-col items-center text-center px-4 w-full mt-8 transition-all duration-700 ${
                                isCenter
                                  ? "opacity-100 translate-y-0"
                                  : "opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-2"
                              }`}
                            >
                              <h3 className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 truncate w-full drop-shadow-sm">
                                {book.title}
                              </h3>
                              <p className="text-sm font-medium text-indigo-500 dark:text-indigo-400 truncate w-full mt-1 tracking-widest uppercase">
                                {book.author}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ===== 模块 2：今年轨迹 (向心凝视卡片 + 装饰纹理) ===== */}
              {activeTab === "year" && (
                <motion.div
                  key="year-timeline"
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
                        const coverToUse =
                          book.verticalCoverUrl || book.coverUrl;
                        const endDate = new Date(book.endTime);
                        const dateStr = `${
                          endDate.getMonth() + 1
                        }月${endDate.getDate()}日`;

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
                                isLeft
                                  ? "justify-start pl-20"
                                  : "justify-end pr-20"
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
                              {/* ✨ 核心升级：基于 isLeft 判断内向凝视。左卡片用 flex-row-reverse (图在右)，右卡片用 flex-row (图在左) */}
                              <div
                                className={`relative flex ${
                                  isLeft ? "flex-row-reverse" : "flex-row"
                                } gap-5 bg-white/70 dark:bg-slate-900/60 backdrop-blur-2xl p-5 rounded-[2rem] border border-white/60 dark:border-white/5 shadow-xl hover:shadow-2xl hover:-translate-y-3 hover:border-indigo-200 dark:hover:border-indigo-500/30 transition-all duration-500 w-full max-w-[420px] overflow-hidden`}
                              >
                                {/* ✨ 核心升级：卡片内的氛围水印装饰 (底层) */}
                                <div
                                  className={`absolute pointer-events-none -z-10 text-slate-200 dark:text-slate-800/40 opacity-50 transform rotate-12 ${
                                    isLeft
                                      ? "-left-6 -bottom-6"
                                      : "-right-6 -bottom-6"
                                  }`}
                                >
                                  <Fingerprint
                                    className="w-48 h-48"
                                    strokeWidth={0.5}
                                  />
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
                                    className="w-full aspect-[2/3] object-cover group-hover:scale-110 transition-transform duration-700"
                                  />
                                </div>

                                {/* 书籍元数据 (文字靠向外侧) */}
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
                                      {Array.from({ length: book.rating }).map(
                                        (_, i) => (
                                          <svg
                                            key={i}
                                            className="w-4 h-4 text-amber-400 fill-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                          </svg>
                                        )
                                      )}
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
              )}

              {/* ===== 模块 3：无限时光拼图 (宽屏 + 滚动年份) ===== */}
              {activeTab === "month" && (
                <motion.div
                  key="infinite-calendar"
                  initial={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.98, filter: "blur(10px)" }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  // ✨ 核心升级：大幅度拉宽 max-w-7xl
                  className="w-full max-w-7xl mx-auto px-4 md:px-8 py-10"
                >
                  <div className="mb-16 text-center">
                    <h2 className="text-3xl font-black tracking-tight text-slate-800 dark:text-white flex items-center justify-center gap-3">
                      无限时光拼图
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm font-medium">
                      从 2026 年至今，每一本书都在填补你的岁月网格
                    </p>
                  </div>

                  {/* 遍历渲染从今年本月到 2026 年 1 月的每一个月 */}
                  <div className="space-y-24">
                    {monthsToRender.map((period, pIndex) => {
                      const daysInMonth = new Date(
                        period.year,
                        period.month + 1,
                        0
                      ).getDate();
                      const firstDayOfMonth = new Date(
                        period.year,
                        period.month,
                        1
                      ).getDay();

                      // ✨ 极速构建当前月的日历网格数据
                      const calendarCells = [];
                      for (let i = 0; i < firstDayOfMonth; i++)
                        calendarCells.push(null);
                      for (let i = 1; i <= daysInMonth; i++) {
                        // O(1) 极速哈希匹配：直接从字典里拿书！
                        const book = calendarDataMap.get(
                          `${period.year}-${period.month}-${i}`
                        );
                        calendarCells.push({ day: i, book: book });
                      }

                      const isCurrentMonth =
                        period.year === currentYearNum &&
                        period.month === currentM;

                      return (
                        <div
                          key={`${period.year}-${period.month}`}
                          className="relative"
                        >
                          {/* 月份背后的巨大水印年份 */}
                          <div className="absolute -top-10 left-0 text-[10rem] font-black text-slate-100/50 dark:text-slate-800/30 -z-10 pointer-events-none select-none tracking-tighter">
                            {period.month === 11 || isCurrentMonth
                              ? period.year
                              : ""}
                          </div>

                          <div className="mb-8 flex items-center gap-4">
                            <h3 className="text-2xl font-black text-slate-800 dark:text-slate-200">
                              {period.year}{" "}
                              <span className="text-indigo-500">
                                {monthNames[period.month]}
                              </span>
                            </h3>
                            <div className="flex-1 h-[1px] bg-gradient-to-r from-slate-200 dark:from-slate-800 to-transparent"></div>
                          </div>

                          {/* 星期表头 */}
                          <div className="grid grid-cols-7 gap-3 md:gap-5 mb-4">
                            {["日", "一", "二", "三", "四", "五", "六"].map(
                              (day) => (
                                <div
                                  key={day}
                                  className="text-center text-xs font-black text-slate-400 dark:text-slate-500 tracking-widest"
                                >
                                  周{day}
                                </div>
                              )
                            )}
                          </div>

                          {/* ✨ 日历网格主体 (更宽的 Gap) */}
                          <div className="grid grid-cols-7 gap-3 md:gap-5">
                            {calendarCells.map((cell, index) => {
                              if (!cell) {
                                return (
                                  <div
                                    key={`empty-${index}`}
                                    className="aspect-[2/3] rounded-xl md:rounded-2xl opacity-0"
                                  />
                                );
                              }

                              const hasBook = !!cell.book;
                              const coverToUse = hasBook
                                ? cell.book.verticalCoverUrl ||
                                  cell.book.coverUrl
                                : null;
                              const isToday =
                                isCurrentMonth && cell.day === today.getDate();

                              return (
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true, margin: "-50px" }}
                                  transition={{
                                    duration: 0.4,
                                    delay: (index % 7) * 0.05,
                                  }}
                                  key={`day-${cell.day}`}
                                  className={`relative aspect-[2/3] rounded-xl md:rounded-2xl overflow-hidden group transition-all duration-500 ${
                                    hasBook
                                      ? "shadow-lg hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-2 z-10 border border-white/20 dark:border-white/10"
                                      : "bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border border-slate-200/50 dark:border-white/5 hover:bg-white/80 dark:hover:bg-slate-800/80"
                                  } ${
                                    isToday && !hasBook
                                      ? "ring-2 ring-indigo-500 ring-offset-4 dark:ring-offset-slate-950"
                                      : ""
                                  }`}
                                >
                                  {hasBook ? (
                                    <>
                                      <img
                                        src={coverToUse}
                                        alt={cell.book.title}
                                        className="w-full h-full object-cover transform group-hover:scale-110 group-hover:saturate-125 transition-all duration-700 bg-slate-100 dark:bg-slate-800"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 md:p-4">
                                        <span className="text-white font-black text-xs md:text-sm truncate drop-shadow-md mb-1">
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
                                            : "text-slate-300 dark:text-slate-700"
                                        } transition-colors group-hover:text-slate-400 dark:group-hover:text-slate-500`}
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
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
