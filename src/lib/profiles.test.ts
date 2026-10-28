import { eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/libsql/migrator";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import * as charts from "@/lib/charts";
import { db } from "@/lib/db";
import { birthProfiles, charts as chartsTable, users } from "@/lib/db/schema";
import type { ProfileInput } from "@/lib/profile-input";
import {
  createProfile,
  deleteProfile,
  getChart,
  getProfile,
  listProfiles,
  recomputeChart,
  resolveViewedProfile,
  setPrimaryProfile,
  updateProfile,
} from "./profiles";

vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const input = (name: string, over: Partial<ProfileInput> = {}): ProfileInput => ({
  name,
  birthDate: "1990-05-15",
  birthTime: "08:30",
  gender: "female",
  placeName: "Hà Nội",
  latitude: 21.02,
  longitude: 105.84,
  timezone: "Asia/Bangkok",
  ...over,
});

let userA: string;
let userB: string;

beforeAll(async () => {
  await migrate(db, { migrationsFolder: "drizzle" });
});

beforeEach(async () => {
  await db.delete(chartsTable);
  await db.delete(birthProfiles);
  await db.delete(users);
  userA = (await db.insert(users).values({ email: "a@t.vn", passwordHash: "x" }).returning().get()).id;
  userB = (await db.insert(users).values({ email: "b@t.vn", passwordHash: "x" }).returning().get()).id;
});

const primaryOf = async (userId: string) => (await listProfiles(userId)).filter((p) => p.isPrimary).map((p) => p.name);

describe("hồ sơ", () => {
  it("AC-02.1: hồ sơ đầu tiên là hồ sơ chính và có đủ 3 lá số", async () => {
    const r = await createProfile(userA, input("Tôi"));
    expect(r.ok).toBe(true);
    expect(await primaryOf(userA)).toEqual(["Tôi"]);
    const rows = await db.select().from(chartsTable).where(eq(chartsTable.profileId, r.id!)).all();
    expect(rows.map((c) => `${c.kind}:${c.status}`).sort()).toEqual(["chiem_tinh:ok", "than_so_hoc:ok", "tu_vi:ok"]);
  });

  it("AC-02.8: thêm được cái thứ 10, cái thứ 11 bị từ chối", async () => {
    for (let i = 1; i <= 10; i++) expect((await createProfile(userA, input(`H${i}`))).ok).toBe(true);
    expect(await createProfile(userA, input("H11"))).toEqual({ ok: false, error: "Mỗi tài khoản tối đa 10 hồ sơ" });
  });

  it("AC-02.5: sửa giờ sinh thì lá số tử vi và chiêm tinh được tính lại", async () => {
    const { id } = await createProfile(userA, input("Tôi"));
    const before = await db.select().from(chartsTable).where(eq(chartsTable.profileId, id!)).all();
    await updateProfile(userA, id!, input("Tôi", { birthTime: "20:15" }));
    const after = await db.select().from(chartsTable).where(eq(chartsTable.profileId, id!)).all();
    const data = (rows: typeof before, kind: string) => JSON.stringify(rows.find((c) => c.kind === kind)!.data);
    expect(data(after, "tu_vi")).not.toBe(data(before, "tu_vi"));
    expect(data(after, "chiem_tinh")).not.toBe(data(before, "chiem_tinh"));
    expect(data(after, "than_so_hoc")).toBe(data(before, "than_so_hoc"));
  });

  it("AC-03.2: chưa có hồ sơ thì chuyển sang form tạo hồ sơ", async () => {
    await expect(resolveViewedProfile(userA)).rejects.toThrow("REDIRECT /ho-so/moi");
  });

  it("AC-03.3: xem hồ sơ khác qua link không đổi hồ sơ chính", async () => {
    await createProfile(userA, input("Tôi"));
    const { id: me } = await createProfile(userA, input("Mẹ"));
    expect((await resolveViewedProfile(userA, me)).viewed.name).toBe("Mẹ");
    expect((await resolveViewedProfile(userA)).viewed.name).toBe("Tôi");
  });

  it("AC-07.1: không đọc, sửa, xóa, đặt chính được hồ sơ của người khác", async () => {
    const { id: bId } = await createProfile(userB, input("Của B"));
    await createProfile(userB, input("B2"));
    await createProfile(userA, input("Của A"));
    expect(await getProfile(userA, bId!)).toBeUndefined();
    expect((await resolveViewedProfile(userA, bId)).viewed.name).toBe("Của A");
    expect((await updateProfile(userA, bId!, input("Hack"))).ok).toBe(false);
    expect((await setPrimaryProfile(userA, bId!)).ok).toBe(false);
    expect((await deleteProfile(userA, bId!)).ok).toBe(false);
    expect((await recomputeChart(userA, bId!, "tu_vi")).ok).toBe(false);
    expect((await getProfile(userB, bId!))?.name).toBe("Của B");
  });

  it("AC-08.1/08.2: đổi hồ sơ chính, bấm liên tiếp vẫn chỉ một hồ sơ chính (cái sau thắng)", async () => {
    await createProfile(userA, input("Tôi"));
    const { id: me } = await createProfile(userA, input("Mẹ"));
    const { id: bo } = await createProfile(userA, input("Bố"));
    await Promise.all([setPrimaryProfile(userA, me!), setPrimaryProfile(userA, bo!)]);
    const primaries = await primaryOf(userA);
    expect(primaries).toHaveLength(1);
    await setPrimaryProfile(userA, me!);
    expect(await primaryOf(userA)).toEqual(["Mẹ"]);
  });

  it("BR10: DB tự chặn hai hồ sơ chính", async () => {
    await createProfile(userA, input("Tôi"));
    await expect(
      db.insert(birthProfiles).values({ ...input("Lậu"), userId: userA, isPrimary: true }),
    ).rejects.toThrow();
  });

  it("AC-08.3/08.4/08.5: luật xóa hồ sơ", async () => {
    const { id: toi } = await createProfile(userA, input("Tôi"));
    expect(await deleteProfile(userA, toi!)).toEqual({ ok: false, error: "Cần giữ ít nhất một hồ sơ" });
    const { id: me } = await createProfile(userA, input("Mẹ"));
    expect(await deleteProfile(userA, toi!)).toEqual({
      ok: false,
      error: "Hãy đặt hồ sơ khác làm hồ sơ chính trước khi xóa",
    });
    expect((await deleteProfile(userA, me!)).ok).toBe(true);
    expect(await db.select().from(chartsTable).where(eq(chartsTable.profileId, me!)).all()).toEqual([]);
    const { id: me2 } = await createProfile(userA, input("Mẹ"));
    await setPrimaryProfile(userA, me2!);
    expect((await deleteProfile(userA, toi!)).ok).toBe(true);
  });
});

describe("lá số đã lưu", () => {
  it("AC-09.1: lá số phiên bản cũ có cờ outdated, tính lại thì hết", async () => {
    const { id } = await createProfile(userA, input("Tôi"));
    await db.update(chartsTable).set({ calcVersion: 0 }).where(eq(chartsTable.kind, "chiem_tinh"));
    const profile = (await getProfile(userA, id!))!;
    expect((await getChart(profile, "chiem_tinh"))!.outdated).toBe(true);
    expect((await getChart(profile, "tu_vi"))!.outdated).toBe(false);
    expect((await recomputeChart(userA, id!, "chiem_tinh")).ok).toBe(true);
    expect((await getChart(profile, "chiem_tinh"))!.outdated).toBe(false);
  });

  it("AC-09.2: tính lại bị lỗi thì giữ nguyên lá số cũ", async () => {
    const { id } = await createProfile(userA, input("Tôi"));
    await db.update(chartsTable).set({ calcVersion: 0 }).where(eq(chartsTable.kind, "chiem_tinh"));
    const spy = vi.spyOn(charts, "computeChart").mockReturnValue({ status: "error", data: null, houseSystem: null, error: "x" });
    expect(await recomputeChart(userA, id!, "chiem_tinh")).toEqual({ ok: false, error: "Chưa tính lại được, thử lại sau" });
    spy.mockRestore();
    const profile = (await getProfile(userA, id!))!;
    const c = (await getChart(profile, "chiem_tinh"))!;
    expect(c.status).toBe("ok");
    expect(c.outdated).toBe(true);
  });

  it("AC-02.7: lá số lưu bị lỗi thì mở ra sẽ tính lại", async () => {
    const { id } = await createProfile(userA, input("Tôi"));
    await db.update(chartsTable).set({ status: "error", data: null }).where(eq(chartsTable.kind, "chiem_tinh"));
    const profile = (await getProfile(userA, id!))!;
    const c = (await getChart(profile, "chiem_tinh"))!;
    expect(c.status).toBe("ok");
  });

  it("AC-02.6: không rõ giờ thì tử vi bỏ qua, 2 môn kia có lá số", async () => {
    const { id } = await createProfile(userA, input("Tôi", { birthTime: null }));
    const rows = await db.select().from(chartsTable).where(eq(chartsTable.profileId, id!)).all();
    expect(Object.fromEntries(rows.map((c) => [c.kind, c.status]))).toEqual({
      tu_vi: "skipped",
      than_so_hoc: "ok",
      chiem_tinh: "ok",
    });
  });
});
