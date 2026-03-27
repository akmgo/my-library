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
      const weekDateStrings = currentWeekInfo.map(w => w.dateStr);

      const res = await getDashboardStats({ year: yearStr, month: monthStr, weekDates: weekDateStrings });

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
          return { day: info.label, dateStr: info.dateStr, isRead: isRead, isToday: info.dateStr === todayStr };
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
    setMonthReadDays(prev => {
      const newVal = prev + 1;
      localStorage.setItem("lib_monthDays", String(newVal));
      return newVal;
    });
    setContinuousDays(prev => {
      const newVal = prev + 1;
      localStorage.setItem("lib_continuousDays", String(newVal));
      return newVal;
    });
    setWeekDays(prev => prev.map(d => d.isToday ? { ...d, isRead: true } : d));

    const todayStr = formatDate(new Date());
    await recordTodayReading(todayStr);
    setIsCheckInLoading(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      
      {/* ================= 🚀 接管父组件头部：标题 + 打卡按钮 ================= */}
      <div className="mb-6 flex items-center justify-between pointer-events-auto">
        <h2 className="text-2xl font-bold tracking-tight text-white">阅读看板</h2>
        
        <div>
          {!hasCheckedIn ? (
            <button 
              onClick={handleCheckIn}
              disabled={isCheckInLoading}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-500/30 text-orange-300 text-sm font-bold hover:from-orange-500/30 hover:to-rose-500/30 transition-all active:scale-95 disabled:opacity-50 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
            >
              {isCheckInLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Flame className="w-4 h-4 text-orange-400 animate-pulse" />}
              {isCheckInLoading ? "打卡中..." : "今日打卡"}
            </button>
          ) : (
            <div className="flex items-center justify-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold cursor-default transition-all duration-500 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <Check className="w-4 h-4" />
              今日已打卡
            </div>
          )}
        </div>
      </div>

      {/* ================= 📊 数据面板区 ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        
        {/* -------- 组件 1：今年已读 -------- */}
        <div className="relative group bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col overflow-hidden shadow-xl hover:bg-slate-800/60 transition-colors duration-500 min-h-[160px]">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-500"></div>
          
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2 relative z-10">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span className="font-bold text-sm tracking-widest">今年已读</span>
          </div>
          
          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full animate-pulse"></div>
            
            <div className="flex items-baseline gap-2 relative transition-all duration-500">
              {/* ✨ 加上 suppressHydrationWarning 防止极端情况下的文字节点闪烁报错 */}
              <span suppressHydrationWarning className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-indigo-600 drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]">
                {yearReadCount}
              </span>
              <span className="text-indigo-400/80 font-bold text-xl">本</span>
            </div>
          </div>
        </div>

        {/* -------- 组件 2：本月阅读 -------- */}
        <div className="relative group bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col overflow-hidden shadow-xl hover:bg-slate-800/60 transition-colors duration-500 min-h-[160px]">
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-500"></div>
          
          <div className="flex items-center justify-center gap-2 text-slate-400 mb-2 relative z-10">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm tracking-widest">本月阅读</span>
          </div>

          <div className="relative z-10 flex-1 flex items-center justify-center">
            <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full animate-pulse"></div>
            
            <div className="flex items-baseline gap-2 relative transition-all duration-500">
              <span suppressHydrationWarning className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-200 to-emerald-600 drop-shadow-[0_0_30px_rgba(52,211,153,0.6)]">
                {monthReadDays}
              </span>
              <span className="text-emerald-500/80 font-bold text-xl">天</span>
            </div>
          </div>
        </div>

        {/* -------- 组件 3：本周轨迹 -------- */}
        <div className="md:col-span-2 relative group bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-xl hover:bg-slate-800/60 transition-colors duration-500">
          
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="font-bold text-sm tracking-widest text-slate-400">本周轨迹</span>
            <span suppressHydrationWarning className="text-xs text-slate-500 font-medium bg-slate-900/50 px-2 py-1 rounded-md transition-all duration-500">
              本周已读 {continuousDays} 天
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 h-full relative z-10">
            {weekDays.map((day, index) => {
              const isActive = day.isRead;
              const isToday = day.isToday;

              return (
                <div key={index} className="flex flex-col items-center gap-3 w-full">
                  <span className={`text-xs font-bold transition-colors duration-500 ${isToday ? "text-indigo-400" : "text-slate-500"}`}>
                    {day.day}
                  </span>
                  
                  <div 
                    className={`w-full max-w-[40px] h-12 rounded-full flex items-center justify-center transition-all duration-500 relative overflow-hidden
                      ${isActive 
                        ? "bg-indigo-500/20 border border-indigo-400/40 shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
                        : isToday
                          ? "bg-slate-800/80 border border-indigo-500/50 border-dashed"
                          : "bg-slate-900/50 border border-white/5"
                      }
                    `}
                  >
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-b from-indigo-400/40 to-transparent pointer-events-none" />
                    )}
                    <div className={`w-2 h-2 rounded-full z-10 transition-all duration-300
                      ${isActive ? "bg-indigo-300 shadow-[0_0_10px_#818cf8]" : "bg-slate-700"}
                      ${isToday && !isActive ? "bg-slate-500 animate-pulse" : ""}
                    `} />
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