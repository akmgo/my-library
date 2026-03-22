// src/app/page.tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from 'next/link';
import BookCard from "../components/book/BookCard";
import AddBookDialog from "../components/book/AddBookDialog";
import { Boxes } from "../components/ui/background-boxes"; 
import { VideoText } from "../components/ui/video-text"; 
import { SparklesText } from "../components/ui/sparkles-text";
import { mockBooks } from "../lib/mock-data"; 
import { Book } from "../types"; 

export const dynamic = 'force-dynamic';

export default async function Home() {
  
  let allBooks: Book[] = [];

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

    if (db) {
      const { results } = await db.prepare("SELECT * FROM books ORDER BY addedAt DESC").all();
      allBooks = results.map((book: any) => ({
        ...book,
        tags: book.tags ? JSON.parse(book.tags) : []
      }));
    }
  } catch (error) {
    allBooks = mockBooks;
  }

  const readingBooks = allBooks.filter(b => b.status === 'READING');
  const finishedBooks = allBooks.filter(b => b.status === 'FINISHED');
  const unreadBooks = allBooks.filter(b => b.status === 'UNREAD');

  return (
    <div className="relative pb-24 w-[90%] md:w-[80%] mx-auto flex flex-col items-center">
      
      <div className="absolute top-8 right-0 z-50">
        <AddBookDialog />
      </div>

      {/* ================= 1. 顶部标题与格言区 ================= */}
      <header className="mt-20 mb-20 text-center w-full flex flex-col items-center relative z-10">
        
        {/* 特效标题：视频文字掩码 */}
        <div className="relative h-[120px] md:h-[160px] w-full max-w-3xl overflow-hidden flex justify-center items-center mb-2">
          {/* 这里直接使用你挑选的海洋视频素材，文字改为“图书馆” */}
          <VideoText src="https://cdn.magicui.design/ocean-small.webm">
            图书馆
          </VideoText>
        </div>

        {/* 特效格言：星火闪烁 */}
        {/* 我们把原本的斜体、衬线、字号和深色适应（text-slate-400）的类名直接传给组件，保证它原有的儒雅气质 */}
        <div className="max-w-2xl px-4">
          <SparklesText className="text-lg md:text-xl text-slate-400 italic font-serif leading-relaxed font-normal">
            “我心里一直都在暗暗设想，天堂应该是图书馆的模样。”
          </SparklesText>
        </div>
        
      </header>

      {/* ================= 2. 当前在读区块 ================= */}
      <section className="w-full relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-12 mb-12 shadow-2xl">
        {/* 特效遮罩层 */}
        <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
        
        {/* 原汁原味的深色矩阵特效 */}
        <div className="absolute inset-0 z-0">
          <Boxes />
        </div>
        
        {/* 【改动 1：事件穿透】加上 pointer-events-none，把空白区的鼠标事件漏给底下的 Boxes */}
        <div className="relative z-20 pointer-events-none">
          {/* 头部恢复 pointer-events-auto 以防你想加按钮 */}
          <div className="mb-8 flex items-center justify-between pointer-events-auto">
            <h2 className="text-2xl font-bold tracking-tight text-white">当前在读</h2>
            <span className="text-sm font-medium text-slate-300">
              {readingBooks.length > 0 ? "1 本" : "0 本"}
            </span>
          </div>
          
          {/* 【改动 2：不占空位】弃用 Grid，改用 Flex 限制宽度并靠左，强制切片只显示第一本 */}
          <div className="flex justify-start">
            {readingBooks.slice(0, 1).map((book) => (
              <div key={book.id} className="w-full sm:w-[360px] md:w-[400px]">
                {/* 恢复卡片的点击能力 */}
                <Link href={`/books/${book.id}`} className="pointer-events-auto block">
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
          
          {/* 同样加上事件穿透 */}
          <div className="relative z-20 pointer-events-none">
            <div className="mb-8 flex items-center justify-between pointer-events-auto">
              <h2 className="text-2xl font-bold tracking-tight text-white">已读完</h2>
              <span className="text-sm font-medium text-slate-300">{finishedBooks.length} 本</span>
            </div>
            {/* 这个区块维持网格不变 */}
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

        {/* 右侧：待读区块 */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-10 shadow-2xl">
          <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <div className="absolute inset-0 z-0"><Boxes /></div>
          
          {/* 同样加上事件穿透 */}
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
  );
}