import { Test } from '@nestjs/testing';
import type { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ADMIN_API_TOKEN } from '../src/admin/admin-token.guard.js';
import { AppModule } from '../src/app.module.js';
import { configureApp } from '../src/app.setup.js';
import { PrismaService } from '../src/prisma/prisma.service.js';

const TOKEN = 'x'.repeat(40);

const input = (name: string, over: Record<string, unknown> = {}) => ({
  name,
  birthDate: '1990-05-15',
  birthTime: '08:30',
  gender: 'female',
  placeName: 'Hà Nội',
  latitude: 21.02,
  longitude: 105.84,
  timezone: 'Asia/Bangkok',
  ...over,
});

/** API công khai (AC của US-01…US-08) và cổng quản trị, chạy trên MySQL thật. */
describe('thayboi-api', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  const http = () => request(app.getHttpServer());

  /** Đăng ký một tài khoản mới, trả cookie phiên. */
  const signUp = async (email: string) => {
    const res = await http().post('/api/auth/dang-ky').send({ email, password: '12345678' }).expect(201);
    return String(res.headers['set-cookie']?.[0] ?? '').split(';')[0];
  };
  const as = (cookie: string) => ({
    get: (p: string) => http().get(p).set('Cookie', cookie),
    post: (p: string, body?: object) => http().post(p).set('Cookie', cookie).send(body ?? {}),
    put: (p: string, body: object) => http().put(p).set('Cookie', cookie).send(body),
    del: (p: string) => http().delete(p).set('Cookie', cookie),
  });
  const admin = (method: 'get' | 'post' | 'put' | 'delete', path: string) =>
    http()[method](`/admin-api${path}`).set('Authorization', `Bearer ${TOKEN}`);

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(ADMIN_API_TOKEN).useValue(TOKEN).compile();
    app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false });
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.chart.deleteMany();
    await prisma.birthProfile.deleteMany();
    await prisma.session.deleteMany();
    await prisma.loginFailure.deleteMany();
    await prisma.user.deleteMany();
    await prisma.luanGiai.deleteMany();
  });

  afterAll(() => app.close());

  describe('đăng nhập', () => {
    it('AC-01.1/01.2/01.3: đăng ký, mật khẩu ngắn, email trùng', async () => {
      const short = await http().post('/api/auth/dang-ky').send({ email: 'a@t.vn', password: '1234567' }).expect(422);
      expect(short.body.error.fields).toContainEqual({ name: 'password', message: 'Mật khẩu tối thiểu 8 ký tự' });
      const cookie = await signUp('a@t.vn');
      expect(cookie).toMatch(/^tb_session=/);
      await as(cookie).get('/api/auth/toi').expect(200);
      const dup = await http().post('/api/auth/dang-ky').send({ email: 'A@t.vn', password: '12345678' }).expect(409);
      expect(dup.body.error.message).toBe('Email này đã đăng ký');
    });

    it('AC-01.4/01.5: sai mật khẩu báo chung, sai 5 lần thì lần đúng cũng bị chặn', async () => {
      await signUp('a@t.vn');
      for (let i = 0; i < 5; i++) {
        const r = await http().post('/api/auth/dang-nhap').send({ email: 'a@t.vn', password: 'sai' }).expect(401);
        expect(r.body.error.message).toBe('Sai email hoặc mật khẩu');
      }
      const blocked = await http().post('/api/auth/dang-nhap').send({ email: 'a@t.vn', password: '12345678' }).expect(429);
      expect(blocked.body.error.message).toContain('15 phút');
    });

    it('chưa đăng nhập thì 401, đăng xuất xong phiên mất hiệu lực', async () => {
      await http().get('/api/ho-so').expect(401);
      const c = await signUp('a@t.vn');
      await as(c).post('/api/auth/dang-xuat').expect(204);
      await as(c).get('/api/auth/toi').expect(401);
    });
  });

  describe('hồ sơ', () => {
    it('AC-02.1: hồ sơ đầu tiên là hồ sơ chính và có đủ 3 lá số', async () => {
      const c = await signUp('a@t.vn');
      const p = (await as(c).post('/api/ho-so', input('Tôi')).expect(201)).body;
      expect(p.isPrimary).toBe(true);
      const charts = await prisma.chart.findMany({ where: { profileId: p.id } });
      expect(charts.map((x) => `${x.kind}:${x.status}`).sort()).toEqual(['chiem_tinh:ok', 'than_so_hoc:ok', 'tu_vi:ok']);
    });

    it('AC-02.2/02.3: lỗi nhập trả theo từng ô', async () => {
      const c = await signUp('a@t.vn');
      const r = await as(c).post('/api/ho-so', input('X', { birthDate: '1899-12-31', latitude: undefined, timezone: '' })).expect(422);
      const names = r.body.error.fields.map((f: { name: string }) => f.name);
      expect(names).toEqual(expect.arrayContaining(['birthDate', 'placeName']));
    });

    it('AC-02.8: thêm được cái thứ 10, cái thứ 11 bị từ chối', async () => {
      const c = await signUp('a@t.vn');
      for (let i = 1; i <= 10; i++) await as(c).post('/api/ho-so', input(`H${i}`)).expect(201);
      const r = await as(c).post('/api/ho-so', input('H11')).expect(409);
      expect(r.body.error.message).toBe('Mỗi tài khoản tối đa 10 hồ sơ');
    });

    it('AC-02.5: sửa giờ sinh thì tử vi và chiêm tinh được tính lại', async () => {
      const c = await signUp('a@t.vn');
      const p = (await as(c).post('/api/ho-so', input('Tôi'))).body;
      const before = (await as(c).get(`/api/ho-so/${p.id}/la-so/tu-vi`)).body.chart.data;
      await as(c).put(`/api/ho-so/${p.id}`, input('Tôi', { birthTime: '20:15' })).expect(200);
      const after = (await as(c).get(`/api/ho-so/${p.id}/la-so/tu-vi`)).body.chart.data;
      expect(after.hourName).not.toBe(before.hourName);
    });

    it('AC-02.6: không rõ giờ thì tử vi bỏ qua, 2 môn kia có lá số', async () => {
      const c = await signUp('a@t.vn');
      const p = (await as(c).post('/api/ho-so', input('Tôi', { birthTime: null }))).body;
      expect((await as(c).get(`/api/ho-so/${p.id}/la-so/tu-vi`)).body.chart.status).toBe('skipped');
      const astro = (await as(c).get(`/api/ho-so/${p.id}/la-so/chiem-tinh`)).body.chart;
      expect(astro.status).toBe('ok');
      expect(astro.data.ascendant).toBeNull();
    });

    it('AC-07.1: không đọc, sửa, xóa, đặt chính được hồ sơ của người khác', async () => {
      const b = await signUp('b@t.vn');
      const bp = (await as(b).post('/api/ho-so', input('Của B'))).body;
      await as(b).post('/api/ho-so', input('B2'));
      const a = await signUp('a@t.vn');
      await as(a).get(`/api/ho-so/${bp.id}`).expect(404);
      await as(a).get(`/api/ho-so/${bp.id}/la-so/tu-vi`).expect(404);
      await as(a).put(`/api/ho-so/${bp.id}`, input('Hack')).expect(404);
      await as(a).post(`/api/ho-so/${bp.id}/dat-chinh`).expect(404);
      await as(a).del(`/api/ho-so/${bp.id}`).expect(404);
      await as(a).post(`/api/ho-so/${bp.id}/la-so/tu-vi/tinh-lai`).expect(404);
      expect((await as(b).get(`/api/ho-so/${bp.id}`)).body.name).toBe('Của B');
    });

    it('AC-08.1/08.2: đổi hồ sơ chính, bấm cùng lúc vẫn chỉ một hồ sơ chính', async () => {
      const c = await signUp('a@t.vn');
      await as(c).post('/api/ho-so', input('Tôi'));
      const me = (await as(c).post('/api/ho-so', input('Mẹ'))).body;
      const bo = (await as(c).post('/api/ho-so', input('Bố'))).body;
      await Promise.all([as(c).post(`/api/ho-so/${me.id}/dat-chinh`).expect(204), as(c).post(`/api/ho-so/${bo.id}/dat-chinh`).expect(204)]);
      const items = (await as(c).get('/api/ho-so')).body.items;
      expect(items.filter((p: { isPrimary: boolean }) => p.isPrimary)).toHaveLength(1);
    });

    it('BR10: DB tự chặn hai hồ sơ chính', async () => {
      const c = await signUp('a@t.vn');
      const p = (await as(c).post('/api/ho-so', input('Tôi'))).body;
      await expect(prisma.birthProfile.create({ data: { ...input('Lậu'), gender: 'female', userId: p.userId, isPrimary: true } })).rejects.toThrow();
    });

    it('AC-08.3/08.4/08.5: luật xóa hồ sơ', async () => {
      const c = await signUp('a@t.vn');
      const toi = (await as(c).post('/api/ho-so', input('Tôi'))).body;
      expect((await as(c).del(`/api/ho-so/${toi.id}`).expect(409)).body.error.message).toBe('Cần giữ ít nhất một hồ sơ');
      const me = (await as(c).post('/api/ho-so', input('Mẹ'))).body;
      expect((await as(c).del(`/api/ho-so/${toi.id}`).expect(409)).body.error.message).toBe('Hãy đặt hồ sơ khác làm hồ sơ chính trước khi xóa');
      await as(c).del(`/api/ho-so/${me.id}`).expect(204);
      expect(await prisma.chart.count({ where: { profileId: me.id } })).toBe(0);
    });
  });

  describe('lá số và luận giải', () => {
    it('AC-09.1: lá số phiên bản cũ có cờ outdated, tính lại thì hết', async () => {
      const c = await signUp('a@t.vn');
      const p = (await as(c).post('/api/ho-so', input('Tôi'))).body;
      await prisma.chart.updateMany({ where: { profileId: p.id, kind: 'chiem_tinh' }, data: { calcVersion: 0 } });
      expect((await as(c).get(`/api/ho-so/${p.id}/la-so/chiem-tinh`)).body.chart.outdated).toBe(true);
      await as(c).post(`/api/ho-so/${p.id}/la-so/chiem-tinh/tinh-lai`).expect(204);
      expect((await as(c).get(`/api/ho-so/${p.id}/la-so/chiem-tinh`)).body.chart.outdated).toBe(false);
    });

    it('AC-02.7: lá số lưu bị lỗi thì mở ra sẽ tính lại', async () => {
      const c = await signUp('a@t.vn');
      const p = (await as(c).post('/api/ho-so', input('Tôi'))).body;
      await prisma.chart.updateMany({ where: { profileId: p.id, kind: 'chiem_tinh' }, data: { status: 'error' } });
      expect((await as(c).get(`/api/ho-so/${p.id}/la-so/chiem-tinh`)).body.chart.status).toBe('ok');
    });

    it('lá số trả kèm các dòng luận giải khớp khóa', async () => {
      const c = await signUp('a@t.vn');
      const p = (await as(c).post('/api/ho-so', input('Đặng Thị Ánh', { birthDate: '1995-08-15' }))).body;
      await admin('post', '/luan-giai').send({ khoa: ' so : 11 ', noiDung: 'Số 11 nè' }).expect(201);
      const body = (await as(c).get(`/api/ho-so/${p.id}/la-so/than-so-hoc`)).body;
      expect(body.chart.data.lifePath).toBe(11);
      expect(body.luanGiai['so:11']).toEqual({ tieuDe: null, noiDung: 'Số 11 nè' });
    });
  });

  describe('cổng quản trị', () => {
    it('thiếu token hoặc có X-Forwarded-For thì 401', async () => {
      await http().get('/admin-api/meta').expect(401);
      await admin('get', '/meta').set('X-Forwarded-For', '1.2.3.4').expect(401);
      const meta = (await admin('get', '/meta').expect(200)).body;
      expect(meta.game.key).toBe('thayboi');
      expect(meta.resources.map((r: { key: string }) => r.key)).toEqual(['luan-giai', 'nguoi-dung']);
      expect((await admin('get', '/health').expect(200)).body.status).toBe('ok');
    });

    it('khóa luận giải sai khuôn bị 422, môn và loại tự suy ra', async () => {
      const bad = await admin('post', '/luan-giai').send({ khoa: 'Tử Vi', noiDung: 'x' }).expect(422);
      expect(bad.body.error.fields[0].name).toBe('khoa');
      const ok = (await admin('post', '/luan-giai').send({ khoa: 'sao-cung:Tử Vi|Mệnh', noiDung: 'Tử Vi thủ Mệnh' }).expect(201)).body;
      expect(ok).toMatchObject({ mon: 'tu_vi', loai: 'sao-cung', khoa: 'sao-cung:Tử Vi|Mệnh' });
    });

    it('nhập CSV luận giải: xem trước rồi ghi thật', async () => {
      const content = 'khoa,tieuDe,noiDung\nsao:Tử Vi,Tử Vi,Đế tinh\nso:7,,Người tìm hiểu\n';
      const dry = (await admin('post', '/luan-giai/import').send({ format: 'csv', content }).expect(201)).body;
      expect(dry.willCreate).toBe(2);
      await admin('post', '/luan-giai/import?dryRun=false').send({ format: 'csv', content, previewToken: dry.previewToken }).expect(201);
      expect(await prisma.luanGiai.count()).toBe(2);
    });

    it('danh sách người dùng không lộ mật khẩu băm', async () => {
      await signUp('a@t.vn');
      const list = (await admin('get', '/nguoi-dung').expect(200)).body;
      expect(list.items[0].email).toBe('a@t.vn');
      expect(JSON.stringify(list)).not.toContain('scrypt');
    });
  });
});
