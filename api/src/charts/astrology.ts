import * as A from "astronomy-engine";
import { birthInstant, type BirthInput } from "./birth-time.js";

export const SIGNS = [
  "Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ",
  "Thiên Bình", "Bọ Cạp", "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư",
] as const;

const BODIES: { body: A.Body; name: string }[] = [
  { body: A.Body.Sun, name: "Mặt Trời" },
  { body: A.Body.Moon, name: "Mặt Trăng" },
  { body: A.Body.Mercury, name: "Sao Thủy" },
  { body: A.Body.Venus, name: "Sao Kim" },
  { body: A.Body.Mars, name: "Sao Hỏa" },
  { body: A.Body.Jupiter, name: "Sao Mộc" },
  { body: A.Body.Saturn, name: "Sao Thổ" },
  { body: A.Body.Uranus, name: "Sao Thiên Vương" },
  { body: A.Body.Neptune, name: "Sao Hải Vương" },
  { body: A.Body.Pluto, name: "Sao Diêm Vương" },
];

/** Trên vĩ độ này Placidus không tính được ổn định (BR15). */
export const PLACIDUS_MAX_LAT = 66;

export type Planet = {
  key: string;
  name: string;
  longitude: number;
  sign: number;
  degree: number;
  retrograde: boolean;
  house: number | null;
};

export type AstrologyChart = {
  utc: string;
  utcOffsetMinutes: number;
  planets: Planet[];
  // null khi không rõ giờ sinh (BR14)
  ascendant: number | null;
  midheaven: number | null;
  houses: number[] | null;
  houseSystem: "placidus" | "whole-sign" | null;
  note: string | null;
};

const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;
export const norm = (d: number) => ((d % 360) + 360) % 360;

export function signOf(longitude: number) {
  return { sign: Math.floor(norm(longitude) / 30), degree: norm(longitude) % 30 };
}

function eclipticLongitude(body: A.Body, date: Date): number {
  if (body === A.Body.Moon) return A.EclipticGeoMoon(date).lon;
  return A.Ecliptic(A.GeoVector(body, date, true)).elon;
}

/** Kinh độ hoàng đạo của điểm trên hoàng đạo có xích kinh `ra` (độ). */
function raToLongitude(ra: number, eps: number): number {
  return norm(deg(Math.atan2(Math.sin(rad(ra)), Math.cos(rad(ra)) * Math.cos(rad(eps)))));
}

function declinationOf(longitude: number, eps: number): number {
  return deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(longitude))));
}

/** Bán cung ngày của một điểm có xích vĩ `dec` ở vĩ độ `lat`; null nếu điểm không mọc/lặn. */
function diurnalSemiArc(dec: number, lat: number): number | null {
  const x = -Math.tan(rad(lat)) * Math.tan(rad(dec));
  if (x < -1 || x > 1) return null;
  return deg(Math.acos(x));
}

export function angles(ramc: number, lat: number, eps: number) {
  const mc = raToLongitude(ramc, eps);
  const asc = norm(
    deg(
      Math.atan2(
        Math.cos(rad(ramc)),
        -(Math.sin(rad(ramc)) * Math.cos(rad(eps)) + Math.tan(rad(lat)) * Math.sin(rad(eps))),
      ),
    ),
  );
  return { asc, mc };
}

/**
 * Placidus: chia ba khoảng thời gian một điểm đi từ chân trời lên thiên đỉnh (nhà 11, 12)
 * và từ thiên để lên chân trời (nhà 2, 3). Giải bằng lặp vì bán cung phụ thuộc chính điểm cần tìm.
 * Trả null khi có điểm không mọc/lặn (vùng gần cực).
 */
export function placidusCusps(ramc: number, lat: number, eps: number): number[] | null {
  const { asc, mc } = angles(ramc, lat, eps);
  const cusp = (fraction: number, below: boolean): number | null => {
    let lon = norm(mc + (below ? 90 : 0) + fraction * 90);
    for (let i = 0; i < 50; i++) {
      const dsa = diurnalSemiArc(declinationOf(lon, eps), lat);
      if (dsa === null) return null;
      const ra = below ? ramc + 180 - (1 - fraction) * (180 - dsa) : ramc + fraction * dsa;
      const next = raToLongitude(ra, eps);
      if (Math.abs(next - lon) < 1e-7) return next;
      lon = next;
    }
    return lon;
  };
  const c11 = cusp(1 / 3, false);
  const c12 = cusp(2 / 3, false);
  const c2 = cusp(1 / 3, true);
  const c3 = cusp(2 / 3, true);
  if (c11 === null || c12 === null || c2 === null || c3 === null) return null;
  const first = [asc, c2, c3, norm(mc + 180), norm(c11 + 180), norm(c12 + 180)];
  return [...first, ...first.map((c) => norm(c + 180))];
}

export function wholeSignCusps(asc: number): number[] {
  const start = Math.floor(asc / 30) * 30;
  return Array.from({ length: 12 }, (_, i) => norm(start + i * 30));
}

export function houseOf(longitude: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const start = cusps[i];
    const span = norm(cusps[(i + 1) % 12] - start);
    if (norm(longitude - start) < span) return i + 1;
  }
  return 12;
}

export function computeAstrology(input: BirthInput & { latitude: number; longitude: number }): AstrologyChart {
  const t = birthInstant(input);
  const date = t.toUTC().toJSDate();
  const later = new Date(date.getTime() + 3600_000);

  const planets: Planet[] = BODIES.map(({ body, name }) => {
    const lon = eclipticLongitude(body, date);
    const delta = norm(eclipticLongitude(body, later) - lon + 180) - 180;
    return { key: body, name, longitude: lon, ...signOf(lon), retrograde: delta < 0, house: null };
  });

  const base = { utc: t.toUTC().toISO()!, utcOffsetMinutes: t.offset, planets };
  if (input.birthTime === null) {
    return {
      ...base,
      ascendant: null,
      midheaven: null,
      houses: null,
      houseSystem: null,
      note: "Không rõ giờ sinh: tính lúc 12:00, không có cung Mọc và nhà.",
    };
  }

  const eps = A.e_tilt(A.MakeTime(date)).tobl;
  const ramc = norm(A.SiderealTime(date) * 15 + input.longitude);
  const { asc, mc } = angles(ramc, input.latitude, eps);

  let houses: number[] | null = null;
  let note: string | null = null;
  if (Math.abs(input.latitude) <= PLACIDUS_MAX_LAT) houses = placidusCusps(ramc, input.latitude, eps);
  const houseSystem = houses ? "placidus" : "whole-sign";
  if (!houses) {
    houses = wholeSignCusps(asc);
    note = "Nơi sinh quá gần cực, dùng Whole Sign.";
  }
  for (const p of planets) p.house = houseOf(p.longitude, houses);

  return { ...base, ascendant: asc, midheaven: mc, houses, houseSystem, note };
}
