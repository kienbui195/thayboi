import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

// Mỗi lần chạy test dùng một file SQLite mới, migrate trong beforeAll của test
process.env.DATABASE_URL = `file:${join(mkdtempSync(join(tmpdir(), "thayboi-")), "test.db")}`;
