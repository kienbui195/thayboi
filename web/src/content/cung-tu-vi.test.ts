import { describe, expect, it } from "vitest";
import { CUNG_TU_VI } from "./cung-tu-vi";

describe("ý nghĩa 12 cung tử vi", () => {
  it("đủ 12 cung, không trùng, bắt đầu từ Mệnh, cung nào cũng có lời giải thích", () => {
    const names = CUNG_TU_VI.map((c) => c.name);
    expect(new Set(names).size).toBe(12);
    expect(names[0]).toBe("Mệnh");
    for (const c of CUNG_TU_VI) expect(c.yNghia.length).toBeGreaterThan(0);
  });
});
