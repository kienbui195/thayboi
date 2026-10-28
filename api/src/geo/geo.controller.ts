import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserGuard } from '../auth/user.guard.js';
import { apiError } from '../common/http.js';

export type Place = { id: number; name: string; region: string; country: string; latitude: number; longitude: number; timezone: string };

type OpenMeteoResult = {
  id: number; name: string; admin1?: string; admin2?: string; country?: string; latitude: number; longitude: number; timezone?: string;
};

/** Tra địa danh qua Open-Meteo (miễn phí, không cần khóa). Chỉ cho người đã đăng nhập để người ngoài không mượn. */
@Controller('api/dia-danh')
@UseGuards(UserGuard)
export class GeoController {
  @Get()
  async search(@Query('q') raw?: string) {
    const q = raw?.trim() ?? '';
    if (q.length < 2) return { places: [] };
    const url = new URL('https://geocoding-api.open-meteo.com/v1/search');
    url.search = new URLSearchParams({ name: q, count: '8', language: 'vi', format: 'json' }).toString();
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
      const body = (await res.json()) as { results?: OpenMeteoResult[] };
      const places: Place[] = (body.results ?? [])
        .filter((r) => r.timezone)
        .map((r) => ({
          id: r.id,
          name: r.name,
          region: [r.admin2, r.admin1].filter(Boolean).join(', '),
          country: r.country ?? '',
          latitude: r.latitude,
          longitude: r.longitude,
          timezone: r.timezone!,
        }));
      return { places };
    } catch {
      throw apiError(502, 'geocode_failed', 'Chưa tìm được địa danh'); // AC-02.4
    }
  }
}
