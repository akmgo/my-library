// src/app/import/page.tsx
"use client";

import { useState } from "react";
// 🚨 确保你引入的是 getPresignedUrl！
import { addBookToDB, updateBook, getPresignedUrl } from "../../app/actions";
import { Loader2 } from "lucide-react";

// 📚 Notion 数据保持不变
const NOTION_BOOKS: any[] = [
  // ... (为了排版简洁，这里省略你原来的几十本书的数据，你粘贴时保留你原来的 NOTION_BOOKS 数组即可)
  { title: "艺术的故事", author: "恩斯特·贡布里希", status: "FINISHED", startTime: "2026-01-11", endTime: "2026-01-25", rating: 4, tags: ["历史", "科普", "艺术"] },
  { title: "茶花女", author: "小亚历山大·仲马", status: "UNREAD" }
];

export default function BulkImportPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const addLog = (msg: string) => {
    setLogs((prev) => [...prev, msg]);
  };

  const handleImport = async () => {
    if (files.length === 0) {
      alert("请先选择那几十张本地封面图片！");
      return;
    }

    setIsImporting(true);
    addLog(`🚀 开始采用 R2 凭证直传架构批量导入，共计 ${NOTION_BOOKS.length} 本书...`);

    for (const book of NOTION_BOOKS) {
      try {
        addLog(`⏳ 正在处理: 《${book.title}》...`);
        let finalCoverUrl = "";

        // 1. 自动匹配图片
        const matchedFile = Array.from(files).find((f) => {
          const cleanFileName = f.name
            .replace(/（横）/g, '') 
            .replace(/\(横\)/g, '')   
            .replace(/\.[^/.]+$/, ""); 

          return cleanFileName === book.title;
        });

        if (!matchedFile) {
          addLog(`  -> ⏭️ ⚠️ 未匹配到封面图片，已跳过。\n`);
          continue; 
        }

        // ==========================================
        // 🚀 真·R2 凭证直传核心逻辑
        // ==========================================
        addLog(`  -> 找到封面，正在向服务端申请直传凭证...`);
        const presignRes = await getPresignedUrl(matchedFile.name, matchedFile.type);
        
        if (!presignRes.success || !presignRes.uploadUrl) {
          addLog(`  -> ❌ 获取凭证失败: ${presignRes.error}\n`);
          continue; 
        }

        addLog(`  -> 凭证拿到！前端浏览器直连 R2 进行大文件 PUT 上传...`);
        const uploadResponse = await fetch(presignRes.uploadUrl, {
          method: "PUT",
          body: matchedFile,
          headers: {
            "Content-Type": matchedFile.type,
          },
        });

        if (!uploadResponse.ok) {
          throw new Error(`Cloudflare R2 状态码异常: ${uploadResponse.status}`);
        }

        finalCoverUrl = presignRes.finalUrl;
        addLog(`  -> 封面直传成功，服务器零压力！`);

        // ==========================================
        // 📝 写入数据库
        // ==========================================
        const dbRes = await addBookToDB({
          title: book.title,
          author: book.author,
          coverUrl: finalCoverUrl,
        });

        if (dbRes.success) {
          const newBookId = dbRes.id || dbRes.id;
          if (newBookId) {
            const updates: any = {};
            if (book.status && book.status !== "UNREAD") updates.status = book.status;
            if (book.startTime) updates.startTime = book.startTime;
            if (book.endTime) updates.endTime = book.endTime;
            if (book.rating) updates.rating = book.rating;
            if (book.tags) updates.tags = JSON.stringify(book.tags); 

            if (Object.keys(updates).length > 0) {
              await updateBook(newBookId, updates);
            }
          }
          addLog(`✅ 《${book.title}》 完美入库！\n`);
        } else {
          addLog(`❌ 《${book.title}》 数据库入库失败: ${dbRes.error}\n`);
        }

        // 🛡️ 批量防护伞：强制休眠 500 毫秒，保证队列顺滑，防止被云墙拦截！
        await new Promise((resolve) => setTimeout(resolve, 500));

      } catch (err: any) {
        addLog(`❌ 处理异常: ${err.message}\n`);
      }
    }

    addLog("🎉 批量 R2 直传处理流程完毕！去看看你的绝美书墙吧！");
    setIsImporting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">📦 Notion 批量导入控制台 (R2直传版)</h1>
      
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 mb-8 space-y-4 shadow-xl">
        <p>1. 请在此选择你要导入的 <b>{NOTION_BOOKS.length}</b> 本书的封面图片（框选全部即可）：</p>
        <input 
          type="file" 
          multiple 
          accept="image/*"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="block w-full text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-500/10 file:text-indigo-400 hover:file:bg-indigo-500/20 cursor-pointer"
        />
        <p className="text-sm text-slate-500">已选中 {files.length} 张图片</p>
        
        <button
          onClick={handleImport}
          disabled={isImporting || files.length === 0}
          className="mt-4 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center shadow-lg"
        >
          {isImporting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
          开始极速 R2 直传
        </button>
      </div>

      <div className="bg-black p-6 rounded-xl border border-slate-800 font-mono text-sm h-[500px] overflow-y-auto shadow-inner">
        <h3 className="text-slate-500 mb-4 sticky top-0 bg-black pb-2 border-b border-slate-800">// 自动化执行日志</h3>
        {logs.map((log, i) => (
          <div key={i} className={`mb-1 whitespace-pre-wrap ${log.includes('❌') ? 'text-red-400' : log.includes('✅') ? 'text-green-400' : log.includes('⏭️') ? 'text-orange-400' : 'text-slate-300'}`}>
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}