// src/app/import/page.tsx
"use client";

import { useState } from "react";
// 🚨 注意这里：删除了 getPresignedUrl，换回了我们原汁原味的 uploadCoverImage
import { addBookToDB, updateBook, uploadCoverImage } from "../../app/actions";
import { Loader2 } from "lucide-react";

// 📚 已经为你完美解析和清洗过的 Notion 数据库
const NOTION_BOOKS: any[] = [
  { title: "论美国的民主", author: "托克维尔", status: "FINISHED", startTime: "2025-10-26", endTime: "2026-01-01", rating: 5, tags: ["人文", "政治", "社会学"] },
  { title: "万历十五年", author: "黄仁宇", status: "FINISHED", startTime: "2026-02-15", endTime: "2026-02-26", rating: 4, tags: ["传记", "历史", "政治"] },
  { title: "你当像鸟飞往你的山", author: "塔拉·韦斯特弗", status: "UNREAD" },
  { title: "理想国", author: "柏拉图", status: "FINISHED", startTime: "2025-12-13", endTime: "2026-01-01", rating: 4, tags: ["哲学", "思考", "政治"] },
  { title: "一个人的朝圣2：奎妮的情歌", author: "蕾秋·乔伊斯", status: "UNREAD" },
  { title: "明朝那些事儿", author: "当年明月", status: "FINISHED", startTime: "2025-04-12", endTime: "2026-01-01", rating: 5, tags: ["人文", "历史", "思考"] },
  { title: "娱乐至死", author: "尼尔·波兹曼", status: "UNREAD" },
  { title: "人类简史：从动物到上帝", author: "Yuval Noah Harari", status: "UNREAD" },
  { title: "一个人的朝圣", author: "蕾秋·乔伊斯", status: "FINISHED", startTime: "2017-04-06", endTime: "2026-01-01", rating: 3, tags: ["人文", "文学", "自我成长"] },
  { title: "月亮与六便士", author: "威廉·萨默赛特·毛姆", status: "FINISHED", startTime: "2020-10-05", endTime: "2026-01-01", rating: 5, tags: ["人文", "思考", "文学"] },
  { title: "乌合之众", author: "古斯塔夫·勒庞", status: "UNREAD" },
  { title: "二十四史", author: "《二十四史》编委会", status: "UNREAD" },
  { title: "忏悔录", author: "卢梭", status: "UNREAD" },
  { title: "贫穷的本质", author: "阿比吉特·班纳吉；埃斯特·迪弗洛", status: "FINISHED", startTime: "2025-02-07", endTime: "2026-01-01", rating: 4, tags: ["思考", "社会学", "经济学"] },
  { title: "第一性原理", author: "李善友", status: "UNREAD" },
  { title: "江城", author: "彼得·海斯勒", status: "UNREAD" },
  { title: "毛泽东选集", author: "毛泽东", status: "READING", startTime: "2026-03-03" },
  { title: "沉默的大多数", author: "王小波", status: "UNREAD" },
  { title: "奥德赛", author: "荷马", status: "UNREAD" },
  { title: "霍乱时期的爱情", author: "加西亚·马尔克斯", status: "FINISHED", startTime: "2026-01-03", endTime: "2026-01-08", rating: 5, tags: ["人文", "思考", "经典"] },
  { title: "三体", author: "刘慈欣", status: "UNREAD" },
  { title: "飘", author: "玛格丽特·米切尔", status: "UNREAD" },
  { title: "国富论", author: "亚当·斯密", status: "UNREAD" },
  { title: "追风筝的人", author: "卡勒德·胡赛尼", status: "UNREAD" },
  { title: "悉达多", author: "赫尔曼·黑塞", status: "UNREAD" },
  { title: "活着", author: "余华", status: "FINISHED", startTime: "2026-02-27", endTime: "2026-03-03", rating: 5, tags: ["人文", "文学", "自我成长"] },
  { title: "百年孤独", author: "加西亚·马尔克斯", status: "UNREAD" },
  { title: "杀死一只知更鸟", author: "哈珀·李", status: "FINISHED", startTime: "2026-01-26", endTime: "2026-02-14", rating: 4, tags: ["人文", "教育", "社会学"] },
  { title: "文明的冲突", author: "塞缪尔·P·亨廷顿", status: "UNREAD" },
  { title: "共产党宣言", author: "马克思；恩格斯", status: "UNREAD" },
  { title: "法律的悖论", author: "罗翔", status: "FINISHED", startTime: "2025-04-17", endTime: "2026-01-01", rating: 4, tags: ["人文", "哲学", "法律"] },
  { title: "朝花夕拾", author: "鲁迅", status: "UNREAD" },
  { title: "撒哈拉的故事", author: "三毛", status: "UNREAD" },
  { title: "挪威的森林", author: "村上春树", status: "UNREAD" },
  { title: "资本论", author: "卡尔·马克思", status: "UNREAD" },
  { title: "呐喊", author: "鲁迅", status: "UNREAD" },
  { title: "如何阅读一本书", author: "莫提默·J·艾德勒；查尔斯·范多伦；加西亚·马尔克斯", status: "FINISHED", startTime: "2025-09-18", endTime: "2026-01-01", rating: 3, tags: ["思考", "教育", "自我成长"] },
  { title: "局外人", author: "阿尔贝·加缪", status: "FINISHED", startTime: "2026-01-09", endTime: "2026-01-10", rating: 4, tags: ["人文", "思考", "社会学"] },
  { title: "人性的弱点", author: "戴尔·卡耐基", status: "UNREAD" },
  { title: "君主论", author: "马基雅维利", status: "UNREAD" },
  { title: "美的历程", author: "李泽厚", status: "UNREAD" },
  { title: "罪与罚", author: "陀思妥耶夫斯基", status: "FINISHED", startTime: "2025-06-12", endTime: "2026-01-01", rating: 4, tags: ["人文", "哲学", "文学"] },
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
    addLog(`🚀 开始采用原生服务端架构批量导入，共计 ${NOTION_BOOKS.length} 本书...`);

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

        // 如果没有匹配到图片，直接跳过这本书 (宁缺毋滥)
        if (!matchedFile) {
          addLog(`  -> ⏭️ ⚠️ 未匹配到封面图片，已跳过《${book.title}》的导入。\n`);
          continue; 
        }

        // ==========================================
        // 【核心修改】：回归经典的 FormData 传给 Server Action
        // ==========================================
        addLog(`  -> 找到封面 ${matchedFile.name}，正在打包发送至服务端...`);
        
        const uploadData = new FormData();
        uploadData.append("file", matchedFile);
        
        // 直接调用咱们原生精简版的后端上传函数！
        const uploadRes = await uploadCoverImage(uploadData);

        if (!uploadRes.success || !uploadRes.coverUrl) {
          addLog(`  -> ❌ 封面上传失败: ${uploadRes.error}，跳过入库。\n`);
          continue; 
        }

        finalCoverUrl = uploadRes.coverUrl;
        addLog(`  -> 封面通过后端上传成功，毫无压力！`);

        // 3. 写入 D1 数据库
        const dbRes = await addBookToDB({
          title: book.title,
          author: book.author,
          coverUrl: finalCoverUrl,
        });

        // 4. 同步 Notion 里的详细阅读记录
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
              addLog(`✅ 《${book.title}》 成功入库，并同步了额外记录！\n`);
            } else {
              addLog(`✅ 《${book.title}》 成功入库！\n`);
            }
          } else {
            addLog(`✅ 《${book.title}》 成功入库！(未获取到ID，跳过详情同步)\n`);
          }
        } else {
          addLog(`❌ 《${book.title}》 入库失败: ${dbRes.error}\n`);
        }

      } catch (err: any) {
        addLog(`❌ 处理 《${book.title}》 时发生异常: ${err.message}\n`);
      }
    }

    addLog("🎉 批量导入处理流程完毕！你可以去首页查看那堵完美的书墙了！");
    setIsImporting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 p-10 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">📦 Notion 批量导入控制台 (原生版)</h1>
      
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
          开始极速批量导入
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