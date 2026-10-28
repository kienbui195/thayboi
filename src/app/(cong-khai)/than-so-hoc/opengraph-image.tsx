import { MON } from "@/content/mon";
import { OG_SIZE, renderOg } from "@/lib/og";

const m = MON[1];
export const alt = m.title;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOg(m.title, m.short);
}
