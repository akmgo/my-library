// src/app/page.tsx
import { getCloudflareContext } from "@opennextjs/cloudflare";
import Link from "next/link";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import BookCard from "../components/book/BookCard";
import AddBookDialog from "../components/book/AddBookDialog";
import { VideoText } from "../components/ui/video-text";
import { SparklesText } from "../components/ui/sparkles-text";
import ClientOnly from "../components/ClientOnly";
import ReadingProgress from "../components/book/ReadingProgress";
import BoomDecor from "../components/book/BoomDecor";
import DashboardWidgets from "../components/dashboard/DashboardWidgets";

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
      {/* ================= 2. 顶部双拼区块：在读 & 控制台 ================= */}
      <section className="w-full grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
        
        {/* ---------------- 左半边 50%：当前在读区块 ---------------- */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-10 shadow-2xl">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />

          <div className="relative z-20 flex flex-col h-full">
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
                  <div className="flex-[7] flex flex-col sm:flex-row items-stretch gap-6">
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

        {/* ---------------- 右半边 50%：控制台区块 (完美植入小组件) ---------------- */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-900 p-8 md:p-10 shadow-2xl flex flex-col border border-slate-800/50">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />

          <div className="relative z-20 flex flex-col h-full">
            <div className="mb-6 flex items-center justify-between pointer-events-auto">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                阅读看板
              </h2>
              <span className="text-xs font-medium text-indigo-400 border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                Live Data
              </span>
            </div>

            {/* 🚀 直接在这里召唤你的小组件组合！无缝融入！ */}
            <div className="flex-1 pointer-events-auto w-full flex flex-col justify-center">
              <DashboardWidgets />
            </div>
          </div>
        </div>
      </section>

      {/* 已读 & 待读区块 (保持不变) */}
      <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-800/30 backdrop-blur-xl p-8 md:p-10 shadow-2xl border border-white/10 flex flex-col hover:bg-slate-800/40 transition-colors duration-500">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />

          <div className="relative z-20 flex flex-col h-full">
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
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-800/30 backdrop-blur-xl p-8 md:p-10 shadow-2xl border border-white/10 flex flex-col hover:bg-slate-800/40 transition-colors duration-500">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/20 blur-[100px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3" />

          <div className="relative z-20 flex flex-col h-full">
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
    <div className="relative pb-24 w-[90%] md:w-[80%] mx-auto flex flex-col items-center min-h-screen">
      <div className="absolute top-8 right-0 z-50">
        <AddBookDialog />
      </div>

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

      <Suspense fallback={<LibrarySkeleton />}>
        <BookSections />
      </Suspense>
    </div>
  );
}