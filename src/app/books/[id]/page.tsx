// src/app/books/[id]/page.tsx
import { getBookDetail } from "../../../app/actions/books";
import BookDetailClient from "../../../components/detail/BookDetailClient";
import { Loader2 } from "lucide-react";

export default async function BookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const res = await getBookDetail(id);

  if (!res.success || !res.book) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500 font-bold tracking-widest">
        找不到该档案，它可能已被销毁
      </div>
    );
  }

  return <BookDetailClient initialBook={res.book} initialExcerpts={res.excerpts || []} />;
}