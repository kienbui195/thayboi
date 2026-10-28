import { computeAstrology, type AstrologyChart } from "./astrology.js";
import { computeNumerology, type NumerologyChart } from "./numerology.js";
import { computeTuVi, type TuViChart } from "./tuvi.js";

export type ChartKind = "tu_vi" | "than_so_hoc" | "chiem_tinh";
export const CHART_KINDS: ChartKind[] = ["tu_vi", "than_so_hoc", "chiem_tinh"];

/**
 * Phiên bản cách tính của từng môn (BR17). Đổi thư viện hay sửa cách tính một môn
 * thì PHẢI tăng số của môn đó, để lá số đã lưu hiện tag "Bản cũ".
 */
export const CALC_VERSION: Record<ChartKind, number> = {
  tu_vi: 1,
  than_so_hoc: 1,
  chiem_tinh: 1,
};

export type ChartData = {
  tu_vi: TuViChart;
  than_so_hoc: NumerologyChart;
  chiem_tinh: AstrologyChart;
};

export type BirthProfileInput = {
  name: string;
  birthDate: string;
  birthTime: string | null;
  gender: "male" | "female";
  latitude: number;
  longitude: number;
  timezone: string;
};

export type ChartResult =
  | { status: "ok"; data: unknown; houseSystem: string | null }
  | { status: "skipped"; data: null; houseSystem: null } // tử vi khi không rõ giờ (BR14)
  | { status: "error"; data: null; houseSystem: null; error: string };

export function computeChart(kind: ChartKind, p: BirthProfileInput): ChartResult {
  try {
    switch (kind) {
      case "than_so_hoc":
        return { status: "ok", data: computeNumerology(p.name, p.birthDate), houseSystem: null };
      case "tu_vi":
        if (p.birthTime === null) return { status: "skipped", data: null, houseSystem: null };
        return { status: "ok", data: computeTuVi(p), houseSystem: null };
      case "chiem_tinh": {
        const data = computeAstrology(p);
        return { status: "ok", data, houseSystem: data.houseSystem };
      }
    }
  } catch (e) {
    return { status: "error", data: null, houseSystem: null, error: e instanceof Error ? e.message : String(e) };
  }
}
