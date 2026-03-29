// src/components/dashboard/DashboardWidgets.tsx
"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CalendarDays, Flame, Check, Loader2, Sparkles } from "lucide-react";
import { getDashboardStats, recordTodayReading } from "../../app/actions/reading"; // ⚠️ 注意这里的路径，根据你之前的拆分可能需要调整为对应的 actions/reading

const formatDate = (date: Date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getWeekDates = (today: Date) => {
  const currentDay = today.getDay();
  const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday);

  const week = [];
  const weekLabels = ["一", "二", "三", "四", "五", "六", "日"];

  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    week.push({ dateStr: formatDate(day), label: weekLabels[i] });
  }
  return week;
};

export default function DashboardWidgets() {
  const [isCheckInLoading, setIsCheckInLoading] = useState(false);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const [yearReadCount, setYearReadCount] = useState(0);
  const [monthReadDays, setMonthReadDays] = useState(0);
  const [continuousDays, setContinuousDays] = useState(0);

  const [weekDays, setWeekDays] = useState([
    { day: "一", isRead: false, isToday: false, dateStr: "" },
    { day: "二", isRead: false, isToday: false, dateStr: "" },
    { day: "三", isRead: false, isToday: false, dateStr: "" },
    { day: "四", isRead: false, isToday: false, dateStr: "" },
    { day: "五", isRead: false, isToday: false, dateStr: "" },
    { day: "六", isRead: false, isToday: false, dateStr: "" },
    { day: "日", isRead: false, isToday: false, dateStr: "" },
  ]);

  useEffect(() => {
    setYearReadCount(Number(localStorage.getItem("lib_yearCount")) || 0);
    setMonthReadDays(Number(localStorage.getItem("lib_monthDays")) || 0);
    setContinuousDays(Number(localStorage.getItem("lib_continuousDays")) || 0);

    const fetchStats = async () => {
      const today = new Date();
      const todayStr = formatDate(today);
      const yearStr = String(today.getFullYear());
      const monthStr = todayStr.substring(0, 7);

      const currentWeekInfo = getWeekDates(today);
      const weekDateStrings = currentWeekInfo.map((w) => w.dateStr);

      const res = await getDashboardStats({
        year: yearStr,
        month: monthStr,
        weekDates: weekDateStrings,
      });

      if (res.success) {
        setYearReadCount(res.yearReadCount);
        localStorage.setItem("lib_yearCount", String(res.yearReadCount));

        setMonthReadDays(res.monthReadDays);
        localStorage.setItem("lib_monthDays", String(res.monthReadDays));

        const checkedInDates = res.checkedInDates || [];
        setHasCheckedIn(checkedInDates.includes(todayStr));

        let weekReadCount = 0;
        const updatedWeekDays = currentWeekInfo.map((info) => {
          const isRead = checkedInDates.includes(info.dateStr);
          if (isRead) weekReadCount++;
          return {
            day: info.label,
            dateStr: info.dateStr,
            isRead: isRead,
            isToday: info.dateStr === todayStr,
          };
        });

        setWeekDays(updatedWeekDays);
        setContinuousDays(weekReadCount);
        localStorage.setItem("lib_continuousDays", String(weekReadCount));
      }
    };
    fetchStats();
  }, []);

  const handleCheckIn = async () => {
    if (hasCheckedIn || isCheckInLoading) return;
    setIsCheckInLoading(true);

    setHasCheckedIn(true);
    setMonthReadDays((prev) => {
      const newVal = prev + 1;
      localStorage.setItem("lib_monthDays", String(newVal));
      return newVal;
    });
    setContinuousDays((prev) => {
      const newVal = prev + 1;
      localStorage.setItem("lib_continuousDays", String(newVal));
      return newVal;
    });
    setWeekDays((prev) =>
      prev.map((d) => (d.isToday ? { ...d, isRead: true } : d))
    );

    const todayStr = formatDate(new Date());
    await recordTodayReading(todayStr);
    setIsCheckInLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      {/* 头部：标题与打卡按钮 */}
      <div className="mb-6 flex items-center justify-between pointer-events-auto">
        <h2 className="text-2xl font-black tracking-tight text-slate-800 dark:text-white flex items-center gap-2">
          阅读看板
        </h2>
        <div>
          {!hasCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={isCheckInLoading}
              className="group relative flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white text-sm font-bold shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 group-hover:translate-x-full transition-transform duration-500 -skew-x-12 -translate-x-full"></div>
              {isCheckInLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Flame className="w-4 h-4 animate-pulse drop-shadow-md" />
              )}
              {isCheckInLoading ? "神经同步中..." : "启动今日共鸣"}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold shadow-[inset_0_0_15px_rgba(16,185,129,0.1)] transition-colors duration-500">
              <Check className="w-4 h-4" />
              今日频段已同步
            </div>
          )}
        </div>
      </div>

      {/* ================= 📊 Bento Box 数据面板 ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
        
        {/* -------- 卡片 1：今年已读 (深邃宇宙风) -------- */}
        <div className="relative group bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[2rem] p-6 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 min-h-[160px]">
          {/* 纯 CSS 背景纹理：网格线 */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          
          {/* 悬浮光晕 */}
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-indigo-500/30 blur-[50px] rounded-full group-hover:bg-indigo-500/50 group-hover:scale-150 transition-all duration-700 pointer-events-none"></div>

          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 mb-2 relative z-10 font-bold text-sm tracking-widest uppercase">
            <BookOpen className="w-4 h-4" />
            <span>今年已读</span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-2">
              <span
                suppressHydrationWarning
                className="text-7xl md:text-[5.5rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-indigo-400 dark:from-white dark:to-indigo-500 drop-shadow-[0_10px_20px_rgba(79,70,229,0.3)] group-hover:scale-105 transition-transform duration-500"
              >
                {yearReadCount}
              </span>
              <span className="text-indigo-600/60 dark:text-indigo-400/60 font-black text-xl mb-2">本</span>
            </div>
          </div>
        </div>

        {/* -------- 卡片 2：本月阅读 (极光翠绿风) -------- */}
        <div className="relative group bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[2rem] p-6 flex flex-col overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 min-h-[160px]">
          {/* 纯 CSS 背景纹理：径向点阵 */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b98122_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

          {/* 悬浮光晕 */}
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-emerald-500/30 blur-[50px] rounded-full group-hover:bg-emerald-500/50 group-hover:scale-150 transition-all duration-700 pointer-events-none"></div>

          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2 relative z-10 font-bold text-sm tracking-widest uppercase">
            <CalendarDays className="w-4 h-4" />
            <span>本月共鸣</span>
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-2">
              <span
                suppressHydrationWarning
                className="text-7xl md:text-[5.5rem] leading-none font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-600 to-emerald-400 dark:from-white dark:to-emerald-500 drop-shadow-[0_10px_20px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform duration-500"
              >
                {monthReadDays}
              </span>
              <span className="text-emerald-600/60 dark:text-emerald-400/60 font-black text-xl mb-2">天</span>
            </div>
          </div>
        </div>

        {/* -------- 卡片 3：本周轨迹 (高能电竞风矩阵) -------- */}
        <div className="md:col-span-2 relative group bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border border-white/60 dark:border-white/10 rounded-[2rem] p-6 lg:px-8 flex flex-col justify-between overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500">
          
          <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 to-transparent pointer-events-none"></div>

          <div className="flex items-center justify-between mb-6 relative z-10">
            <span className="font-bold text-sm tracking-widest text-sky-600 dark:text-sky-400 uppercase flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              本周能量矩阵
            </span>
            <div className="flex items-center gap-2 bg-sky-500/10 border border-sky-500/20 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse shadow-[0_0_8px_#0ea5e9]"></div>
              <span
                suppressHydrationWarning
                className="text-xs text-sky-700 dark:text-sky-300 font-bold tracking-wide"
              >
                已充能 {continuousDays}/7
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 md:gap-4 h-full relative z-10">
            {weekDays.map((day, index) => {
              const isActive = day.isRead;
              const isToday = day.isToday;

              return (
                <div key={index} className="flex flex-col items-center gap-3 w-full group/item">
                  
                  {/* 日期文字 */}
                  <span className={`text-xs md:text-sm font-black transition-colors duration-300 ${
                    isToday ? (isActive ? "text-sky-500" : "text-orange-500") : "text-slate-400 dark:text-slate-500"
                  }`}>
                    {day.day}
                  </span>

                  {/* ⚡ 能量胶囊 (Energy Pill) 替代原来的细线圆点 */}
                  <div className={`w-full h-10 md:h-12 rounded-xl flex items-center justify-center transition-all duration-500 relative overflow-hidden ${
                    isActive 
                      ? "bg-gradient-to-b from-sky-400 to-sky-600 dark:from-sky-500 dark:to-sky-700 shadow-[inset_0_2px_10px_rgba(255,255,255,0.3),0_5px_15px_rgba(14,165,233,0.4)] border border-sky-300 dark:border-sky-400/50 scale-105"
                      : isToday
                      ? "bg-slate-100 dark:bg-slate-800 border-2 border-orange-500/50 border-dashed"
                      : "bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/50 dark:border-white/5"
                  }`}>
                    {/* 激活时的内部高光切角效果 */}
                    {isActive && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-white/50 rounded-full blur-[1px]"></div>
                    )}
                    
                    {/* 中心的状态指示核心 */}
                    <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full z-10 transition-all duration-300 ${
                      isActive 
                        ? "bg-white shadow-[0_0_12px_#fff]"
                        : isToday
                        ? "bg-orange-500 animate-pulse shadow-[0_0_10px_#f97316]"
                        : "bg-slate-300 dark:bg-slate-600"
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}