// src/app/books/page.tsx
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import AddBookDialog from "../../components/book/AddBookDialog";
// 新增这一行：引入我们在第一步定义的接口
import { Book } from "../../types";

// 【极其重要】声明这是一个运行在 Cloudflare 边缘节点的服务端组件
export const runtime = 'edge';

export default async function Bookshelf() {

  const db = process.env.library_db as any;

  // 1. 给 dbBooks 加上 : any[]，防止初始化为空数组时报错
  let dbBooks: any[] = []; 
  if (db) {
    const { results } = await db.prepare("SELECT * FROM books ORDER BY addedAt DESC").all();
    dbBooks = results;
  }

  // 2. 明确告诉 TypeScript，这里的 realBooks 是一个 Book 数组 (就像 Java 里的 List<Book>)
  const realBooks: Book[] = dbBooks.map((book: any) => ({
    ...book,
    tags: book.tags ? JSON.parse(book.tags) : []
  }));

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* 顶部标题与搜索栏区 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的书架</h1>
          <p className="text-muted-foreground mt-2">共收录了 {realBooks.length} 本书籍。</p> 
        </div>

        {/* 搜索框 */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="搜索书名、作者或标签..."
            className="pl-9 bg-muted/50 border-none focus-visible:ring-1"
          />
        </div>

        {/* 插入我们刚写好的弹窗组件 */}
        <AddBookDialog />

      </div>

      {/* 视图切换 Tabs */}
      <Tabs defaultValue="all" className="flex-1 flex flex-col mt-4">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto">
          <TabsTrigger
            value="all"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            全部书籍
          </TabsTrigger>
          <TabsTrigger
            value="reading"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            正在阅读
          </TabsTrigger>
          <TabsTrigger
            value="unread"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2"
          >
            想读
          </TabsTrigger>
        </TabsList>

        {/* Tab 内容区 - 这里我们为了演示，先统一展示 mockBooks，后续可以配合 React 的 useState 实现真正的过滤逻辑 */}
        <TabsContent value="all" className="mt-6 flex-1">
          {/* 响应式网格布局：手机1列，平板3列，PC 4列，超大屏 5列 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-10">
            {realBooks.map((book) => (
              <Link href={`/books/${book.id}`} key={book.id}>
                <Card className="group overflow-hidden border-none shadow-none bg-transparent cursor-pointer">
                  border-none shadow-none bg-transparent cursor-pointer"
                  <CardContent className="p-0 space-y-3">
                    {/* 书籍封面 (带 hover 悬浮微动效) */}
                    <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-border/50 bg-muted">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${book.coverUrl})` }}
                      />
                    </div>

                    {/* 书籍信息 */}
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {book.author}
                      </p>
                    </div>

                    {/* 状态与标签 */}
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          book.status === "FINISHED" ? "default" : "secondary"
                        }
                        className="text-[10px] px-1.5 py-0 h-4"
                      >
                        {book.status === "READING"
                          ? `${book.progress}%`
                          : book.status === "FINISHED"
                          ? "已读完"
                          : "未读"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
