import { NextResponse, type NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export type Place = {
  id: number;
  name: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
};

type OpenMeteoResult = {
  id: number;
  name: string;
  admin1?: string;
  admin2?: string;
  country?: string;
  latitude: number;
  longitude: number;
  timezone?: string;
};

/** Tra địa danh qua Open-Meteo (miễn phí, không cần khóa). Gọi qua server để đổi nhà cung cấp chỉ sửa một chỗ. */
export async function GET(request: NextRequest) {
  if (!(await getCurrentUser())) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 2) return NextResponse.json({ places: [] });
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({ name: q, count: "8", language: "vi", format: "json" }).toString();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const body = (await res.json()) as { results?: OpenMeteoResult[] };
    const places: Place[] = (body.results ?? [])
      .filter((r) => r.timezone)
      .map((r) => ({
        id: r.id,
        name: r.name,
        region: [r.admin2, r.admin1].filter(Boolean).join(", "),
        country: r.country ?? "",
        latitude: r.latitude,
        longitude: r.longitude,
        timezone: r.timezone!,
      }));
    return NextResponse.json({ places });
  } catch {
    // AC-02.4
    return NextResponse.json({ error: "Chưa tìm được địa danh" }, { status: 502 });
  }
}
