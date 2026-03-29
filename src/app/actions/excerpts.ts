"use server";

import { revalidatePath } from "next/cache";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function addExcerptToDB(bookId: string, content: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = env.library_db as any;
    const kv = env.LIBRARY_CACHE as any;
    const id = crypto.randomUUID();

    await db
      .prepare("INSERT INTO excerpts (id, bookId, content) VALUES (?, ?, ?)")
      .bind(id, bookId, content)
      .run();

    revalidatePath(`/books/${bookId}`);
    if (kv) await kv.delete(`book_detail_${bookId}`);

    return { success: true, id };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}