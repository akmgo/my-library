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

// src/app/actions.ts

// ================= 8. 上传封面到 R2 存储桶 =================
export async function uploadCoverToR2(formData: FormData) {
  try {
    // 1. 从前端传来的 FormData 中提取文件对象
    const file = formData.get("file") as File;
    if (!file) {
      return { success: false, error: "未接收到图片文件" };
    }

    // 2. 获取 Cloudflare 上下文和 R2 桶实例
    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.COVER_BUCKET as any;

    if (!bucket) {
      throw new Error("R2 存储桶未绑定，请检查 wrangler.toml 和 env 类型");
    }

    // 3. 生成全球唯一的随机文件名 (防止同名图片互相覆盖)
    // 提取原文件的后缀名 (比如 .jpg, .png)
    const fileExtension = file.name.split('.').pop(); 
    const fileName = `covers/${crypto.randomUUID()}.${fileExtension}`;
    
    // 4. 将 File 对象转换为 R2 认识的 ArrayBuffer 数据流
    const arrayBuffer = await file.arrayBuffer();

    // 5. 【核心上传动作】：将数据流写入 R2
    await bucket.put(fileName, arrayBuffer, {
      httpMetadata: {
        contentType: file.type, // 告诉浏览器这是一张什么格式的图片，极其重要
      },
    });

    // 6. 拼接图片的公网访问链接
    // ⚠️ 注意：这里必须替换成你真实的 R2 公开域名！(见下方说明)
    const publicDomain = "https://pub-55956733fff54a6b9e1d921def1c7805.r2.dev"; 
    const coverUrl = `${publicDomain}/${fileName}`;

    return { success: true, coverUrl };
  } catch (error: any) {
    console.error("上传封面失败:", error);
    return { success: false, error: error.message };
  }
}