// src/app/books/[id]/page.tsx
import Link from "next/link";
import { ArrowLeft, BookOpen, Calendar, Clock, Tag } from "lucide-react";
import { mockBooks } from "../../../lib/mock-data";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";

// 在 Next.js 15 中，动态路由的 params 是一个 Promise，需要 await
export default async function BookDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // 模拟从数据库查询当前书籍
  const book = mockBooks.find((b) => b.id === id);

  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <h2 className="text-2xl font-bold">未找到该书籍</h2>
        <Link href="/books">
          <Button variant="outline">返回书架</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* 顶部导航控制区 */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/books">
          <Button variant="ghost" className="pl-0 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回书架
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">编辑信息</Button>
          <Button size="sm">保存笔记</Button>
        </div>
      </div>

      {/* 主体内容区：左右分栏 */}
      <div className="flex flex-col lg:flex-row gap-10 flex-1 overflow-hidden">
        
        {/* 左侧：书籍元数据 (固定宽度) */}
        <aside className="w-full lg:w-80 flex-shrink-0 overflow-y-auto pr-2 custom-scrollbar">
          {/* 封面 */}
          <div className="aspect-[2/3] w-full rounded-lg overflow-hidden border bg-muted mb-6 shadow-sm">
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${book.coverUrl})` }}
            />
          </div>

          {/* 核心信息 */}
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight leading-tight mb-2">{book.title}</h1>
              <p className="text-lg text-muted-foreground">{book.author}</p>
            </div>

            <Separator />

            {/* 状态数据 */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="flex items-center text-muted-foreground">
                  <BookOpen className="w-4 h-4 mr-2" />
                  当前状态
                </span>
                <span className="font-medium">
                  {book.status === 'READING' ? `阅读中 (${book.progress}%)` : book.status === 'FINISHED' ? '已读完' : '未读'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  入库时间
                </span>
                <span className="font-medium">{book.addedAt}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  最后更新
                </span>
                <span className="font-medium">{book.updatedAt}</span>
              </div>
            </div>

            <Separator />

            {/* 标签 */}
            <div>
              <span className="flex items-center text-sm text-muted-foreground mb-3">
                <Tag className="w-4 h-4 mr-2" />
                分类标签
              </span>
              <div className="flex flex-wrap gap-2">
                {book.tags.map(tag => (
                  <Badge key={tag} variant="secondary">{tag}</Badge>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* 右侧：沉浸式笔记区 (占据剩余空间) */}
        <main className="flex-1 flex flex-col h-full bg-background rounded-lg border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">读书笔记</h2>
          </div>
          <div className="flex-1 p-6">
            {/* 暂时使用一个极其干净的 Textarea 替代复杂的 Markdown 编辑器 */}
            <Textarea 
              placeholder="在这里记录你的思考、摘抄或章节摘要..." 
              className="w-full h-full resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-base leading-relaxed"
              defaultValue={`# 核心要点\n\n- \n- \n\n# 个人感悟\n\n`}
            />
          </div>
        </main>

      </div>
    </div>
  );
}