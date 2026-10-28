import "server-only";
import { and, asc, count, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CALC_VERSION, CHART_KINDS, computeChart, type ChartKind, type ChartResult } from "@/lib/charts";
import { db, writeTransaction, type Tx } from "@/lib/db";
import { birthProfiles, charts, type BirthProfile, type Chart } from "@/lib/db/schema";
import { MAX_PROFILES, type ProfileInput } from "@/lib/profile-input";

export type Result = { ok: true } | { ok: false; error: string };

// Mọi hàm đọc/ghi đều lọc theo userId: hồ sơ của người khác coi như không tồn tại (BR7).

export function listProfiles(userId: string) {
  return db
    .select()
    .from(birthProfiles)
    .where(eq(birthProfiles.userId, userId))
    .orderBy(asc(birthProfiles.createdAt))
    .all();
}

export function getProfile(userId: string, id: string) {
  return db
    .select()
    .from(birthProfiles)
    .where(and(eq(birthProfiles.id, id), eq(birthProfiles.userId, userId)))
    .get();
}

/**
 * Hồ sơ đang xem: hồ sơ được chọn trên link nếu là của mình, không thì hồ sơ chính (BR13).
 * Chưa có hồ sơ nào thì chuyển sang form tạo hồ sơ (BR16).
 */
export async function resolveViewedProfile(userId: string, requestedId?: string) {
  const all = await listProfiles(userId);
  if (all.length === 0) redirect("/ho-so/moi");
  const viewed = all.find((p) => p.id === requestedId) ?? all.find((p) => p.isPrimary) ?? all[0];
  return { viewed, all };
}

async function writeChart(tx: Tx, profileId: string, kind: ChartKind, r: ChartResult) {
  const row = {
    status: r.status,
    data: r.data,
    houseSystem: r.houseSystem,
    calcVersion: CALC_VERSION[kind],
    computedAt: new Date(),
  };
  await tx
    .insert(charts)
    .values({ profileId, kind, ...row })
    .onConflictDoUpdate({ target: [charts.profileId, charts.kind], set: row });
}

async function saveCharts(tx: Tx, profile: BirthProfile, kinds: ChartKind[] = CHART_KINDS) {
  for (const kind of kinds) await writeChart(tx, profile.id, kind, computeChart(kind, profile));
}

/** BR8, BR10, BR12: hồ sơ đầu tiên tự thành hồ sơ chính; lưu xong là có 3 lá số. */
export async function createProfile(userId: string, input: ProfileInput): Promise<Result & { id?: string }> {
  return writeTransaction(async (tx) => {
    const n = (await tx.select({ n: count() }).from(birthProfiles).where(eq(birthProfiles.userId, userId)).get())?.n ?? 0;
    if (n >= MAX_PROFILES) return { ok: false, error: `Mỗi tài khoản tối đa ${MAX_PROFILES} hồ sơ` };
    const profile = await tx
      .insert(birthProfiles)
      .values({ ...input, userId, isPrimary: n === 0 })
      .returning()
      .get();
    await saveCharts(tx, profile);
    return { ok: true, id: profile.id };
  });
}

/** BR8: sửa hồ sơ thì tính lại và lưu đè cả 3 lá số. */
export async function updateProfile(userId: string, id: string, input: ProfileInput): Promise<Result> {
  return writeTransaction(async (tx) => {
    const profile = await tx
      .update(birthProfiles)
      .set(input)
      .where(and(eq(birthProfiles.id, id), eq(birthProfiles.userId, userId)))
      .returning()
      .get();
    if (!profile) return { ok: false, error: "Không tìm thấy hồ sơ" };
    await saveCharts(tx, profile);
    return { ok: true };
  });
}

/** BR11: không xóa hồ sơ chính, không xóa hồ sơ cuối cùng. */
export async function deleteProfile(userId: string, id: string): Promise<Result> {
  return writeTransaction(async (tx) => {
    const all = await tx.select().from(birthProfiles).where(eq(birthProfiles.userId, userId)).all();
    const target = all.find((p) => p.id === id);
    if (!target) return { ok: false, error: "Không tìm thấy hồ sơ" };
    if (all.length === 1) return { ok: false, error: "Cần giữ ít nhất một hồ sơ" };
    if (target.isPrimary) return { ok: false, error: "Hãy đặt hồ sơ khác làm hồ sơ chính trước khi xóa" };
    await tx.delete(charts).where(eq(charts.profileId, id));
    await tx.delete(birthProfiles).where(eq(birthProfiles.id, id));
    return { ok: true };
  });
}

/** BR10: bỏ dấu chính cũ rồi đặt dấu mới trong một giao dịch; hai yêu cầu cùng lúc thì cái ghi sau thắng. */
export async function setPrimaryProfile(userId: string, id: string): Promise<Result> {
  return writeTransaction(async (tx) => {
    const target = await tx
      .select({ id: birthProfiles.id })
      .from(birthProfiles)
      .where(and(eq(birthProfiles.id, id), eq(birthProfiles.userId, userId)))
      .get();
    if (!target) return { ok: false, error: "Không tìm thấy hồ sơ" };
    await tx.update(birthProfiles).set({ isPrimary: false }).where(eq(birthProfiles.userId, userId));
    await tx.update(birthProfiles).set({ isPrimary: true }).where(eq(birthProfiles.id, id));
    return { ok: true };
  });
}

export type StoredChart = Chart & { outdated: boolean };

/**
 * Lá số đã lưu (BR8). Nếu lần lưu trước bị lỗi thì thử tính lại ngay (AC-02.7).
 * `outdated` = tính bằng cách cũ, cần tag "Bản cũ" (BR17).
 */
export async function getChart(profile: BirthProfile, kind: ChartKind): Promise<StoredChart | null> {
  const find = () =>
    db.select().from(charts).where(and(eq(charts.profileId, profile.id), eq(charts.kind, kind))).get();
  let chart = await find();
  if (!chart || chart.status === "error") {
    await writeTransaction((tx) => saveCharts(tx, profile, [kind]));
    chart = await find();
  }
  return chart ? { ...chart, outdated: chart.calcVersion !== CALC_VERSION[kind] } : null;
}

/** Nút "Tính lại" (BR17). Tính lỗi thì giữ nguyên lá số cũ (AC-09.2). */
export async function recomputeChart(userId: string, profileId: string, kind: ChartKind): Promise<Result> {
  const profile = await getProfile(userId, profileId);
  if (!profile) return { ok: false, error: "Không tìm thấy hồ sơ" };
  const r = computeChart(kind, profile);
  if (r.status === "error") return { ok: false, error: "Chưa tính lại được, thử lại sau" };
  await writeTransaction((tx) => writeChart(tx, profile.id, kind, r));
  return { ok: true };
}
