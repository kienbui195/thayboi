import * as A from "astronomy-engine";
import { describe, expect, it } from "vitest";
import { angles, computeAstrology, houseOf, norm, placidusCusps } from "./astrology.js";

const SAIGON = { latitude: 10.8231, longitude: 106.6297, timezone: "Asia/Ho_Chi_Minh" };

/** Độ cao (altitude) và phương vị của một điểm trên hoàng đạo, nhìn từ nơi sinh. */
function horizonOf(lon: number, date: Date, lat: number, lng: number) {
  const time = A.MakeTime(date);
  const ecl = A.VectorFromSphere(new A.Spherical(0, lon, 1), time);
  // hoàng đạo thật của ngày → xích đạo thật của ngày
  const eqd = A.RotateVector(A.Rotation_ECT_EQD(time), ecl);
  const sph = A.EquatorFromVector(eqd);
  return A.Horizon(time, new A.Observer(lat, lng, 0), sph.ra, sph.dec);
}

describe("chiêm tinh", () => {
  it("AC-06.1: Sài Gòn 1970 quy đổi theo UTC+8", () => {
    const c = computeAstrology({ ...SAIGON, birthDate: "1970-05-15", birthTime: "08:30" });
    expect(c.utcOffsetMinutes).toBe(480);
    expect(c.utc).toBe("1970-05-15T00:30:00.000Z");
    expect(c.houseSystem).toBe("placidus");
  });

  it("Mặt Trời giữa tháng 5 ở Kim Ngưu", () => {
    const c = computeAstrology({ ...SAIGON, birthDate: "1990-05-15", birthTime: "08:30" });
    const sun = c.planets[0];
    expect(sun.sign).toBe(1);
    expect(sun.degree).toBeGreaterThan(23);
    expect(sun.degree).toBeLessThan(25);
  });

  it("cung Mọc nằm trên chân trời phía đông, MC ở kinh tuyến", () => {
    for (const [lat, lng, iso] of [
      [21.03, 105.85, "1990-05-15T01:30:00Z"],
      [51.5, -0.12, "1985-12-01T18:00:00Z"],
      [-33.87, 151.2, "2001-03-20T06:00:00Z"],
    ] as const) {
      const date = new Date(iso);
      const eps = A.e_tilt(A.MakeTime(date)).tobl;
      const ramc = norm(A.SiderealTime(date) * 15 + lng);
      const { asc, mc } = angles(ramc, lat, eps);
      const h = horizonOf(asc, date, lat, lng);
      expect(Math.abs(h.altitude)).toBeLessThan(0.6); // có khúc xạ khí quyển nhẹ
      expect(h.azimuth).toBeLessThan(180); // phía đông
      const m = horizonOf(mc, date, lat, lng);
      expect(Math.min(Math.abs(m.azimuth), Math.abs(m.azimuth - 180), Math.abs(m.azimuth - 360))).toBeLessThan(0.5);
    }
  });

  it("nhà Placidus tăng dần và đối xứng", () => {
    const cusps = placidusCusps(123.4, 21.03, 23.44)!;
    expect(cusps).toHaveLength(12);
    for (let i = 0; i < 6; i++) expect(norm(cusps[i + 6] - cusps[i])).toBeCloseTo(180, 6);
    for (let i = 0; i < 12; i++) {
      const span = norm(cusps[(i + 1) % 12] - cusps[i]);
      expect(span).toBeGreaterThan(5);
      expect(span).toBeLessThan(60);
    }
    expect(houseOf(cusps[4] + 1, cusps)).toBe(5);
  });

  it("đỉnh nhà 12 đi được 2/3 bán cung ngày (kiểm độc lập bằng astronomy-engine)", () => {
    const [lat, lng] = [21.03, 105.85];
    const date = new Date("1990-05-15T01:30:00Z");
    const time = A.MakeTime(date);
    const eps = A.e_tilt(time).tobl;
    const ramc = norm(A.SiderealTime(date) * 15 + lng);
    const c12 = placidusCusps(ramc, lat, eps)![11];
    const eqd = A.RotateVector(A.Rotation_ECT_EQD(time), A.VectorFromSphere(new A.Spherical(0, c12, 1), time));
    const { ra, dec } = A.EquatorFromVector(eqd);
    const hourAngle = norm(ramc - ra * 15 + 180) - 180; // âm = phía đông kinh tuyến
    const dsa = (Math.acos(-Math.tan((lat * Math.PI) / 180) * Math.tan((dec * Math.PI) / 180)) * 180) / Math.PI;
    expect(hourAngle).toBeCloseTo((-2 / 3) * dsa, 3);
  });

  it("AC-06.2: 66,0° dùng Placidus, Tromsø 69,6° dùng Whole Sign", () => {
    const base = { birthDate: "1990-01-10", birthTime: "10:00", longitude: 18.95, timezone: "Europe/Oslo" };
    expect(computeAstrology({ ...base, latitude: 66.0 }).houseSystem).toBe("placidus");
    const t = computeAstrology({ ...base, latitude: 69.65 });
    expect(t.houseSystem).toBe("whole-sign");
    expect(t.note).toContain("Whole Sign");
  });

  it("AC-02.6: không rõ giờ thì không có cung Mọc và nhà", () => {
    const c = computeAstrology({ ...SAIGON, birthDate: "1990-05-15", birthTime: null });
    expect(c.ascendant).toBeNull();
    expect(c.houses).toBeNull();
    expect(c.planets).toHaveLength(10);
    expect(c.planets.every((p) => p.house === null)).toBe(true);
  });
});
