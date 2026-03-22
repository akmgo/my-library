// src/components/book/BookCard.tsx
import { Book } from "../../types";
import {
  Calendar,
  Clock,
  Star,
  Tag,
  CheckCircle2,
  BookOpen,
} from "lucide-react";
import { Badge } from "../ui/badge";

export default function BookCard({ book }: { book: Book }) {
  // 模拟一些目前数据库里还没有，但你期望展示的字段（评分、开始/结束时间）
  const mockRating = 4.8;
  const mockStartDate = "2026.03.10";
  const mockEndDate = book.status === "FINISHED" ? "2026.03.20" : "--";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/20 bg-background/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgb(0,0,0,0.08)] cursor-pointer">
      {/* 上半部分：横向封面 (16:9 比例) */}
      <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${book.coverUrl})` }}
        />
        {/* 封面底部的微弱渐变遮罩，让文字和边缘更平滑 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>

      {/* 下半部分：模块化信息区 */}
      <div className="flex flex-col flex-1 p-5 space-y-4">
        {/* 书名与作者 */}
        <div>
          <h3 className="font-bold text-lg leading-tight tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            {book.author}
          </p>
        </div>

        {/* 状态与评分模块区 (液态小胶囊设计) */}
        <div className="flex flex-wrap gap-2">
          {/* 状态模块 */}
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md ${
              book.status === "FINISHED"
                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                : book.status === "READING"
                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {book.status === "FINISHED" ? (
              <CheckCircle2 className="w-3.5 h-3.5" />
            ) : (
              <BookOpen className="w-3.5 h-3.5" />
            )}
            {book.status === "READING"
              ? `阅读中 ${book.progress}%`
              : book.status === "FINISHED"
              ? "已读完"
              : "吃灰中"}
          </div>

          {/* 评分模块 */}
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 text-xs font-semibold backdrop-blur-md">
            <Star className="w-3.5 h-3.5 fill-current" />
            {mockRating}
          </div>
        </div>

        {/* 时间模块区 */}
        <div className="flex flex-wrap gap-2 pt-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground border border-border/50">
            <Calendar className="w-3 h-3" />
            <span className="opacity-80">始于 {mockStartDate}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/50 text-xs text-muted-foreground border border-border/50">
            <Clock className="w-3 h-3" />
            <span className="opacity-80">终于 {mockEndDate}</span>
          </div>
        </div>

        {/* 底部：标签模块区 */}
        <div className="flex flex-wrap gap-1.5 pt-2 mt-auto">
          {book.tags.map((tag: string) => (
            <Badge
              key={tag}
              variant="secondary"
              className="bg-background/60 hover:bg-background/80 text-[10px] px-2 py-0.5 rounded-md border-border/50 shadow-sm"
            >
              <Tag className="w-2.5 h-2.5 mr-1" />
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}
