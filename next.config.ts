import type { NextConfig } from "next";
// 【加回来的核心代码】：引入 Cloudflare 本地开发环境初始化函数
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// 启动本地 Cloudflare 绑定的代理服务 (就是它解决了那个 C++ 报错)
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  images: {
	unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;