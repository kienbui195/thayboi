import { OG_SIZE, renderOg } from "@/lib/og";

export const alt = "Thầy Bói — xem tử vi, thần số học, chiêm tinh";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Nhập ngày sinh một lần, xem cả ba môn", "Tử vi · Thần số học · Chiêm tinh");
}
