// src/app/page.tsx
import { BookOpen, CheckCircle, Clock } from "lucide-react";
import { mockBooks } from "../lib/mock-data";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";

export default function Dashboard() {
  // 简单的数据统计逻辑
  const readingBooks = mockBooks.filter((b) => b.status === "READING");
  const finishedBooks = mockBooks.filter((b) => b.status === "FINISHED");
  const unreadBooks = mockBooks.filter((b) => b.status === "UNREAD");

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">控制台</h1>
        <p className="text-muted-foreground mt-2">欢迎回来，今天想读点什么？</p>
      </div>

      {/* 顶部统计卡片区 (Grid 布局，一行三列) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">正在阅读</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readingBooks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已读完</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{finishedBooks.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">想读 (吃灰中)</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadBooks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* 正在阅读展示区 */}
      <div>
        <h2 className="text-xl font-semibold mb-4 tracking-tight">继续阅读</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {readingBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden flex flex-row">
              {/* 左侧封面 */}
              <div 
                className="w-32 bg-muted bg-cover bg-center border-r"
                style={{ backgroundImage: `url(${book.coverUrl})` }}
              />
              {/* 右侧信息 */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg leading-tight line-clamp-1">{book.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{book.author}</p>
                  <div className="flex gap-2 mt-3">
                    {book.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* 进度条 */}
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">阅读进度</span>
                    <span className="font-medium">{book.progress}%</span>
                  </div>
                  <Progress value={book.progress} className="h-2" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

    </div>
  );
}