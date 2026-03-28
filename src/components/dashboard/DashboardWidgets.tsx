// src/components/dashboard/DashboardWidgets.tsx
"use client";

import React, { useState, useEffect } from "react";
import { BookOpen, CalendarDays, Flame, Check, Loader2 } from "lucide-react";
import { getDashboardStats, recordTodayReading } from "../../app/actions";

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

  // ✨ 修复 Hydration 报错：初始值全部老老实实设为 0，与服务端保持绝对一致
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
    // ✨ 修复 Hydration 报错：组件一挂载到浏览器，立刻去读取缓存（速度极快，肉眼几乎不可见 0）
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
        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white transition-colors">
          阅读看板
        </h2>
        <div>
          {!hasCheckedIn ? (
            <button
              onClick={handleCheckIn}
              disabled={isCheckInLoading}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500/10 to-rose-500/10 dark:from-orange-500/20 dark:to-rose-500/20 border border-orange-500/30 text-orange-600 dark:text-orange-300 text-sm font-bold hover:from-orange-500/20 hover:to-rose-500/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isCheckInLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Flame className="w-4 h-4 text-orange-500 dark:text-orange-400 animate-pulse" />
              )}
              {isCheckInLoading ? "打卡中..." : "今日打卡"}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-bold cursor-default transition-colors duration-500">
              <Check className="w-4 h-4" />
              今日已打卡
            </div>
          )}
        </div>
      </div>

      {/* ================= 📊 数据面板区 ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        {/* -------- 组件 1：今年已读 -------- */}
        <div className="relative group bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-3xl p-6 flex flex-col overflow-hidden shadow-xl hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors duration-500 min-h-[160px]">
          {/* ✨ 悬浮光晕加深：浅色下直接使用饱和度更高的 indigo-500/40 */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 dark:bg-indigo-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/40 dark:group-hover:bg-indigo-500/40 group-hover:scale-150 transition-all duration-700"></div>

          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 mb-2 relative z-10">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-sm tracking-widest">今年已读</span>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center">
            {/* ✨ 呼吸背景加深 */}
            <div className="absolute inset-0 bg-indigo-500/20 dark:bg-indigo-500/10 blur-2xl rounded-full animate-pulse transition-colors duration-500"></div>
            <div className="flex items-baseline gap-2 relative transition-all duration-500">
              {/* ✨ 数字渐变与阴影加深：使用 700->500 的深色渐变，并加深投影浓度 */}
              <span
                suppressHydrationWarning
                className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-indigo-700 to-indigo-500 dark:from-white dark:via-indigo-200 dark:to-indigo-600 drop-shadow-[0_4px_20px_rgba(67,56,202,0.4)] dark:drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]"
              >
                {yearReadCount}
              </span>
              <span className="text-indigo-700 dark:text-indigo-400/80 font-bold text-xl transition-colors">
                本
              </span>
            </div>
          </div>
        </div>

        {/* -------- 组件 2：本月阅读 -------- */}
        <div className="relative group bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-3xl p-6 flex flex-col overflow-hidden shadow-xl hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors duration-500 min-h-[160px]">
          {/* ✨ 悬浮光晕加深 */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 dark:bg-emerald-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/40 dark:group-hover:bg-emerald-500/40 group-hover:scale-150 transition-all duration-700"></div>

          <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-400 mb-2 relative z-10">
            <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold text-sm tracking-widest">本月阅读</span>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center">
            {/* ✨ 呼吸背景加深 */}
            <div className="absolute inset-0 bg-emerald-500/20 dark:bg-emerald-500/10 blur-2xl rounded-full animate-pulse transition-colors duration-500"></div>
            <div className="flex items-baseline gap-2 relative transition-all duration-500">
              {/* ✨ 数字渐变与阴影加深 */}
              <span
                suppressHydrationWarning
                className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-700 to-emerald-500 dark:from-white dark:via-emerald-200 dark:to-emerald-600 drop-shadow-[0_4px_20px_rgba(4,120,87,0.3)] dark:drop-shadow-[0_0_30px_rgba(52,211,153,0.6)]"
              >
                {monthReadDays}
              </span>
              <span className="text-emerald-700 dark:text-emerald-500/80 font-bold text-xl transition-colors">
                天
              </span>
            </div>
          </div>
        </div>

        {/* -------- 组件 3：本周轨迹 -------- */}
        <div className="md:col-span-2 relative group bg-white/60 dark:bg-slate-800/40 backdrop-blur-xl border border-white/60 dark:border-white/5 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-xl hover:bg-white/80 dark:hover:bg-slate-800/60 transition-colors duration-500">
          {/* ✨ 悬浮光晕加深 */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-sky-500/15 dark:bg-sky-500/10 blur-3xl rounded-full pointer-events-none group-hover:bg-sky-500/35 dark:group-hover:bg-sky-500/30 group-hover:scale-150 transition-all duration-700"></div>

          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="font-bold text-sm tracking-widest text-slate-600 dark:text-slate-400">
              本周轨迹
            </span>
            <span
              suppressHydrationWarning
              className="text-xs text-slate-600 dark:text-slate-500 font-medium bg-slate-100 dark:bg-slate-900/50 px-2 py-1 rounded-md transition-colors duration-500"
            >
              本周已读 {continuousDays} 天
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 h-full relative z-10">
            {weekDays.map((day, index) => {
              const isActive = day.isRead;
              const isToday = day.isToday;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center gap-3 w-full"
                >
                  <span
                    className={`text-xs font-bold transition-colors duration-500 ${
                      isToday
                        ? isActive
                          ? "text-sky-600 dark:text-sky-400"
                          : "text-orange-600 dark:text-orange-400"
                        : // ✨ 未激活的日期文字加深为 slate-500
                          "text-slate-500 dark:text-slate-500"
                    }`}
                  >
                    {day.day}
                  </span>

                  <div
                    className={`w-full max-w-[40px] h-12 rounded-full flex items-center justify-center transition-all duration-500 relative overflow-hidden border
                      ${
                        isActive
                          ? "bg-sky-100 border-sky-300 dark:bg-sky-500/20 dark:border-sky-400/40"
                          : isToday
                          ? "bg-white dark:bg-slate-800/80 border-orange-500 dark:border-orange-500/50 border-dashed"
                          : // ✨ 未打卡的底框边线加深
                            "bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-white/5"
                      }
                    `}
                  >
                    <div
                      className={`w-2 h-2 rounded-full z-10 transition-all duration-300
                      ${
                        isActive
                          ? // ✨ 浅色下实心点也略微加深
                            "bg-sky-500 shadow-[0_0_10px_#0ea5e9] dark:bg-sky-400 dark:shadow-[0_0_10px_#38bdf8]"
                          : isToday
                          ? "bg-orange-500 dark:bg-orange-400 animate-pulse"
                          : // ✨ 未打卡的灰色圆点加深为 slate-400，防止看不清
                            "bg-slate-400 dark:bg-slate-700"
                      }
                    `}
                    />
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
