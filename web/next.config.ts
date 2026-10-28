import type { NextConfig } from "next";

const API_URL = process.env.API_URL ?? "http://127.0.0.1:3001";

const nextConfig: NextConfig = {
  // Ảnh Docker gọn: chỉ chép server tự chứa (.next/standalone)
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Trên VPS, Caddy chuyển /api/* thẳng sang Nest trước khi tới Next. Ở máy dev không có Caddy,
  // nên Next chuyển tiếp hộ để trình duyệt (ô tìm nơi sinh) gọi /api/* như trên VPS.
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
