// src/app/actions.ts
"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { revalidatePath } from "next/cache";

// ================= 1. 录入新书 =================
export async function addBookToDB(formData: {
  title: string;
  author: string;
  coverUrl?: string;
}) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

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

    // 获取图书基本信息
    const book = await db
      .prepare("SELECT * FROM books WHERE id = ?")
      .bind(id)
      .first();
    if (!book) return { success: false, error: "未找到该书籍" };

    // 解析 JSON 格式的标签
    book.tags = JSON.parse(book.tags || "[]");

    // 获取关联的摘录，按时间倒序
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

    // 动态拼接 SQL SET 语句 (例如: "status = ?, rating = ?")
    const keys = Object.keys(updates);
    if (keys.length === 0) return { success: true }; // 没有要更新的字段

    const values = Object.values(updates);
    const setClause = keys.map((k) => `${k} = ?`).join(", ");

    await db
      .prepare(`UPDATE books SET ${setClause} WHERE id = ?`)
      .bind(...values, id)
      .run();

    // 强制刷新相关页面的缓存，确保下次访问是最新的
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

    // 刷新该书籍的详情页缓存，让摘录立刻显示
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
    // 使用免费、开源且国内可直连的 OpenLibrary API
    // limit=3 表示抓取前3条记录，增加命中率
    const response = await fetch(
      `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&limit=3`,
      { method: 'GET' }
    );
    
    if (!response.ok) throw new Error("网络请求失败");
    
    const data = await response.json() as any;
    
    if (data.docs && data.docs.length > 0) {
      // 在返回的结果中，找到第一条包含作者名字的数据
      const bookDoc = data.docs.find((doc: any) => doc.author_name && doc.author_name.length > 0);
      
      if (bookDoc) {
        // 提取作者名字（注意：部分中文书可能是拼音，如 "Yu Hua"）
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

// src/app/actions.ts

// src/app/actions.ts

export async function deleteBookFromDB(id: string) {
  try {
    // 【修正点】：统一使用 getCloudflareContext
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

    if (!db) {
      throw new Error("数据库连接失败");
    }
    
    // 1. 删除书籍记录
    await db.prepare("DELETE FROM books WHERE id = ?").bind(id).run();
    
    // 2. 同时删除该书关联的所有摘录
    await db.prepare("DELETE FROM excerpts WHERE bookId = ?").bind(id).run();
    
    // 3. 刷新首页缓存
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete error:", error);
    return { success: false, error: error.message || "删除失败" };
  }
}