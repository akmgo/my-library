// src/app/page.tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import BookCard from "../components/book/BookCard";
import AddBookDialog from "../components/book/AddBookDialog";
import { Boxes } from "../components/ui/background-boxes";
import { VideoText } from "../components/ui/video-text";
import { SparklesText } from "../components/ui/sparkles-text";
import PageTransition from "../components/PageTransition";
import ClientOnly from "../components/ClientOnly";
import ReadingProgress from "../components/book/ReadingProgress";
import BoomDecor from "../components/book/BoomDecor";

export const dynamic = "force-dynamic";

// ==========================================
// 1. 【新增】：瞬间渲染的骨架屏（Skeleton）
// ==========================================
function LibrarySkeleton() {
  return (
    <div className="w-full flex flex-col gap-10 opacity-70">
      {/* 在读区块骨架 */}
      <div className="w-full h-[300px] rounded-[2.5rem] bg-slate-900 border border-slate-800 flex flex-col items-center justify-center shadow-2xl animate-pulse">
        <Loader2 className="w-10 h-10 text-slate-600 animate-spin mb-4" />
        <p className="text-slate-500 tracking-widest">正在点亮书房...</p>
      </div>
      {/* 下方双列骨架 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="h-[400px] rounded-[2.5rem] bg-slate-900 border border-slate-800 animate-pulse" />
        <div className="h-[400px] rounded-[2.5rem] bg-slate-900 border border-slate-800 animate-pulse" />
      </div>
    </div>
  );
}

// ==========================================
// 2. 【核心拆分】：负责查数据库和渲染书籍的异步组件
// ==========================================
async function BookSections() {
  let books: any[] = [];
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

    if (db) {
      const { results } = await db
        .prepare("SELECT * FROM books ORDER BY addedAt DESC")
        .all();
      books = results.map((book: any) => ({
        ...book,
        tags: JSON.parse(book.tags || "[]"),
      }));
    }
  } catch (error) {
    console.error("数据库读取失败:", error);
    return (
      <div className="text-red-500 w-full text-center py-10">
        书库连接失败，请稍后重试。
      </div>
    );
  }

  const readingBooks = books.filter((book) => book.status === "READING");
  const finishedBooks = books.filter((book) => book.status === "FINISHED");
  const unreadBooks = books.filter((book) => book.status === "UNREAD");

  return (
    <>
      {/* ================= 2. 顶部双拼区块：在读 (50%) & 控制台 (50%) ================= */}
      {/* ================= 2. 顶部双拼区块：在读 & 控制台 ================= */}
      <section className="w-full grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
        {/* ---------------- 左半边 50%：当前在读区块 ---------------- */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl flex flex-col min-h-[520px]">
          <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

          {/* 【性能优化 1】：把最吃 CPU 的背景网格丢给客户端渲染 */}
          <div className="absolute inset-0 z-0">
            <ClientOnly>
              <Boxes />
            </ClientOnly>
          </div>

          <div className="relative z-20 pointer-events-none flex flex-col h-full">
            <div className="mb-6 flex items-center justify-between pointer-events-auto">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                当前在读
              </h2>
              <span className="text-sm font-medium text-slate-300">
                {readingBooks.length > 0 ? `${readingBooks.length} 本` : "0 本"}
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-6 pointer-events-auto">
              {readingBooks.length > 0 ? (
                <>
                  {/* 【上层 70%】：分左右 (60/40) */}
                  <div className="flex-[7] flex flex-col sm:flex-row items-stretch gap-6">
                    {/* 书籍卡片 (纯静态 UI，服务端渲染没问题) */}
                    <div className="flex-[6] min-w-0">
                      <Link
                        href={`/books/${readingBooks[0].id}`}
                        prefetch={true}
                        className="block h-full transition-transform hover:scale-[1.02] duration-500"
                      >
                        <div className="h-full">
                          <BookCard book={readingBooks[0]} />
                        </div>
                      </Link>
                    </div>

                    {/* 【性能优化 2】：进度条带有物理动画引擎，甩给客户端 */}
                    <div className="flex-[4] min-w-[200px]">
                      <ClientOnly
                        fallback={
                          <div className="w-full h-full bg-slate-800/40 rounded-[2rem] animate-pulse border border-slate-700/50" />
                        }
                      >
                        <ReadingProgress book={readingBooks[0]} />
                      </ClientOnly>
                    </div>
                  </div>

                  {/* 【性能优化 3】：BOOM 装饰区，含有厚重渲染和变体，甩给客户端 */}
                  <div className="flex-[3] w-full">
                    <ClientOnly
                      fallback={
                        <div className="w-full h-full min-h-[120px] bg-slate-800/40 rounded-[2rem] animate-pulse border border-slate-700/50" />
                      }
                    >
                      <BoomDecor />
                    </ClientOnly>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-slate-500 italic">
                  目前没有正在阅读的书籍
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ---------------- 右半边 50%：控制台区块 ---------------- */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 shadow-2xl flex flex-col border border-slate-800/50">
          <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />

          {/* 【同理】：右侧如果有 Boxes，也包起来 */}
          <div className="absolute inset-0 z-0">
            <ClientOnly>
              <Boxes />
            </ClientOnly>
          </div>

          <div className="relative z-20 pointer-events-none flex flex-col h-full">
            <div className="mb-6 flex items-center justify-between pointer-events-auto">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                控制台
              </h2>
              <span className="text-xs font-medium text-slate-500 border border-slate-700 bg-slate-800/30 px-3 py-1 rounded-full">
                数据中心
              </span>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center pointer-events-auto bg-slate-900/30 rounded-3xl border border-slate-800/50 border-dashed p-6 group transition-colors hover:bg-slate-800/30">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500">
                  <svg
                    className="w-8 h-8 text-slate-500 group-hover:text-blue-400 transition-colors"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-slate-300 font-medium tracking-wide">
                  数据看板预留
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 已读 & 待读区块 */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* 左侧：已读区块 */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-10 shadow-2xl">
          <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <div className="absolute inset-0 z-0">
            <Boxes />
          </div>

          <div className="relative z-20 pointer-events-none">
            <div className="mb-8 flex items-center justify-between pointer-events-auto">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                已读
              </h2>
              <span className="text-sm font-medium text-slate-300">
                {finishedBooks.length} 本
              </span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {finishedBooks.map((book) => (
                <Link
                  href={`/books/${book.id}`}
                  prefetch={true}
                  key={book.id}
                  className="pointer-events-auto block transition-opacity hover:opacity-90"
                >
                  <BookCard book={book} />
                </Link>
              ))}
              {finishedBooks.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-sm pointer-events-auto">
                  还没有读完的书籍
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 右侧：想读区块 */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-10 shadow-2xl">
          <div className="absolute inset-0 w-full h-full bg-slate-900 z-10 [mask-image:radial-gradient(transparent,white)] pointer-events-none" />
          <div className="absolute inset-0 z-0">
            <Boxes />
          </div>

          <div className="relative z-20 pointer-events-none">
            <div className="mb-8 flex items-center justify-between pointer-events-auto">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                待读
              </h2>
              <span className="text-sm font-medium text-slate-300">
                {unreadBooks.length} 本
              </span>
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {unreadBooks.map((book) => (
                <Link
                  href={`/books/${book.id}`}
                  prefetch={true}
                  key={book.id}
                  className="pointer-events-auto block transition-opacity hover:opacity-90"
                >
                  <BookCard book={book} />
                </Link>
              ))}
              {unreadBooks.length === 0 && (
                <div className="col-span-full py-8 text-center text-slate-400 text-sm pointer-events-auto">
                  书单目前空空如也
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ==========================================
// 3. 【页面主入口】：瞬间渲染外壳，绝不卡顿
// ==========================================
export default function Home() {
  return (
    <PageTransition>
      <div className="relative pb-24 w-[90%] md:w-[80%] mx-auto flex flex-col items-center min-h-screen">
        <div className="absolute top-8 right-0 z-50">
          <AddBookDialog />
        </div>

        {/* 顶部标题与格言区：没有任何阻塞，0.01秒瞬间显示！ */}
        <header className="mt-20 mb-20 text-center w-full flex flex-col items-center relative z-10">
          <div className="relative h-[120px] md:h-[160px] w-full max-w-3xl overflow-hidden flex justify-center items-center mb-2">
            <VideoText src="https://cdn.magicui.design/ocean-small.webm">
              图书馆
            </VideoText>
          </div>

          <div className="max-w-2xl px-4">
            <SparklesText className="text-lg md:text-xl text-slate-400 italic font-serif leading-relaxed font-normal">
              “我心里一直都在暗暗设想，天堂应该是图书馆的模样。”
            </SparklesText>
          </div>
        </header>

        {/* 魔法发生的地方：用 Suspense 接管数据加载 */}
        <Suspense fallback={<LibrarySkeleton />}>
          {/* 在这里，Next.js 会去后台查数据库，查完之后自动替换掉骨架屏 */}
          <BookSections />
        </Suspense>
      </div>
    </PageTransition>
  );
}
