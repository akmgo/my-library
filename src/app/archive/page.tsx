// src/app/archive/page.tsx
import { getAllBooks } from "../../app/actions/books";
import { getAllReadingLogs } from "../../app/actions/reading";
import ArchiveClient from "../../components/archive/ArchiveClient";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const [booksRes, logsRes] = await Promise.all([
    getAllBooks(),
    getAllReadingLogs(),
  ]);

  const books = booksRes.success ? booksRes.books : [];
  const readingLogs = logsRes?.success ? logsRes.logs : [];

  return <ArchiveClient books={books} readingLogs={readingLogs} />;
}