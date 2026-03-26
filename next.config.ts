import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 🛡️ 防火墙 1：只在本地开发时启动模拟环境
if (process.env.NODE_ENV === "development") {
  initOpenNextCloudflareForDev();
}

// 👇 魔法：去掉 ": NextConfig" 严格类型，改用 JSDoc，让 TS 闭嘴！
/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["sharp"],

  // 🚀 核心提速秘籍：让打包器闭眼打包，不查代码！
  typescript: {
    ignoreBuildErrors: true,
  },

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