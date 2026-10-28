import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // server-only chặn import ngoài React Server; test chạy thẳng trên Node nên thay bằng module rỗng
      "server-only": path.resolve(__dirname, "src/test/empty.ts"),
    },
  },
  test: { environment: "node", setupFiles: ["src/test/db-setup.ts"] },
});
