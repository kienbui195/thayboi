import { Injectable } from '@nestjs/common';
import { CALC_VERSION, CHART_KINDS, computeChart, type ChartKind, type ChartResult } from '../charts/index.js';
import { conflict, notFoundError } from '../common/http.js';
import type { BirthProfile, Prisma } from '../generated/prisma/client.js';
import { khoaForChart, LuanGiaiService } from '../luan-giai/luan-giai.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { MAX_PROFILES, type ProfileInput } from './profile-input.js';

type Tx = Prisma.TransactionClient;

// Mọi hàm đều lọc theo userId: hồ sơ của người khác coi như không tồn tại (BR7).

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly luanGiai: LuanGiaiService,
  ) {}

  list(userId: number) {
    return this.prisma.birthProfile.findMany({ where: { userId }, orderBy: { createdAt: 'asc' } });
  }

  async get(userId: number, id: number) {
    const p = await this.prisma.birthProfile.findFirst({ where: { id, userId } });
    if (!p) throw notFoundError('Không tìm thấy hồ sơ');
    return p;
  }

  /** Khóa dòng tài khoản: mọi thao tác ghi hồ sơ của một người chạy lần lượt (BR10, BR12 không bị đua). */
  private lockUser(tx: Tx, userId: number) {
    return tx.$queryRaw`SELECT id FROM users WHERE id = ${userId} FOR UPDATE`;
  }

  private async writeChart(tx: Tx, profileId: number, kind: ChartKind, r: ChartResult) {
    const row = {
      status: r.status,
      data: (r.data ?? undefined) as Prisma.InputJsonValue | undefined,
      houseSystem: r.houseSystem,
      calcVersion: CALC_VERSION[kind],
      computedAt: new Date(),
    };
    await tx.chart.upsert({ where: { profileId_kind: { profileId, kind } }, create: { profileId, kind, ...row }, update: row });
  }

  private async saveCharts(tx: Tx, p: BirthProfile, kinds: ChartKind[] = CHART_KINDS) {
    for (const kind of kinds) await this.writeChart(tx, p.id, kind, computeChart(kind, p));
  }

  /** BR8, BR10, BR12: hồ sơ đầu tiên tự thành hồ sơ chính; lưu xong là có 3 lá số. */
  create(userId: number, input: ProfileInput) {
    return this.prisma.$transaction(async (tx) => {
      await this.lockUser(tx, userId);
      const n = await tx.birthProfile.count({ where: { userId } });
      if (n >= MAX_PROFILES) throw conflict('limit', `Mỗi tài khoản tối đa ${MAX_PROFILES} hồ sơ`);
      const p = await tx.birthProfile.create({ data: { ...input, userId, isPrimary: n === 0 } });
      await this.saveCharts(tx, p);
      return p;
    });
  }

  /** BR8: sửa hồ sơ thì tính lại và lưu đè cả 3 lá số. */
  update(userId: number, id: number, input: ProfileInput) {
    return this.prisma.$transaction(async (tx) => {
      const found = await tx.birthProfile.findFirst({ where: { id, userId } });
      if (!found) throw notFoundError('Không tìm thấy hồ sơ');
      const p = await tx.birthProfile.update({ where: { id }, data: input });
      await this.saveCharts(tx, p);
      return p;
    });
  }

  /** BR11: không xóa hồ sơ chính, không xóa hồ sơ cuối cùng. */
  remove(userId: number, id: number) {
    return this.prisma.$transaction(async (tx) => {
      await this.lockUser(tx, userId);
      const all = await tx.birthProfile.findMany({ where: { userId } });
      const target = all.find((p) => p.id === id);
      if (!target) throw notFoundError('Không tìm thấy hồ sơ');
      if (all.length === 1) throw conflict('last_profile', 'Cần giữ ít nhất một hồ sơ');
      if (target.isPrimary) throw conflict('primary_profile', 'Hãy đặt hồ sơ khác làm hồ sơ chính trước khi xóa');
      await tx.birthProfile.delete({ where: { id } });
    });
  }

  /** BR10: bỏ dấu chính cũ rồi đặt dấu mới trong một giao dịch; hai yêu cầu cùng lúc thì cái sau thắng. */
  setPrimary(userId: number, id: number) {
    return this.prisma.$transaction(async (tx) => {
      await this.lockUser(tx, userId);
      const target = await tx.birthProfile.findFirst({ where: { id, userId } });
      if (!target) throw notFoundError('Không tìm thấy hồ sơ');
      await tx.birthProfile.updateMany({ where: { userId, isPrimary: true }, data: { isPrimary: false } });
      await tx.birthProfile.update({ where: { id }, data: { isPrimary: true } });
    });
  }

  /**
   * Lá số đã lưu (BR8) kèm lời luận giải khớp với lá số. Lần lưu trước lỗi thì thử tính lại (AC-02.7).
   * `outdated` = tính bằng cách cũ, cần tag "Bản cũ" (BR17).
   */
  async chart(userId: number, profileId: number, kind: ChartKind) {
    const p = await this.get(userId, profileId);
    const find = () => this.prisma.chart.findUnique({ where: { profileId_kind: { profileId, kind } } });
    let c = await find();
    if (!c || c.status === 'error') {
      await this.prisma.$transaction((tx) => this.saveCharts(tx, p, [kind]));
      c = await find();
    }
    if (!c) throw notFoundError('Chưa lập được lá số');
    const luanGiai = c.status === 'ok' ? await this.luanGiai.lookup(khoaForChart(kind, c.data)) : {};
    return {
      chart: {
        kind,
        status: c.status,
        data: c.data,
        houseSystem: c.houseSystem,
        calcVersion: c.calcVersion,
        computedAt: c.computedAt,
        outdated: c.calcVersion !== CALC_VERSION[kind],
      },
      luanGiai,
    };
  }

  /** Nút "Tính lại" (BR17). Tính lỗi thì giữ nguyên lá số cũ (AC-09.2). */
  async recompute(userId: number, profileId: number, kind: ChartKind) {
    const p = await this.get(userId, profileId);
    const r = computeChart(kind, p);
    if (r.status === 'error') throw conflict('recompute_failed', 'Chưa tính lại được, thử lại sau');
    await this.prisma.$transaction((tx) => this.writeChart(tx, p.id, kind, r));
  }
}
