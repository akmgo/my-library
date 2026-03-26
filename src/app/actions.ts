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
export async function uploadCoverToR2(formData: FormData) {
  try {
    const file = formData.get("file") as File;
    if (!file) return { success: false, error: "未接收到图片文件" };

    const { env } = await getCloudflareContext({ async: true });
    const bucket = env.COVER_BUCKET as any;

    if (!bucket) throw new Error("R2 存储桶未绑定");

    const fileExtension = file.name.split('.').pop(); 
    const fileName = `covers/${crypto.randomUUID()}.${fileExtension}`;
    const arrayBuffer = await file.arrayBuffer();

    await bucket.put(fileName, arrayBuffer, {
      httpMetadata: { contentType: file.type },
    });

    // 替换为你的真实公开域名
    const publicDomain = "https://pub-55956733fff54a6b9e1d921def1c7805.r2.dev"; 
    return { success: true, coverUrl: `${publicDomain}/${fileName}` };
  } catch (error: any) {
    console.error("上传封面失败:", error);
    return { success: false, error: error.message };
  }
}

/**
 * [方案 B] 客户端直传：获取 AWS S3 预签名 URL
 */
export async function getPresignedUrl(fileName: string, contentType: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    
    const accountId = (env.R2_ACCOUNT_ID || "").trim();
    const accessKeyId = (env.R2_ACCESS_KEY_ID || "").trim();
    const secretAccessKey = (env.R2_SECRET_ACCESS_KEY || "").trim();
    const bucketName = (env.R2_BUCKET_NAME || "").trim();
    const publicDomain = (env.R2_PUBLIC_DOMAIN || "").trim();

    if (!accountId || !accessKeyId || !secretAccessKey) {
      throw new Error(`缺少 S3 环境变量配置！`);
    }

    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 });

    return { success: true, uploadUrl, finalUrl: `${publicDomain}/${uniqueFileName}` };
  } catch (error: any) {
    console.error("生成凭证致命错误:", error);
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