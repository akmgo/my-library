"use server";

import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const CACHE_KEY_ALL_BOOKS = "all_books_list";

export async function getAllBooks() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any; 
    
    if (kv) {
      const cachedBooks = await kv.get(CACHE_KEY_ALL_BOOKS, "json");
      if (cachedBooks) return { success: true, books: cachedBooks };
    }

    if (!db) throw new Error("数据库连接失败");
    
    const { results } = await db.prepare("SELECT * FROM books ORDER BY addedAt DESC").all();
    
    const books = results.map((book: any) => ({
      ...book,
      tags: JSON.parse(book.tags || '[]')
    }));

    if (kv) await kv.put(CACHE_KEY_ALL_BOOKS, JSON.stringify(books));

    return { success: true, books };
  } catch (error: any) {
    console.error("获取书籍失败:", error);
    return { success: false, error: error.message };
  }
}

export async function getBookDetail(id: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;
    const cacheKey = `book_detail_${id}`;

    if (kv) {
      const cachedData = await kv.get(cacheKey, "json");
      if (cachedData) return { success: true, ...cachedData };
    }

    const book = await db.prepare("SELECT * FROM books WHERE id = ?").bind(id).first();
    if (!book) return { success: false, error: "未找到该书籍" };

    book.tags = JSON.parse(book.tags || "[]");

    const { results: excerpts } = await db
      .prepare("SELECT * FROM excerpts WHERE bookId = ? ORDER BY createdAt DESC")
      .bind(id)
      .all();

    const responseData = { book, excerpts };

    if (kv) await kv.put(cacheKey, JSON.stringify(responseData));

    return { success: true, ...responseData };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function addBookToDB(formData: { 
  title: string; 
  author: string; 
  coverUrl?: string; 
  verticalCoverUrl?: string;
}) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;

    if (!db) throw new Error("数据库连接失败");
    const id = crypto.randomUUID();

    await db
      .prepare("INSERT INTO books (id, title, author, coverUrl, status) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(id, formData.title, formData.author, formData.coverUrl || "", "UNREAD")
      .run();

    if (kv) await kv.delete(CACHE_KEY_ALL_BOOKS);
    revalidatePath("/");
    
    return { success: true, id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateBook(id: string, updates: Record<string, any>) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;

    const keys = Object.keys(updates);
    if (keys.length === 0) return { success: true };

    const values = Object.values(updates);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");

    await db.prepare(`UPDATE books SET ${setClause} WHERE id = ?`).bind(...values, id).run();

    if (kv) await kv.delete(`book_detail_${id}`);
    if (kv) await kv.delete(CACHE_KEY_ALL_BOOKS);
    revalidatePath(`/books/${id}`);
    revalidatePath(`/`);
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteBookFromDB(id: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;

    await db.prepare("DELETE FROM books WHERE id = ?").bind(id).run();
    await db.prepare("DELETE FROM excerpts WHERE bookId = ?").bind(id).run();
    
    if (kv) await kv.delete(`book_detail_${id}`);
    if (kv) await kv.delete(CACHE_KEY_ALL_BOOKS);
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function searchBookByTitle(title: string) {
  try {
    const response = await fetch(`https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=3`);
    if (!response.ok) throw new Error("网络请求失败");
    
    const data = await response.json() as any;
    if (data.docs && data.docs.length > 0) {
      const bookDoc = data.docs.find((doc: any) => doc.author_name && doc.author_name.length > 0);
      if (bookDoc) return { success: true, book: { author: bookDoc.author_name.join(", ") } };
    }
    return { success: false, error: "未找到作者信息" };
  } catch (error: any) {
    return { success: false, error: "书库接口不可用" };
  }
}