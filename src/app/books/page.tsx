// src/app/books/page.tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Card, CardContent } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import Link from 'next/link';
import AddBookDialog from "../../components/book/AddBookDialog";
import { Book } from "../../types"; 

export const dynamic = 'force-dynamic';

export default async function Bookshelf() {
  const { env } = await getCloudflareContext({ async: true });
  const db = env.library_db as any;

  let dbBooks: any[] = []; 
  if (db) {
    const { results } = await db.prepare("SELECT * FROM books ORDER BY addedAt DESC").all();
    dbBooks = results;
  }

  const realBooks: Book[] = dbBooks.map((book: any) => ({
    ...book,
    tags: book.tags ? JSON.parse(book.tags) : []
  }));

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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 pb-10">
            {realBooks.map((book) => (
              <Link href={`/books/${book.id}`} key={book.id}>
                <Card className="group overflow-hidden border-none shadow-none bg-transparent cursor-pointer">
                  <CardContent className="p-0 space-y-3">
                    <div className="relative aspect-[2/3] overflow-hidden rounded-md border border-border/50 bg-muted">
                      <div 
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
                        style={{ backgroundImage: `url(${book.coverUrl})` }}
                      />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                        {book.title}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-1">{book.author}</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant={book.status === 'FINISHED' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0 h-4">
                        {book.status === 'READING' ? `${book.progress}%` : book.status === 'FINISHED' ? '已读完' : '未读'}
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