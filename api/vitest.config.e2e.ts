import { defineConfig } from 'vitest/config';

// Test e2e xóa sạch dữ liệu sau mỗi ca, nên chạy trên database riêng thayboi_test (MySQL dev: dev/compose.yaml).
export const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ?? 'mysql://root:dev@127.0.0.1:33063/thayboi_test';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: { DATABASE_URL: TEST_DATABASE_URL, NODE_ENV: 'test' },
    // Các file dùng chung một database và tự dọn dữ liệu của mình, nên chạy tuần tự.
    fileParallelism: false,
  },
});
