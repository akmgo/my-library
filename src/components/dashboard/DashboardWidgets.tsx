"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CalendarDays, Flame, Check } from "lucide-react";

export default function DashboardWidgets() {
  const yearReadCount = 12;
  const monthReadDays = 18;
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const [weekDays, setWeekDays] = useState([
    { day: "一", isRead: true, isToday: false },
    { day: "二", isRead: true, isToday: false },
    { day: "三", isRead: hasCheckedIn, isToday: true },
    { day: "四", isRead: false, isToday: false },
    { day: "五", isRead: false, isToday: false },
    { day: "六", isRead: false, isToday: false },
    { day: "日", isRead: false, isToday: false },
  ]);

  const handleCheckIn = () => {
    if (hasCheckedIn) return;
    setHasCheckedIn(true);
    setWeekDays(prev => prev.map(d => d.isToday ? { ...d, isRead: true } : d));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
      
      {/* ================= 组件 1：今年已读 (方块) ================= */}
      <div className="relative group bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col overflow-hidden shadow-xl hover:bg-slate-800/60 transition-colors duration-500">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-indigo-500/30 transition-colors duration-500"></div>
        
        {/* 顶部标题居中 */}
        <div className="flex items-center justify-center gap-2 text-slate-400 mb-2 relative z-10">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span className="font-bold text-sm tracking-widest">今年已读</span>
        </div>
        
        {/* 🚀 核心修改：弹性铺满剩余空间，让数字绝对居中，并加入呼吸灯特效 */}
        <div className="relative z-10 flex-1 flex items-center justify-center">
          {/* 数字背后的专属呼吸光晕 */}
          <div className="absolute inset-0 bg-indigo-500/10 blur-2xl rounded-full animate-pulse"></div>
          
          <div className="flex items-baseline gap-2 relative">
            <span className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-indigo-200 to-indigo-600 drop-shadow-[0_0_30px_rgba(99,102,241,0.6)]">
              {yearReadCount}
            </span>
            <span className="text-indigo-400/80 font-bold text-xl">本</span>
          </div>
        </div>
      </div>

      {/* ================= 组件 2：本月阅读与打卡 (方块) ================= */}
      <div className="relative group bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col overflow-hidden shadow-xl hover:bg-slate-800/60 transition-colors duration-500">
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-emerald-500/20 blur-3xl rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-500"></div>
        
        {/* 顶部标题居中 */}
        <div className="flex items-center justify-center relative z-10">
          <div className="flex items-center gap-2 text-slate-400">
            <CalendarDays className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm tracking-widest">本月阅读</span>
          </div>
        </div>

        {/* 🚀 核心修改：绝对居中 + 翡翠绿呼吸特效 */}
        <div className="relative z-10 flex-1 flex items-center justify-center mt-2 mb-4">
          <div className="absolute inset-0 bg-emerald-500/10 blur-2xl rounded-full animate-pulse"></div>
          
          <div className="flex items-baseline gap-2 relative">
            <span className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white via-emerald-200 to-emerald-600 drop-shadow-[0_0_30px_rgba(52,211,153,0.6)] transition-all duration-500">
              {hasCheckedIn ? monthReadDays + 1 : monthReadDays}
            </span>
            <span className="text-emerald-500/80 font-bold text-xl">天</span>
          </div>
        </div>

        <div className="mt-auto relative z-10">
          {!hasCheckedIn ? (
            <button 
              onClick={handleCheckIn}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-orange-500/20 to-rose-500/20 border border-orange-500/30 text-orange-300 text-sm font-bold hover:from-orange-500/30 hover:to-rose-500/30 transition-all active:scale-95 group/btn shadow-[0_0_20px_rgba(249,115,22,0.15)]"
            >
              <Flame className="w-4 h-4 text-orange-400 animate-pulse" />
              今日未读，点击打卡
            </button>
          ) : (
            <div className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-bold cursor-default">
              <Check className="w-4 h-4" />
              今日已读
            </div>
          )}
        </div>
      </div>

      {/* ================= 组件 3：本周轨迹 (长条) ================= */}
      <div className="md:col-span-2 relative group bg-slate-800/40 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col justify-between overflow-hidden shadow-xl hover:bg-slate-800/60 transition-colors duration-500">
        
        <div className="flex items-center justify-between mb-4 relative z-10">
          <span className="font-bold text-sm tracking-widest text-slate-400">本周轨迹</span>
          <span className="text-xs text-slate-500 font-medium bg-slate-900/50 px-2 py-1 rounded-md">
            连续 {hasCheckedIn ? 3 : 2} 天
          </span>
        </div>

        <div className="flex items-center justify-between gap-2 h-full relative z-10">
          {weekDays.map((day, index) => {
            const isActive = day.isRead;
            const isToday = day.isToday;

            return (
              <div key={index} className="flex flex-col items-center gap-3 w-full">
                <span className={`text-xs font-bold ${isToday ? "text-indigo-400" : "text-slate-500"}`}>
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
  );
}