// src/app/books/page.tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import Link from 'next/link';
import AddBookDialog from "../../components/book/AddBookDialog";
import BookCard from "../../components/book/BookCard";
import { mockBooks } from "../../lib/mock-data";
import { Book } from "../../types"; 

export const dynamic = 'force-dynamic';

export default async function Bookshelf() {

  let realBooks: Book[] = [];

  // 2. 核心改造：使用 try-catch 包裹 Cloudflare 专有环境的获取逻辑
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

    if (db) {
      // 如果获取到了线上数据库，就查真实数据
      const { results } = await db.prepare("SELECT * FROM books ORDER BY addedAt DESC").all();
      realBooks = results.map((book: any) => ({
        ...book,
        tags: book.tags ? JSON.parse(book.tags) : []
      }));
    }
  } catch (error) {
    // 3. 【本地极速模式】
    // 在普通 npm run dev 环境下，由于没有 Cloudflare 环境，上面会报错跳到这里
    // 我们直接拦截这个错误，并把 mockBooks 塞给页面！
    console.log("🔧 当前处于本地无数据库模式，使用 Mock 数据渲染 UI");
    realBooks = mockBooks;
  }

  

  return (
    <div className="space-y-6 max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">我的书架</h1>
          <p className="text-muted-foreground mt-2">共收录了 {realBooks.length} 本书籍。</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="搜索书名..." className="pl-9 bg-muted/50 border-none focus-visible:ring-1" />
          </div>
          <AddBookDialog />
        </div>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col mt-4">
        <TabsList className="w-full justify-start bg-transparent border-b rounded-none p-0 h-auto">
          <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
            全部书籍
          </TabsTrigger>
          <TabsTrigger value="reading" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-4 py-2">
            正在阅读
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6 flex-1">
          {/* 因为横向卡片比较宽，我们把列数稍微减少一点，让它有呼吸感：PC端3列，超大屏4列 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-10 px-2">
            
            {realBooks.map((book) => (
              <Link href={`/books/${book.id}`} key={book.id}>
                {/* 直接调用我们封装好的神仙组件！ */}
                <BookCard book={book} />
              </Link>
            ))}
            
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}