// src/app/page.tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';
import BookCard from "../components/book/BookCard";
import AddBookDialog from "../components/book/AddBookDialog";
import { Boxes } from "../components/ui/background-boxes"; 
import { VideoText } from "../components/ui/video-text"; 
import { SparklesText } from "../components/ui/sparkles-text";
import PageTransition from "../components/PageTransition";

// 强制每次访问都实时获取最新数据，不使用静态缓存
export const dynamic = 'force-dynamic';

export default async function Home() {
  
  // 1. 从 Cloudflare D1 数据库实时拉取图书数据
  let books: any[] = [];
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    
    if (db) {
      // 按照添加时间倒序排列，最新录入的在最前面
      const { results } = await db.prepare("SELECT * FROM books ORDER BY addedAt DESC").all();
      
      // SQLite 没有数组类型，标签是存成 JSON 字符串的，拿出来时需要 parse 一下
      books = results.map((book: any) => ({
        ...book,
        tags: JSON.parse(book.tags || '[]')
      }));
    }
  } catch (error) {
    console.error("数据库读取失败:", error);
  }

  // 2. 根据真实数据的 status 字段，将书籍分类到对应的展区
  const readingBooks = books.filter((book) => book.status === 'READING');
  const finishedBooks = books.filter((book) => book.status === 'FINISHED');
  const unreadBooks = books.filter((book) => book.status === 'UNREAD');

  return (
    <PageTransition>
      <div className="relative pb-24 w-[90%] md:w-[80%] mx-auto flex flex-col items-center min-h-screen">
      
      {/* 右上角的录入新书弹窗入口 */}
      <div className="absolute top-8 right-0 z-50">
        <AddBookDialog />
      </div>

      {/* ================= 1. 顶部标题与格言区 ================= */}
      <header className="mt-20 mb-20 text-center w-full flex flex-col items-center relative z-10">
        
        {/* 特效标题：视频文字掩码 */}
        <div className="relative h-[120px] md:h-[160px] w-full max-w-3xl overflow-hidden flex justify-center items-center mb-2">
          <VideoText src="https://cdn.magicui.design/ocean-small.webm">
            图书馆
          </VideoText>
        </div>

        {/* 特效格言：星火闪烁 */}
        <div className="max-w-2xl px-4">
          <SparklesText className="text-lg md:text-xl text-slate-400 italic font-serif leading-relaxed font-normal">
            “我心里一直都在暗暗设想，天堂应该是图书馆的模样。”
          </SparklesText>
        </div>
        
      </header>

      {/* ================= 2. 当前在读区块 ================= */}
      <section className="w-full relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 mb-12 shadow-2xl">
        <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
        
        <div className="absolute inset-0 z-0">
          <Boxes />
        </div>
        
        <div className="relative z-20 pointer-events-none">
          <div className="mb-8 flex items-center justify-between pointer-events-auto">
            <h2 className="text-2xl font-bold tracking-tight text-white">当前在读</h2>
            <span className="text-sm font-medium text-slate-300">
              {readingBooks.length > 0 ? `${readingBooks.length} 本` : "0 本"}
            </span>
          </div>
          
          <div className="flex justify-start">
            {readingBooks.slice(0, 1).map((book) => (
              <div key={book.id} className="w-full sm:w-[360px] md:w-[400px]">
                <Link href={`/books/${book.id}`} prefetch={true} className="block transition-opacity hover:opacity-90">
                  <BookCard book={book} />
                </Link>
              </div>
            ))}
            {readingBooks.length === 0 && (
              <div className="py-12 text-slate-400 pointer-events-auto">目前没有正在阅读的书籍</div>
            )}
          </div>
        </div>
      </section>

      {/* ================= 3. 已读 & 待读区块 ================= */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* 左侧：已读区块 */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-10 shadow-2xl">
          <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <div className="absolute inset-0 z-0"><Boxes /></div>
          
          <div className="relative z-20 pointer-events-none">
            <div className="mb-8 flex items-center justify-between pointer-events-auto">
              <h2 className="text-2xl font-bold tracking-tight text-white">已读完</h2>
              <span className="text-sm font-medium text-slate-300">{finishedBooks.length} 本</span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {finishedBooks.map((book) => (
                <Link href={`/books/${book.id}`} key={book.id} className="pointer-events-auto block">
                  <BookCard book={book} />
                </Link>
              ))}
              {finishedBooks.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-sm pointer-events-auto">还没有读完的书籍</div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：想读区块 */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-10 shadow-2xl">
          <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <div className="absolute inset-0 z-0"><Boxes /></div>
          
          <div className="relative z-20 pointer-events-none">
            <div className="mb-8 flex items-center justify-between pointer-events-auto">
              <h2 className="text-2xl font-bold tracking-tight text-white">想读</h2>
              <span className="text-sm font-medium text-slate-300">{unreadBooks.length} 本</span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {unreadBooks.map((book) => (
                <Link href={`/books/${book.id}`} key={book.id} className="pointer-events-auto block">
                  <BookCard book={book} />
                </Link>
              ))}
              {unreadBooks.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-sm pointer-events-auto">书单目前空空如也</div>
              )}
            </div>
          </div>
        </div>

      </section>

    </div>
    </PageTransition>
  );
}