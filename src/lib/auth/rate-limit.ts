import "server-only";
import { and, count, eq, gte } from "drizzle-orm";
import { db } from "@/lib/db";
import { loginFailures } from "@/lib/db/schema";

export const MAX_FAILURES = 5;
export const WINDOW_MS = 15 * 60_000;

/** AC-01.5: đã sai 5 lần trong 15 phút thì chặn, kể cả lần này nhập đúng. */
export async function isLoginBlocked(email: string, now = Date.now()): Promise<boolean> {
  const row = await db
    .select({ n: count() })
    .from(loginFailures)
    .where(and(eq(loginFailures.email, email), gte(loginFailures.at, new Date(now - WINDOW_MS))))
    .get();
  return (row?.n ?? 0) >= MAX_FAILURES;
}

export async function recordLoginFailure(email: string) {
  await db.insert(loginFailures).values({ email, at: new Date() });
}

export async function clearLoginFailures(email: string) {
  await db.delete(loginFailures).where(eq(loginFailures.email, email));
}
