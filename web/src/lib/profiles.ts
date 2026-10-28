import "server-only";
import { redirect } from "next/navigation";
import { api, ApiError } from "./api";
import type { BirthProfile, ChartKind, LuanGiaiMap, StoredChart } from "./types";

export const listProfiles = async () => (await api<{ items: BirthProfile[] }>("/api/ho-so")).items;

export async function getProfile(id: string): Promise<BirthProfile | null> {
  if (!/^\d+$/.test(id)) return null;
  try {
    return await api<BirthProfile>(`/api/ho-so/${id}`);
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null; // hồ sơ của người khác coi như không có (BR7)
    throw e;
  }
}

/**
 * Hồ sơ đang xem: hồ sơ được chọn trên link nếu là của mình, không thì hồ sơ chính (BR13).
 * Chưa có hồ sơ nào thì chuyển sang form tạo hồ sơ (BR16).
 */
export async function resolveViewedProfile(requestedId?: string) {
  const all = await listProfiles();
  if (all.length === 0) redirect("/ho-so/moi");
  const viewed = all.find((p) => String(p.id) === requestedId) ?? all.find((p) => p.isPrimary) ?? all[0];
  return { viewed, all };
}

const SLUG: Record<ChartKind, string> = { tu_vi: "tu-vi", than_so_hoc: "than-so-hoc", chiem_tinh: "chiem-tinh" };

/** Lá số đã lưu kèm các dòng luận giải khớp với lá số (soạn trên dashboard). */
export async function getChart(profileId: number, kind: ChartKind) {
  try {
    return await api<{ chart: StoredChart; luanGiai: LuanGiaiMap }>(`/api/ho-so/${profileId}/la-so/${SLUG[kind]}`);
  } catch (e) {
    if (e instanceof ApiError && e.status >= 500) return null;
    throw e;
  }
}

export const chartSlug = (kind: ChartKind) => SLUG[kind];
