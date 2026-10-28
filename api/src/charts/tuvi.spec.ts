import { describe, expect, it } from "vitest";
import { computeTuVi, hourIndex } from "./tuvi.js";

describe("tử vi", () => {
  it("đổi giờ sang canh giờ", () => {
    expect([0, 1, 2, 3, 8, 22, 23].map(hourIndex)).toEqual([0, 1, 1, 2, 4, 11, 12]);
  });

  it("lập được lá số tiếng Việt với 12 cung, 14 chính tinh", () => {
    const c = computeTuVi({
      birthDate: "1990-05-15",
      birthTime: "08:30",
      timezone: "Asia/Bangkok",
      gender: "male",
    });
    expect(c.palaces).toHaveLength(12);
    expect(c.palaces.flatMap((p) => p.majorStars)).toHaveLength(14);
    expect(c.palaces.map((p) => p.name)).toContain("Mệnh");
    expect(c.fiveElementsClass).toBe("Hỏa Lục Cục");
    expect(c.hourName).toMatch(/thìn/i);
  });

  it("Sài Gòn 1970 lúc 07:30 (UTC+8) quy về 06:30 giờ Việt Nam là giờ Mão", () => {
    const c = computeTuVi({
      birthDate: "1970-05-15",
      birthTime: "07:30",
      timezone: "Asia/Ho_Chi_Minh",
      gender: "female",
    });
    // 07:30 UTC+8 = 06:30 UTC+7 → giờ Mão
    expect(c.hourName).toMatch(/mão/i);
  });
});
