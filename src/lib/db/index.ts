import "server-only";
import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL ?? "file:local.db",
  authToken: process.env.DATABASE_AUTH_TOKEN,
  // Chờ khóa khi tiến trình KHÁC đang ghi (vd. nhiều instance cùng một file DB)
  timeout: 5000,
});

// SQLite mặc định tắt khóa ngoại; bật để xóa hồ sơ thì xóa luôn lá số (AC-08.3)
void client.execute("PRAGMA foreign_keys = ON");

export const db = drizzle(client, { schema });

export type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];

let writeQueue: Promise<unknown> = Promise.resolve();

/**
 * Mọi giao dịch ghi đi qua đây, chạy lần lượt trong một tiến trình.
 * Driver SQLite chờ khóa kiểu đồng bộ: hai giao dịch ghi chen nhau trong cùng tiến trình sẽ
 * khóa chết (cái sau chặn event loop nên cái trước không commit được) rồi báo SQLITE_BUSY.
 * Xếp hàng thì hai tab cùng bấm "Đặt làm hồ sơ chính" sẽ ra đúng "cái sau thắng" (AC-08.2).
 */
export function writeTransaction<T>(fn: (tx: Tx) => Promise<T>): Promise<T> {
  const run = writeQueue.then(() => db.transaction(fn));
  writeQueue = run.catch(() => undefined);
  return run;
}
