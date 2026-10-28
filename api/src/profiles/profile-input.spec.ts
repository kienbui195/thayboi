import { DateTime } from "luxon";
import { describe, expect, it } from "vitest";
import { profileInputSchema } from "./profile-input.js";

const valid = {
  name: "Tôi",
  birthDate: "1990-05-15",
  birthTime: "08:30",
  gender: "male",
  placeName: "Nam Định",
  latitude: 20.43,
  longitude: 106.17,
  timezone: "Asia/Bangkok",
};

const errorsOf = (v: object) => {
  const r = profileInputSchema.safeParse({ ...valid, ...v });
  return r.success ? [] : r.error.issues.map((i) => i.message);
};

describe("nhập hồ sơ", () => {
  it("AC-02.3: 01/01/1900 được, 31/12/1899 và ngày mai bị từ chối", () => {
    expect(errorsOf({ birthDate: "1900-01-01" })).toEqual([]);
    expect(errorsOf({ birthDate: "1899-12-31" })).toContain("Ngày sinh không được trước năm 1900");
    const tomorrow = DateTime.now().setZone("Asia/Bangkok").plus({ days: 1 }).toISODate()!;
    expect(errorsOf({ birthDate: tomorrow })).toContain("Ngày sinh không được ở tương lai");
    const today = DateTime.now().setZone("Asia/Bangkok").toISODate()!;
    expect(errorsOf({ birthDate: today })).toEqual([]);
  });

  it("AC-02.2: chưa chọn gợi ý nơi sinh thì không lưu", () => {
    expect(errorsOf({ latitude: undefined, longitude: undefined, timezone: "" })).toContain(
      "Hãy chọn nơi sinh từ danh sách gợi ý",
    );
  });

  it("không rõ giờ sinh là hợp lệ", () => {
    expect(errorsOf({ birthTime: null })).toEqual([]);
  });
});
