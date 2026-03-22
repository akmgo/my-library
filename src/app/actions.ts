// src/app/actions.ts
'use server'; // 【极其重要】这行指令告诉 Next.js，这个文件里的所有函数只能在服务器端运行

import { revalidatePath } from 'next/cache';

// 定义接收前端传来的表单数据接口
interface AddBookPayload {
  title: string;
  author: string;
  coverUrl: string;
}

export async function addBookToDB(payload: AddBookPayload) {
  // 1. 获取 D1 数据库实例
  const db = process.env.library_db as any;
  if (!db) {
    throw new Error("数据库连接失败");
  }

  // 2. 生成一个唯一的主键 ID (原生支持的 UUID)
  const id = crypto.randomUUID();
  const status = 'UNREAD';
  const progress = 0;
  // 默认给新书打上一个标签
  const tags = JSON.stringify(['新入库']); 

  try {
    // 3. 执行安全的预编译 SQL 插入语句 (防止 SQL 注入)
    await db.prepare(
      "INSERT INTO books (id, title, author, coverUrl, status, progress, tags) VALUES (?, ?, ?, ?, ?, ?, ?)"
    )
    .bind(id, payload.title, payload.author, payload.coverUrl, status, progress, tags)
    .run();

    // 4. 【核心黑魔法】告诉 Next.js：数据库变了，请立刻清除 /books 页面的缓存并重新渲染！
    revalidatePath('/books');
    
    return { success: true };
  } catch (error) {
    console.error("插入数据库失败:", error);
    return { success: false, error: "保存失败，请稍后重试" };
  }
}