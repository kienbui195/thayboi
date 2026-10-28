// Kiểu lá số và vài hàm hiển thị. Cách tính nằm ở api/src/charts (có test ở đó).

export type NumerologyChart = {
  normalizedName: string;
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  birthday: number;
};

export type TuViStar = { name: string; brightness: string; mutagen: string };
export type TuViPalace = {
  name: string;
  stem: string;
  branch: string;
  isBody: boolean;
  majorStars: TuViStar[];
  minorStars: TuViStar[];
  adjectiveStars: TuViStar[];
  decadal: [number, number];
  changsheng: string;
};
export type TuViChart = {
  solarDate: string;
  lunarDate: string;
  chineseDate: string;
  hourName: string;
  hourRange: string;
  zodiac: string;
  soulStar: string;
  bodyStar: string;
  fiveElementsClass: string;
  palaces: TuViPalace[];
};

export type Planet = { key: string; name: string; longitude: number; sign: number; degree: number; retrograde: boolean; house: number | null };
export type AstrologyChart = {
  utc: string;
  utcOffsetMinutes: number;
  planets: Planet[];
  ascendant: number | null;
  midheaven: number | null;
  houses: number[] | null;
  houseSystem: "placidus" | "whole-sign" | null;
  note: string | null;
};

export const SIGNS = [
  "Bạch Dương", "Kim Ngưu", "Song Tử", "Cự Giải", "Sư Tử", "Xử Nữ",
  "Thiên Bình", "Bọ Cạp", "Nhân Mã", "Ma Kết", "Bảo Bình", "Song Ngư",
] as const;

const norm = (d: number) => ((d % 360) + 360) % 360;
export function signOf(longitude: number) {
  return { sign: Math.floor(norm(longitude) / 30), degree: norm(longitude) % 30 };
}

const MASTER = new Set([11, 22, 33]);
const digitSum = (n: number) => String(n).split("").reduce((s, d) => s + Number(d), 0);
function reduce(n: number) {
  while (n > 9 && !MASTER.has(n)) n = digitSum(n);
  return n;
}

/** Năm cá nhân đổi theo năm nên tính lúc mở, không lưu (Q8). Cùng công thức với api/src/charts/numerology.ts. */
export function personalYear(birthDate: string, year: number): number {
  const [, mm, dd] = birthDate.split("-");
  return reduce(digitSum(Number(dd)) + digitSum(Number(mm)) + digitSum(year));
}
