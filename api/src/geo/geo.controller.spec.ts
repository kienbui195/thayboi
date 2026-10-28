import { HttpException } from '@nestjs/common';
import { GeoController } from './geo.controller.js';

describe('tra nơi sinh', () => {
  const geo = new GeoController();
  afterEach(() => vi.unstubAllGlobals());

  const failure = async (q: string) => {
    try {
      await geo.search(q);
    } catch (e) {
      return e as HttpException;
    }
    throw new Error('không ném lỗi');
  };

  it.each([
    ['không kết nối được', () => Promise.reject(new TypeError('fetch failed'))],
    ['quá 5 giây', () => Promise.reject(new DOMException('timeout', 'TimeoutError'))],
    ['trả lỗi 503 kèm JSON', () => Promise.resolve(Response.json({ error: true, reason: 'quá tải' }, { status: 503 }))],
  ])('AC-02.4: Open-Meteo %s thì báo "Chưa tìm được địa danh"', async (_, fake) => {
    vi.stubGlobal('fetch', vi.fn(fake));
    const e = await failure('Nam Định');
    expect(e.getStatus()).toBe(502);
    expect(e.getResponse()).toEqual({ error: { code: 'geocode_failed', message: 'Chưa tìm được địa danh' } });
  });

  it('chỉ giữ kết quả có múi giờ, gõ dưới 2 ký tự thì không gọi Open-Meteo', async () => {
    const fetch = vi.fn(async () =>
      Response.json({
        results: [
          { id: 1, name: 'Nam Định', admin1: 'Nam Định', country: 'Việt Nam', latitude: 20.4, longitude: 106.2, timezone: 'Asia/Bangkok' },
          { id: 2, name: 'Không có múi giờ', latitude: 0, longitude: 0 },
        ],
      }),
    );
    vi.stubGlobal('fetch', fetch);
    expect((await geo.search('N')).places).toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
    const { places } = await geo.search(' Nam Định ');
    expect(places.map((p) => p.timezone)).toEqual(['Asia/Bangkok']);
  });
});
