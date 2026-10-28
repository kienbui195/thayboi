import { describe, expect, it } from "vitest";
import { MON } from "./mon";

describe("BR18: thẻ SEO của trang công khai", () => {
  it.each(MON)("$slug: tiêu đề ≤ 60, mô tả ≤ 160 ký tự", (m) => {
    expect(m.title.length).toBeLessThanOrEqual(60);
    expect(m.description.length).toBeLessThanOrEqual(160);
  });

  it("thứ tự MON khớp thư mục trang", () => {
    expect(MON.map((m) => m.slug)).toEqual(["tu-vi", "than-so-hoc", "chiem-tinh"]);
  });
});
