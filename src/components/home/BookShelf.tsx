// src/components/home/BookShelf.tsx
import Link from "next/link";
import BookCard from "../shared/BookCard";
import type { Book } from "../../types";

export default function BookShelf({ 
  finishedBooks, 
  unreadBooks 
}: { 
  finishedBooks: Book[]; 
  unreadBooks: Book[] 
}) {
  return (
    <section className="w-full grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* 🟢 已读列表 */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 p-8 md:p-10 shadow-lg border border-slate-200 dark:border-slate-800 transition-colors duration-500">
        <div className="relative z-20 flex flex-col h-full">
          <div className="mb-8 flex items-center justify-between pointer-events-auto">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              已读
            </h2>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
              {finishedBooks.length} 本
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {finishedBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                prefetch={false}
                className="block focus:outline-none"
              >
                <BookCard book={book} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ⚪ 待读列表 */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-50 dark:bg-slate-900 p-8 md:p-10 shadow-lg border border-slate-200 dark:border-slate-800 transition-colors duration-500">
        <div className="relative z-20 flex flex-col h-full">
          <div className="mb-8 flex items-center justify-between pointer-events-auto">
            <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">
              待读
            </h2>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-300">
              {unreadBooks.length} 本
            </span>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {unreadBooks.map((book) => (
              <Link
                key={book.id}
                href={`/books/${book.id}`}
                prefetch={false}
                className="block focus:outline-none"
              >
                <BookCard book={book} />
              </Link>
            ))}
          </div>
        </div>
      </div>

    </section>
  );
}