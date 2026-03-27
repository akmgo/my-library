// src/app/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// 缓存键名常量，防止拼写错误
const CACHE_KEY_ALL_BOOKS = "all_books_list";

// ============================================================================
// 📚 书籍管理 (Books Management)
// ============================================================================

/**
 * 获取所有书籍（带 KV 边缘缓存）
 */
export async function getAllBooks() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any; 
    
    // 1. 尝试命中 KV 缓存
    if (kv) {
      const cachedBooks = await kv.get(CACHE_KEY_ALL_BOOKS, "json");
      if (cachedBooks) {
        return { success: true, books: cachedBooks };
      }
    }

    if (!db) throw new Error("数据库连接失败");
    
    // 2. 缓存未命中，穿透查询 D1
    const { results } = await db.prepare("SELECT * FROM books ORDER BY createdAt DESC").all();
    
    const books = results.map((book: any) => ({
      ...book,
      tags: JSON.parse(book.tags || '[]')
    }));

    // 3. 回写 KV 缓存
    if (kv) {
      await kv.put(CACHE_KEY_ALL_BOOKS, JSON.stringify(books));
    }

    return { success: true, books };
  } catch (error: any) {
    console.error("获取书籍失败:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 获取单本书籍详情与关联摘录
 */
export async function getBookDetail(id: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

    const book = await db.prepare("SELECT * FROM books WHERE id = ?").bind(id).first();
    if (!book) return { success: false, error: "未找到该书籍" };

    book.tags = JSON.parse(book.tags || "[]");

    const { results: excerpts } = await db
      .prepare("SELECT * FROM excerpts WHERE bookId = ? ORDER BY createdAt DESC")
      .bind(id)
      .all();

    return { success: true, book, excerpts };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 录入新书
 */
export async function addBookToDB(formData: { title: string; author: string; coverUrl?: string; }) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;

    if (!db) throw new Error("数据库连接失败，请检查 env 配置");

    const id = crypto.randomUUID();

    await db
      .prepare("INSERT INTO books (id, title, author, coverUrl, status) VALUES (?, ?, ?, ?, ?)")
      .bind(id, formData.title, formData.author, formData.coverUrl || "", "UNREAD")
      .run();

    // 清理缓存并刷新页面
    if (kv) await kv.delete(CACHE_KEY_ALL_BOOKS);
    revalidatePath("/");
    
    return { success: true, id };
  } catch (error: any) {
    console.error("Failed to add book:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 动态更新书籍信息 (无感保存)
 */
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

    // 清理缓存并刷新关联页面
    if (kv) await kv.delete(CACHE_KEY_ALL_BOOKS);
    revalidatePath(`/books/${id}`);
    revalidatePath(`/`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Failed to update book:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 删除书籍及其关联摘录
 */
export async function deleteBookFromDB(id: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;

    if (!db) throw new Error("数据库连接失败");
    
    // 开启删除事务
    await db.prepare("DELETE FROM books WHERE id = ?").bind(id).run();
    await db.prepare("DELETE FROM excerpts WHERE bookId = ?").bind(id).run();
    
    if (kv) await kv.delete(CACHE_KEY_ALL_BOOKS);
    revalidatePath("/");
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete error:", error);
    return { success: false, error: error.message || "删除失败" };
  }
}

// ============================================================================
// 📝 摘录管理 (Excerpts Management)
// ============================================================================

/**
 * 录入新摘录
 */
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

// ============================================================================
// ☁️ 文件存储 (R2 Storage)
// ============================================================================

/**
 * [方案 A] 纯服务端上传：通过 R2 绑定直接写入
 */
// ============================================================================
// 🚀 原生 R2 上传函数 (回归最初的实现！)
// ============================================================================
export async function uploadCoverImage(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file || file.size === 0) return { success: false, error: "未检测到文件" };

    // 1. 获取 Cloudflare 上下文
    let env: any = process.env;
    try {
      const ctx = await getCloudflareContext({ async: true });
      if (ctx && ctx.env) env = ctx.env;
    } catch (e) {}

    // 2. 直接使用原生的 COVER_BUCKET 绑定！没有任何 SDK！
    const bucket = env.COVER_BUCKET;
    const publicDomain = env.R2_PUBLIC_DOMAIN;

    if (!bucket) {
      return { success: false, error: "未找到 COVER_BUCKET 绑定！" };
    }

    // 3. 转换文件格式并生成文件名
    const arrayBuffer = await file.arrayBuffer();
    const ext = file.name.split('.').pop() || 'png';
    const safeFileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

    // 4. 原生 PUT 上传 (速度极快，无需跨域)
    await bucket.put(safeFileName, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    return { 
      success: true, 
      coverUrl: `${publicDomain}/${safeFileName}` 
    };

  } catch (error: any) {
    console.error("封面上传失败:", error);
    return { success: false, error: error.message };
  }
}


// ============================================================================
// 🌐 外部服务集成 (External APIs)
// ============================================================================

/**
 * 联网抓取书籍基本信息 (OpenLibrary)
 */
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
        return { success: true, book: { author: bookDoc.author_name.join(", ") } };
      }
    }
    
    return { success: false, error: "开源书库未找到该书的作者信息" };
  } catch (error: any) {
    console.error("搜索失败:", error);
    return { success: false, error: "书库接口暂时不可用" };
  }
}

// 新增这个向 R2 拿临时上传 URL 的方法
export async function getPresignedUrl(fileName: string, contentType: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    // 这里的 env.R2_ACCOUNT_ID 等，就会自动读取你刚才在线上填的那些环境变量啦！
    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID as string,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY as string,
      },
    });

    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME as string,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 });
    const finalUrl = `${env.R2_PUBLIC_DOMAIN}/${uniqueFileName}`;

    return { success: true, uploadUrl, finalUrl };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}