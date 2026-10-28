import { DateTime } from "luxon";

export type BirthInput = {
  birthDate: string; // YYYY-MM-DD, dương lịch
  birthTime: string | null; // HH:mm giờ đồng hồ tại nơi sinh; null = không rõ giờ (BR14)
  timezone: string; // IANA, lấy từ Open-Meteo
};

/**
 * Giờ đồng hồ tại nơi sinh → thời điểm UTC, theo múi giờ ĐANG ÁP DỤNG lúc sinh (BR4).
 * Luxon đọc lịch sử múi giờ của IANA, nên Sài Gòn 1970 ra UTC+8.
 */
export function birthInstant({ birthDate, birthTime, timezone }: BirthInput): DateTime {
  const t = DateTime.fromISO(`${birthDate}T${birthTime ?? "12:00"}`, { zone: timezone });
  if (!t.isValid) throw new Error(`Ngày giờ sinh không hợp lệ: ${t.invalidReason}`);
  return t;
}

export function isValidTimezone(zone: string): boolean {
  return DateTime.local().setZone(zone).isValid;
}
