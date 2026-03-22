// src/app/books/[id]/page.tsx
import Link from "next/link";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { ArrowLeft, BookOpen, Calendar, Clock, Tag } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";
import { Textarea } from "../../../components/ui/textarea";

// 强制动态渲染，因为我们需要每次访问时实时查数据库
export const dynamic = "force-dynamic";

export default async function BookDetails({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // 1. 获取动态路由上的 id
  const { id } = await params;

  // 2. 连接数据库并查询单本书籍
  let book: any = null;
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

    if (db) {
      // 使用 bind(?) 防止 SQL 注入，并使用 first() 只取一条记录
      book = await db
        .prepare("SELECT * FROM books WHERE id = ?")
        .bind(id)
        .first();

      // 如果查到了书，且有标签，解析 JSON
      if (book && book.tags) {
        book.tags = JSON.parse(book.tags);
      } else if (book) {
        book.tags = [];
      }
    }
  } catch (error) {
    console.error("查询书籍详情失败:", error);
  }

  // 3. 处理找不到书籍的情况 (比如 ID 输错了，或者数据被删了)
  if (!book) {
    return (
      <div className="flex flex-col items-center justify-center h-full space-y-4 pt-20">
        <h2 className="text-2xl font-bold tracking-tight">未找到该书籍</h2>
        <p className="text-muted-foreground">
          这本书可能还在茫茫书海中流浪，或者已被移除。
        </p>
        <Link href="/books">
          <Button variant="outline" className="mt-4">
            返回我的书架
          </Button>
        </Link>
      </div>
    );
  }

  // 4. 渲染完整的详情页面
  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* 顶部导航控制区 */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/books">
          <Button
            variant="ghost"
            className="pl-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回书架
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            编辑信息
          </Button>
          <Button size="sm">保存笔记</Button>
        </div>
      </div>

      {/* 主体内容区：左右分栏 */}
      <div className="flex flex-col lg:flex-row gap-10 flex-1 overflow-hidden">
        {/* 左侧：书籍元数据档案 */}
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
              <h1 className="text-2xl font-bold tracking-tight leading-tight mb-2">
                {book.title}
              </h1>
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
                  {book.status === "READING"
                    ? `阅读中 (${book.progress}%)`
                    : book.status === "FINISHED"
                    ? "已读完"
                    : "未读"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  入库时间
                </span>
                <span className="font-medium">
                  {new Date(book.addedAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center text-muted-foreground">
                  <Clock className="w-4 h-4 mr-2" />
                  最后更新
                </span>
                <span className="font-medium">
                  {new Date(book.updatedAt).toLocaleDateString()}
                </span>
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
                {book.tags.map((tag: string) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* 右侧：沉浸式笔记书写区 */}
        <main className="flex-1 flex flex-col h-full bg-background rounded-lg border shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b bg-muted/30">
            <h2 className="font-semibold text-sm">读书笔记</h2>
          </div>
          <div className="flex-1 p-6">
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
