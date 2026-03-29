"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function getPresignedUrl(fileName: string, contentType: string) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_DOMAIN } = env;

    if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
      return { success: false, error: "R2 环境变量缺失" };
    }

    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID as string,
        secretAccessKey: R2_SECRET_ACCESS_KEY as string,
      },
      forcePathStyle: true,
    });

    const safeFileName = fileName.replace(/\s+/g, '-');
    const uniqueFileName = `covers/${Date.now()}-${crypto.randomUUID().slice(0, 8)}-${safeFileName}`;

    const command = new PutObjectCommand({
      Bucket: R2_BUCKET_NAME as string,
      Key: uniqueFileName,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(S3, command, { expiresIn: 300 });
    return { success: true, uploadUrl, finalUrl: `${R2_PUBLIC_DOMAIN}/${uniqueFileName}` };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}