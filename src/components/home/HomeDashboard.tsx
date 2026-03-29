// src/components/home/HomeDashboard.tsx
import { getAllBooks } from "../../app/actions/books";
import type { Book } from "../../types";

import CurrentReading from "./CurrentReading";
import BookShelf from "./BookShelf";
// ✨ 引入包装好的 Lazy 组件
import DashboardWidgetsLazy from "./DashboardWidgetsLazy"; 

export default async function HomeDashboard() {
  let books: Book[] = [];

  try {
    const res = await getAllBooks();
    if (res.success && res.books) {
      books = res.books;
    } else {
      throw new Error("获取数据失败");
    }
  } catch (error) {
    console.error("数据读取失败:", error);
    return (
      <div className="text-red-500 w-full text-center py-10">
        书库连接失败，请稍后重试。
      </div>
    );
  }

  const readingBooks = books.filter((b) => b.status === "READING");
  const finishedBooks = books.filter((b) => b.status === "FINISHED");
  const unreadBooks = books.filter((b) => b.status === "UNREAD");

  return (
    <>
      <section className="w-full grid grid-cols-1 xl:grid-cols-2 gap-10 mb-12">
        <CurrentReading readingBooks={readingBooks} />

        {/* 右半侧：数据看板 */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-white/60 dark:bg-slate-900 p-8 md:p-10 shadow-2xl flex flex-col border border-white/60 dark:border-slate-800/50 backdrop-blur-2xl transition-colors duration-500">
          <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-300/30 dark:bg-blue-600/10 blur-[100px] rounded-full pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-colors duration-500" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-300/30 dark:bg-purple-600/10 blur-[100px] rounded-full pointer-events-none translate-x-1/3 translate-y-1/3 transition-colors duration-500" />

          <div className="relative z-20 flex flex-col h-full">
            <div className="flex-1 pointer-events-auto w-full flex flex-col justify-center">
              {/* ✨ 使用封装好的懒加载壳 */}
              <DashboardWidgetsLazy />
            </div>
          </div>
        </div>
      </section>

      <BookShelf finishedBooks={finishedBooks} unreadBooks={unreadBooks} />
    </>
  );
}