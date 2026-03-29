"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getAllBooks } from "./books";

export async function getDashboardStats(params: { year: string; month: string; weekDates: string[] }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;
    const cacheKey = "dashboard_global_stats";

    if (kv) {
      const cached = await kv.get(cacheKey, "json");
      if (cached) return { success: true, ...cached };
    }

    const yearCountRes = await db.prepare("SELECT COUNT(*) as count FROM books WHERE status = 'FINISHED' AND endTime LIKE ?").bind(`${params.year}-%`).first();
    const monthDaysRes = await db.prepare("SELECT COUNT(DISTINCT date) as count FROM reading_logs WHERE date LIKE ?").bind(`${params.month}-%`).first();
    
    const placeholders = params.weekDates.map(() => "?").join(",");
    const weekLogsRes = await db.prepare(`SELECT DISTINCT date FROM reading_logs WHERE date IN (${placeholders})`).bind(...params.weekDates).all();

    const statsData = {
      yearReadCount: yearCountRes?.count || 0,
      monthReadDays: monthDaysRes?.count || 0,
      checkedInDates: weekLogsRes.results.map((r: any) => r.date),
    };

    if (kv) await kv.put(cacheKey, JSON.stringify(statsData));
    return { success: true, ...statsData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function recordTodayReading(dateStr: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;

    const existing = await db.prepare("SELECT id FROM reading_logs WHERE date = ?").bind(dateStr).first();
    if (existing) return { success: true, message: "今日已打卡" };

    const readingBook = await db.prepare("SELECT id FROM books WHERE status = 'READING' LIMIT 1").first();
    
    await db
      .prepare("INSERT INTO reading_logs (id, date, book_id, created_at) VALUES (?, ?, ?, ?)")
      .bind(crypto.randomUUID(), dateStr, readingBook?.id || null, new Date().toISOString())
      .run();

    if (kv) await kv.delete("dashboard_global_stats");  
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllReadingLogs() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

    const { results: logs } = await db.prepare("SELECT * FROM reading_logs ORDER BY date DESC").all();
    const booksRes = await getAllBooks();
    const allBooks = booksRes.success && booksRes.books ? booksRes.books : [];

    const bookDictionary = new Map();
    allBooks.forEach((book: any) => bookDictionary.set(book.id, book));

    const enrichedLogs = logs.map((log: any) => ({
      ...log,
      book: bookDictionary.get(log.book_id) || null
    }));

    return { success: true, logs: enrichedLogs };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}