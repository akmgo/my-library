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
    
    // ✨ 核心修复：把 createdAt 改成了 addedAt
    const { results } = await db.prepare("SELECT * FROM books ORDER BY addedAt DESC").all();
    
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
    const kv = env.LIBRARY_CACHE as any;
    const cacheKey = `book_detail_${id}`; // ✨ 为每本书生成独立缓存键

    // 1. 尝试命中缓存
    if (kv) {
      const cachedData = await kv.get(cacheKey, "json");
      if (cachedData) return { success: true, ...cachedData };
    }

    // 2. 缓存未命中，查数据库
    const book = await db.prepare("SELECT * FROM books WHERE id = ?").bind(id).first();
    if (!book) return { success: false, error: "未找到该书籍" };

    book.tags = JSON.parse(book.tags || "[]");

    const { results: excerpts } = await db
      .prepare("SELECT * FROM excerpts WHERE bookId = ? ORDER BY createdAt DESC")
      .bind(id)
      .all();

    const responseData = { book, excerpts };

    // 3. 写入缓存
    if (kv) await kv.put(cacheKey, JSON.stringify(responseData));

    return { success: true, ...responseData };
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
    if (kv) await kv.delete(`book_detail_${id}`);
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
    
    if (kv) await kv.delete(`book_detail_${id}`);
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
    const kv = env.LIBRARY_CACHE as any;


    await db
      .prepare("INSERT INTO excerpts (id, bookId, content) VALUES (?, ?, ?)")
      .bind(id, bookId, content)
      .run();

    revalidatePath(`/books/${bookId}`);

    if (kv) await kv.delete(`book_detail_${bookId}`);

    return { success: true, id };
  } catch (error: any) {
    console.error("Failed to add excerpt:", error);
    return { success: false, error: error.message };
  }
}

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

// ============================================================================
// ☁️ 文件存储 (R2 Storage 直传凭证)
// ============================================================================

export async function getPresignedUrl(fileName: string, contentType: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    
    // 提取环境变量，防止爆红
    const accountId = env.R2_ACCOUNT_ID;
    const accessKeyId = env.R2_ACCESS_KEY_ID;
    const secretAccessKey = env.R2_SECRET_ACCESS_KEY;
    const bucketName = env.R2_BUCKET_NAME;
    const publicDomain = env.R2_PUBLIC_DOMAIN;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      return { success: false, error: "R2 环境变量缺失，请检查 Cloudflare 后台配置" };
    }

    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId as string,
        secretAccessKey: secretAccessKey as string,
      },
      // 🛡️ 救命装甲 1：强制路径模式！没有它，跨域和 DNS 必定报错！
      forcePathStyle: true,
    });

    // 🛡️ 救命装甲 2：加入 UUID 防止批量并发时毫秒级撞名！统一放进 covers/ 文件夹
    const safeFileName = fileName.replace(/\s+/g, '-');
    const uniqueFileName = `covers/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: bucketName as string,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    // 签发 5 分钟有效期的临时上传链接
    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 });
    const finalUrl = `${publicDomain}/${uniqueFileName}`;

    return { success: true, uploadUrl, finalUrl };
  } catch (error: any) {
    console.error("生成上传凭证失败:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 📊 获取仪表盘统计数据 (带 KV 缓存提速)
// ============================================================================
export async function getDashboardStats(params: {
  year: string;       
  month: string;      
  weekDates: string[]; 
}) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;
    const cacheKey = "dashboard_global_stats"; // ✨ 仪表盘全局缓存键

    // 1. 先尝试从 KV 缓存拿数据 (秒开体验)
    if (kv) {
      const cached = await kv.get(cacheKey, "json");
      if (cached) return { success: true, ...cached };
    }

    if (!db) throw new Error("数据库连接失败");

    // 2. 如果没有缓存，则执行真实的数据库查询
    const yearCountRes = await db
      .prepare("SELECT COUNT(*) as count FROM books WHERE status = 'FINISHED' AND endTime LIKE ?")
      .bind(`${params.year}-%`)
      .first();

    const monthDaysRes = await db
      .prepare("SELECT COUNT(DISTINCT date) as count FROM reading_logs WHERE date LIKE ?")
      .bind(`${params.month}-%`)
      .first();

    const placeholders = params.weekDates.map(() => "?").join(",");
    const weekLogsRes = await db
      .prepare(`SELECT DISTINCT date FROM reading_logs WHERE date IN (${placeholders})`)
      .bind(...params.weekDates)
      .all();

    const checkedInDates = weekLogsRes.results.map((r: any) => r.date);

    // 3. 组装返回数据
    const statsData = {
      yearReadCount: yearCountRes?.count || 0,
      monthReadDays: monthDaysRes?.count || 0,
      checkedInDates: checkedInDates,
    };

    // 4. 将查到的最新数据写入 KV 缓存，下次直接秒开
    if (kv) {
      await kv.put(cacheKey, JSON.stringify(statsData));
    }

    return { success: true, ...statsData };
  } catch (error: any) {
    console.error("获取仪表盘数据失败:", error);
    return { success: false, error: error.message };
  }
}

// ============================================================================
// ✍️ 写入打卡记录 (自动绑定当前在读的书籍)
// ============================================================================
export async function recordTodayReading(dateStr: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;

    // 1. 检查今天是否已经打过卡，防止重复
    const existing = await db
      .prepare("SELECT id FROM reading_logs WHERE date = ?")
      .bind(dateStr)
      .first();

    if (existing) {
      return { success: true, message: "今日已打卡" };
    }

    // ✨ 核心新增：去 books 表里寻找当前状态为 'READING' 的那本书
    // 因为你规定了同一时间只有一本，所以 LIMIT 1 就能精准命中
    const readingBook = await db
      .prepare("SELECT id FROM books WHERE status = 'READING' LIMIT 1")
      .first();

    // 如果当前有在读的书，提取它的 id；如果没有，则设为 null (防止断档报错)
    const currentBookId = readingBook ? readingBook.id : null;

    // 2. 生成打卡所需的数据
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();
    const kv = env.LIBRARY_CACHE as any;

    // 3. 真实写入数据库，把 book_id 一并存进去！
    await db
      .prepare("INSERT INTO reading_logs (id, date, book_id, created_at) VALUES (?, ?, ?, ?)")
      .bind(newId, dateStr, currentBookId, now)
      .run();

    if (kv) await kv.delete("dashboard_global_stats");  

    return { success: true };
  } catch (error: any) {
    console.error("打卡写入失败:", error);
    return { success: false, error: error.message };
  }
}