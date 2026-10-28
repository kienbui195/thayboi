import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, UseGuards } from '@nestjs/common';
import type { SessionUser } from '../auth/auth.service.js';
import { CurrentUser, UserGuard } from '../auth/user.guard.js';
import { notFoundError, zodToHttp } from '../common/http.js';
import { profileInputSchema } from './profile-input.js';
import { ProfilesService } from './profiles.service.js';

const SLUG_TO_KIND = { 'tu-vi': 'tu_vi', 'than-so-hoc': 'than_so_hoc', 'chiem-tinh': 'chiem_tinh' } as const;
const kindOf = (slug: string) => {
  const k = SLUG_TO_KIND[slug as keyof typeof SLUG_TO_KIND];
  if (!k) throw notFoundError('Không có môn này');
  return k;
};

/** Ô "Không rõ giờ sinh" gửi birthTime = null. Lỗi trả về theo ô để web tô đỏ đúng chỗ. */
function parseInput(body: unknown) {
  const r = profileInputSchema.safeParse(body);
  if (!r.success) throw zodToHttp(r.error);
  return r.data;
}

const id = new ParseIntPipe({ exceptionFactory: () => notFoundError('Không tìm thấy hồ sơ') });

@Controller('api/ho-so')
@UseGuards(UserGuard)
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  @Get()
  async list(@CurrentUser() u: SessionUser) {
    return { items: await this.profiles.list(u.id) };
  }

  @Post()
  async create(@CurrentUser() u: SessionUser, @Body() body: unknown) {
    return this.profiles.create(u.id, parseInput(body));
  }

  @Get(':id')
  get(@CurrentUser() u: SessionUser, @Param('id', id) pid: number) {
    return this.profiles.get(u.id, pid);
  }

  @Put(':id')
  update(@CurrentUser() u: SessionUser, @Param('id', id) pid: number, @Body() body: unknown) {
    return this.profiles.update(u.id, pid, parseInput(body));
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@CurrentUser() u: SessionUser, @Param('id', id) pid: number) {
    return this.profiles.remove(u.id, pid);
  }

  @Post(':id/dat-chinh')
  @HttpCode(204)
  setPrimary(@CurrentUser() u: SessionUser, @Param('id', id) pid: number) {
    return this.profiles.setPrimary(u.id, pid);
  }

  @Get(':id/la-so/:mon')
  chart(@CurrentUser() u: SessionUser, @Param('id', id) pid: number, @Param('mon') mon: string) {
    return this.profiles.chart(u.id, pid, kindOf(mon));
  }

  @Post(':id/la-so/:mon/tinh-lai')
  @HttpCode(204)
  recompute(@CurrentUser() u: SessionUser, @Param('id', id) pid: number, @Param('mon') mon: string) {
    return this.profiles.recompute(u.id, pid, kindOf(mon));
  }
}

