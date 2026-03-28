// migrate_covers.mjs
import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'; // ✨ 新增引入
import dotenv from 'dotenv';

// 1. 加载环境变量
if (fs.existsSync('.dev.vars')) {
  dotenv.config({ path: '.dev.vars' });
} else {
  dotenv.config({ path: '.env.local' });
}

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID?.trim();
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID?.trim();
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY?.trim();
const BUCKET_NAME = process.env.R2_BUCKET_NAME?.trim();
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN?.trim();

if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
  console.error("❌ 环境变量缺失，请检查 .env.local 或 .dev.vars 文件");
  process.exit(1);
}

// 2. 初始化 R2 客户端 (仅用于生成签名，不发网络请求)
const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: ACCESS_KEY_ID,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

const COVERS_DIR = './vertical_covers';
const SQL_OUTPUT_FILE = './update_covers.sql';

const getMimeType = (ext) => {
  const map = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
};

async function main() {
  if (!fs.existsSync(COVERS_DIR)) {
    console.error(`❌ 找不到目录 ${COVERS_DIR}，请创建并放入图片`);
    process.exit(1);
  }

  const files = fs.readdirSync(COVERS_DIR);
  const sqlStatements = [];
  
  console.log(`🚀 发现 ${files.length} 个文件，准备开始签名并直传 R2...`);
  console.log(`📡 目标 Endpoint: https://${ACCOUNT_ID}.r2.cloudflarestorage.com`);

  for (const file of files) {
    if (file.startsWith('.')) continue;

    const filePath = path.join(COVERS_DIR, file);
    const ext = path.extname(file);
    const title = path.basename(file, ext);
    
    if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext.toLowerCase())) continue;

    const fileBuffer = fs.readFileSync(filePath);
    const mimeType = getMimeType(ext);
    
    // 生成安全的文件名
    const safeFileName = file.replace(/\s+/g, '-');
    const uniqueFileName = `covers/vertical/${Date.now()}-${crypto.randomUUID().slice(0, 6)}-${safeFileName}`;

    try {
      console.log(`⏳ 正在处理: [${title}] ...`);
      
      // ✨ 第一步：生成预签名直传链接 (纯本地计算，瞬间完成)
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: uniqueFileName,
        ContentType: mimeType,
      });
      const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 600 });

      // ✨ 第二步：使用 Node.js 原生 fetch 暴力直传 (绕开 AWS SDK 网络黑洞)
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: fileBuffer,
        headers: {
          "Content-Type": mimeType,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error(`HTTP 状态码异常: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const finalUrl = `${PUBLIC_DOMAIN}/${uniqueFileName}`;
      const safeTitle = title.replace(/'/g, "''"); // 防止 SQL 注入
      const sql = `UPDATE books SET verticalCoverUrl = '${finalUrl}' WHERE title = '${safeTitle}';`;
      
      sqlStatements.push(sql);
      console.log(`✅ 成功: [${title}]`);

    } catch (error) {
      console.error(`❌ 失败: [${title}] -`, error.message);
    }
  }

  // 3. 写入 SQL 文件
  if (sqlStatements.length > 0) {
    fs.writeFileSync(SQL_OUTPUT_FILE, sqlStatements.join('\n') + '\n');
    console.log(`\n🎉 全部处理完毕！已生成: ${SQL_OUTPUT_FILE}`);
    console.log(`👉 请运行: npx wrangler d1 execute <数据库名> --local --file=${SQL_OUTPUT_FILE}`);
  } else {
    console.log(`\n🤔 没有生成 SQL 语句，请检查。`);
  }
}

main();