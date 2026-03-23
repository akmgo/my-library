// src/app/actions.ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

// ================= 0. 【新增】获取所有书籍（带 KV 边缘缓存） =================
export async function getAllBooks() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any; // 获取绑定的 KV 实例
    
    const CACHE_KEY = "all_books_list";

    // 1. 【查缓存】：如果配置了 KV，先去缓存里找
    if (kv) {
      const cachedBooks = await kv.get(CACHE_KEY, "json");
      if (cachedBooks) {
        console.log("⚡️ 命中 KV 缓存，毫秒级返回！");
        return { success: true, books: cachedBooks };
      }
    }

    // 2. 【缓存未命中】：老老实实穿透到 D1 数据库查询
    console.log("🐌 缓存未命中，穿透到 D1 数据库查询...");
    if (!db) throw new Error("数据库连接失败");
    
    // 注意：如果在 schema.sql 中没有 addedAt 字段，可以改成 createdAt 或者干脆删掉 ORDER BY
    const { results } = await db.prepare("SELECT * FROM books ORDER BY createdAt DESC").all();
    
    const books = results.map((book: any) => ({
      ...book,
      tags: JSON.parse(book.tags || '[]')
    }));

    // 3. 【回写缓存】：把查到的最新数据塞进 KV，下次访问就快了
    if (kv) {
      await kv.put(CACHE_KEY, JSON.stringify(books));
      console.log("💾 最新数据已写入 KV 缓存");
    }

    return { success: true, books };
  } catch (error: any) {
    console.error("获取书籍失败:", error);
    return { success: false, error: error.message };
  }
}

// ================= 1. 录入新书 =================
export async function addBookToDB(formData: {
  title: string;
  author: string;
  coverUrl?: string;
}) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;

    if (!db) {
      throw new Error("数据库连接失败，请检查 env 配置");
    }

    const id = crypto.randomUUID();

    await db
      .prepare(
        "INSERT INTO books (id, title, author, coverUrl, status) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(
        id,
        formData.title,
        formData.author,
        formData.coverUrl || "",
        "UNREAD" // 默认待读
      )
      .run();

    // 【核心动作】：新增了书，立刻炸毁旧缓存！
    if (kv) {
      await kv.delete("all_books_list");
      console.log("💣 数据库已新增，首页旧缓存已销毁");
    }

    revalidatePath("/");
    return { success: true, id };
  } catch (error: any) {
    console.error("Failed to add book:", error);
    return { success: false, error: error.message };
  }
}

// ================= 2. 获取书籍详情与关联摘录 =================
export async function getBookDetail(id: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

    const book = await db
      .prepare("SELECT * FROM books WHERE id = ?")
      .bind(id)
      .first();
    if (!book) return { success: false, error: "未找到该书籍" };

    book.tags = JSON.parse(book.tags || "[]");

    const { results: excerpts } = await db
      .prepare(
        "SELECT * FROM excerpts WHERE bookId = ? ORDER BY createdAt DESC"
      )
      .bind(id)
      .all();

    return { success: true, book, excerpts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ================= 3. 无感自动保存：更新书籍信息 =================
export async function updateBook(id: string, updates: any) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;

    const keys = Object.keys(updates);
    if (keys.length === 0) return { success: true };

    const values = Object.values(updates);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");

    await db
      .prepare(`UPDATE books SET ${setClause} WHERE id = ?`)
      .bind(...values, id)
      .run();

    // 【核心动作】：状态改了，立刻炸毁旧缓存！
    if (kv) {
      await kv.delete("all_books_list");
      console.log("💣 书籍状态已更新，首页旧缓存已销毁");
    }

    revalidatePath(`/books/${id}`);
    revalidatePath(`/`);
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update book:", error);
    return { success: false, error: error.message };
  }
}

// ================= 4. 录入新摘录 =================
export async function addExcerptToDB(bookId: string, content: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const id = crypto.randomUUID();

    await db
      .prepare("INSERT INTO excerpts (id, bookId, content) VALUES (?, ?, ?)")
      .bind(id, bookId, content)
      .run();

    revalidatePath(`/books/${bookId}`);
    return { success: true, id };
  } catch (error: any) {
    console.error("Failed to add excerpt:", error);
    return { success: false, error: error.message };
  }
}

// ================= 5. 联网抓取书籍基本信息 (OpenLibrary 直连版) =================
export async function searchBookByTitle(title: string) {
  try {
    const response = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=3`,
      { method: 'GET' }
    );
    
    if (!response.ok) throw new Error("网络请求失败");
    
    const data = await response.json() as any;
    
    if (data.docs && data.docs.length > 0) {
      const bookDoc = data.docs.find((doc: any) => doc.author_name && doc.author_name.length > 0);
      
      if (bookDoc) {
        const author = bookDoc.author_name.join(", ");
        return { success: true, book: { author } };
      }
    }
    
    return { success: false, error: "开源书库未找到该书的作者信息" };
  } catch (error: any) {
    console.error("搜索失败:", error);
    return { success: false, error: "书库接口暂时不可用，请检查网络" };
  }
}

// ================= 6. 删除书籍 =================
export async function deleteBookFromDB(id: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;

    if (!db) {
      throw new Error("数据库连接失败");
    }
    
    await db.prepare("DELETE FROM books WHERE id = ?").bind(id).run();
    await db.prepare("DELETE FROM excerpts WHERE bookId = ?").bind(id).run();
    
    // 【核心动作】：删除了书，立刻炸毁旧缓存！
    if (kv) {
      await kv.delete("all_books_list");
      console.log("💣 书籍已被删除，首页旧缓存已销毁");
    }

    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete error:", error);
    return { success: false, error: error.message || "删除失败" };
  }
}