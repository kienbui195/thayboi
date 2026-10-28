import { DateTime } from "luxon";
import { z } from "zod";
import { isValidTimezone } from "../charts/birth-time.js";

export const MAX_PROFILES = 10;

/** Luật nhập hồ sơ: BR2 (ngày sinh 1900 → hôm nay), BR3 (nơi sinh từ gợi ý), BR9 (Nam/Nữ). */
export const profileInputSchema = z
  .object({
    name: z.string().trim().min(1, "Hãy nhập tên").max(100, "Tên tối đa 100 ký tự"),
    birthDate: z.iso.date("Ngày sinh không hợp lệ").refine((d) => d >= "1900-01-01", "Ngày sinh không được trước năm 1900"),
    birthTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Giờ sinh không hợp lệ")
      .nullable(),
    gender: z.enum(["male", "female"], "Hãy chọn giới tính"),
    placeName: z.string().trim().min(1, "Hãy chọn nơi sinh từ danh sách gợi ý"),
    latitude: z.number("Hãy chọn nơi sinh từ danh sách gợi ý").min(-90).max(90),
    longitude: z.number("Hãy chọn nơi sinh từ danh sách gợi ý").min(-180).max(180),
    timezone: z.string().refine(isValidTimezone, "Hãy chọn nơi sinh từ danh sách gợi ý"),
  })
  .superRefine((v, ctx) => {
    // "Hôm nay" tính theo múi giờ nơi sinh, để người sinh hôm nay ở nơi đã sang ngày mới vẫn nhập được
    const today = DateTime.now().setZone(isValidTimezone(v.timezone) ? v.timezone : "UTC+14").toISODate()!;
    if (v.birthDate > today) {
      ctx.addIssue({ code: "custom", path: ["birthDate"], message: "Ngày sinh không được ở tương lai" });
    }
  });

export type ProfileInput = z.infer<typeof profileInputSchema>;
