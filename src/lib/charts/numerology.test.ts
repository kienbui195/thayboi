import { describe, expect, it } from "vitest";
import { computeNumerology, lifePathNumber, normalizeName, reduce } from "./numerology";

describe("thần số học", () => {
  it("AC-05.1: bỏ dấu tên, số chủ đạo 38 → 11", () => {
    const c = computeNumerology("Đặng Thị Ánh", "1995-08-15");
    expect(c.normalizedName).toBe("DANG THI ANH");
    expect(c.lifePath).toBe(11);
  });

  it("bỏ dấu đủ các nguyên âm có móc", () => {
    expect(normalizeName("  Nguyễn Ưu   Đàm Phượng ")).toBe("NGUYEN UU DAM PHUONG");
  });

  it("AC-05.2: tổng 29 giữ 11, tổng 28 ra 1", () => {
    expect(reduce(29)).toBe(11);
    expect(reduce(28)).toBe(1);
    // 1999-12-08: 1+9+9+9+1+2+0+8 = 39 → 12 → 3
    expect(lifePathNumber("1999-12-08")).toBe(3);
  });

  it("giữ 22 và 33", () => {
    expect(reduce(22)).toBe(22);
    expect(reduce(33)).toBe(33);
    expect(reduce(44)).toBe(8);
  });
});
