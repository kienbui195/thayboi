import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("mật khẩu", () => {
  it("băm có muối, kiểm đúng/sai", async () => {
    const a = await hashPassword("matkhau123");
    const b = await hashPassword("matkhau123");
    expect(a).not.toBe(b);
    expect(await verifyPassword("matkhau123", a)).toBe(true);
    expect(await verifyPassword("matkhau124", a)).toBe(false);
    expect(await verifyPassword("x", "rác")).toBe(false);
  });
});
