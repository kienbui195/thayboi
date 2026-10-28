import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const OG_SIZE = { width: 1200, height: 630 };

// Font có đủ dấu tiếng Việt; font mặc định của ImageResponse thiếu dấu
const font = readFile(join(process.cwd(), "src/assets/BeVietnamPro-Bold.ttf"));

/** Ảnh chia sẻ cho trang công khai (AC-10.2). */
export async function renderOg(title: string, subtitle: string) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)",
          color: "white",
          fontFamily: "Be Vietnam Pro",
        }}
      >
        <div style={{ fontSize: 36, opacity: 0.8 }}>Thầy Bói</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 68, lineHeight: 1.15 }}>{title}</div>
          <div style={{ fontSize: 32, opacity: 0.8 }}>{subtitle}</div>
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: [{ name: "Be Vietnam Pro", data: await font, weight: 700, style: "normal" }] },
  );
}
