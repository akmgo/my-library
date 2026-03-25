import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 🛡️ 防火墙 1：只在本地开发时启动模拟环境
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  // 👇 把它挪到这里！它是顶级配置，不再是实验性功能了
  serverExternalPackages: ["sharp"],

  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", 
    },
  },
  
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-55956733fff54a6b9e1d921def1c7805.r2.dev",
      },
    ],
  },
};

export default nextConfig;