// Thần số học Pythagoras. Mọi phép tính chỉ là cộng chữ số; giữ số Master 11/22/33 (BR6).

const MASTER = new Set([11, 22, 33]);
const VOWELS = new Set(["A", "E", "I", "O", "U"]);

export type NumerologyChart = {
  normalizedName: string;
  lifePath: number;
  destiny: number;
  soulUrge: number;
  personality: number;
  birthday: number;
};

/** Bỏ dấu tiếng Việt, Đ→D, chỉ giữ chữ cái A–Z và khoảng trắng (BR5). */
export function normalizeName(name: string): string {
  return name
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Rút gọn về 1 chữ số, dừng ở số Master. */
export function reduce(n: number): number {
  while (n > 9 && !MASTER.has(n)) {
    n = digitSum(n);
  }
  return n;
}

function digitSum(n: number): number {
  return String(n)
    .split("")
    .reduce((s, d) => s + Number(d), 0);
}

function letterValue(ch: string): number {
  return ((ch.charCodeAt(0) - 65) % 9) + 1;
}

function nameNumber(name: string, pick: (ch: string) => boolean): number {
  const total = name
    .replace(/ /g, "")
    .split("")
    .filter(pick)
    .reduce((s, ch) => s + letterValue(ch), 0);
  return reduce(total);
}

/** birthDate dạng YYYY-MM-DD. Số chủ đạo = tổng mọi chữ số của ngày sinh, rồi rút gọn. */
export function lifePathNumber(birthDate: string): number {
  return reduce(digitSum(Number(birthDate.replace(/-/g, ""))));
}

/** Năm cá nhân đổi theo năm nên tính lúc mở, không lưu (Q8). */
export function personalYear(birthDate: string, year: number): number {
  const [, mm, dd] = birthDate.split("-");
  return reduce(digitSum(Number(dd)) + digitSum(Number(mm)) + digitSum(year));
}

export function computeNumerology(name: string, birthDate: string): NumerologyChart {
  const normalizedName = normalizeName(name);
  return {
    normalizedName,
    lifePath: lifePathNumber(birthDate),
    destiny: nameNumber(normalizedName, () => true),
    soulUrge: nameNumber(normalizedName, (ch) => VOWELS.has(ch)),
    personality: nameNumber(normalizedName, (ch) => !VOWELS.has(ch)),
    birthday: reduce(Number(birthDate.slice(8, 10))),
  };
}
