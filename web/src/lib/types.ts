// Kiểu dữ liệu API trả về (nguồn: api/src). Web chỉ hiển thị, không tính lá số.

export type ChartKind = "tu_vi" | "than_so_hoc" | "chiem_tinh";

export type BirthProfile = {
  id: number;
  userId: number;
  name: string;
  birthDate: string;
  birthTime: string | null;
  gender: "male" | "female";
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  isPrimary: boolean;
  createdAt: string;
};

export const MAX_PROFILES = 10;

export type LuanGiaiMap = Record<string, { tieuDe: string | null; noiDung: string }>;

export type StoredChart = {
  kind: ChartKind;
  status: "ok" | "skipped" | "error";
  data: unknown;
  houseSystem: string | null;
  calcVersion: number;
  computedAt: string;
  outdated: boolean;
};

export type Place = { id: number; name: string; region: string; country: string; latitude: number; longitude: number; timezone: string };
