import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { ChartKind } from '../charts/index.js';
import type { AstrologyChart } from '../charts/astrology.js';
import { SIGNS } from '../charts/astrology.js';
import type { NumerologyChart } from '../charts/numerology.js';
import type { TuViChart } from '../charts/tuvi.js';
import { parseKhoa } from './khoa.js';
import { SEED_LUAN_GIAI } from './seed.js';

export type LuanGiaiMap = Record<string, { tieuDe: string | null; noiDung: string }>;

/** Các khóa luận giải có thể áp cho một lá số. Lá số chỉ hiện những khóa đã có nội dung. */
export function khoaForChart(kind: ChartKind, data: unknown): string[] {
  if (kind === 'than_so_hoc') {
    const c = data as NumerologyChart;
    return [c.lifePath, c.destiny, c.soulUrge, c.personality, c.birthday].map((n) => `so:${n}`);
  }
  if (kind === 'chiem_tinh') {
    const c = data as AstrologyChart;
    const keys = c.planets.flatMap((p) => [`hanh-tinh:${p.name}|${SIGNS[p.sign]}`, `cung:${SIGNS[p.sign]}`]);
    if (c.ascendant !== null) keys.push(`cung:${SIGNS[Math.floor(c.ascendant / 30)]}`);
    return keys;
  }
  const c = data as TuViChart;
  return c.palaces.flatMap((p) => [...p.majorStars, ...p.minorStars].flatMap((s) => [`sao-cung:${s.name}|${p.name}`, `sao:${s.name}`]));
}

@Injectable()
export class LuanGiaiService implements OnApplicationBootstrap {
  private readonly log = new Logger('LuanGiai');
  constructor(private readonly prisma: PrismaService) {}

  /** Nạp lời giải nghĩa ban đầu khi bảng còn trống; đã có dữ liệu thì không đụng tới. */
  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'test') return;
    if ((await this.prisma.luanGiai.count()) > 0) return;
    await this.prisma.luanGiai.createMany({
      data: SEED_LUAN_GIAI.map((r) => {
        const k = parseKhoa(r.khoa);
        if ('error' in k) throw new Error(`Khóa mẫu sai: ${r.khoa}`);
        return { ...r, khoa: k.khoa, loai: k.loai, mon: k.mon };
      }),
      skipDuplicates: true,
    });
    this.log.log(`Đã nạp ${SEED_LUAN_GIAI.length} dòng luận giải mẫu`);
  }

  async lookup(keys: string[]): Promise<LuanGiaiMap> {
    const unique = [...new Set(keys)];
    if (unique.length === 0) return {};
    const rows = await this.prisma.luanGiai.findMany({ where: { khoa: { in: unique } }, select: { khoa: true, tieuDe: true, noiDung: true } });
    return Object.fromEntries(rows.map((r) => [r.khoa, { tieuDe: r.tieuDe, noiDung: r.noiDung }]));
  }
}
