import type { FieldMeta } from '../contract.js';
import { KHOA_HINT, parseKhoa } from '../../luan-giai/khoa.js';
import type { ResourceDefinition } from './definition.js';

const f = (name: string, label: string, type: FieldMeta['type'], extra: Partial<FieldMeta> = {}): FieldMeta => ({ name, label, type, ...extra });
const ts = (name: string, label: string): FieldMeta => f(name, label, 'datetime', { readonly: true });

/** Lời luận giải: người soạn chỉ gõ khóa + nội dung, môn và loại do máy chủ suy ra từ khóa. */
const luanGiai: ResourceDefinition = {
  model: 'luanGiai',
  meta: {
    key: 'luan-giai',
    label: 'Luận giải',
    kind: 'collection',
    primaryKey: 'id',
    allowCreate: true,
    allowDelete: true,
    actions: [],
    import: { formats: ['csv', 'json'], matchKey: 'khoa' },
    fields: [
      f('id', 'Mã', 'int', { readonly: true, list: true, sortable: true }),
      f('khoa', 'Khóa', 'string', { required: true, unique: true, list: true, search: true, sortable: true, maxLength: 191, hint: KHOA_HINT }),
      f('mon', 'Môn', 'enum', { readonly: true, enum: ['tu_vi', 'than_so_hoc', 'chiem_tinh'], list: true, filter: true }),
      f('loai', 'Loại', 'enum', { readonly: true, enum: ['so', 'cung', 'hanh-tinh', 'sao', 'sao-cung'], list: true, filter: true }),
      f('tieuDe', 'Tiêu đề', 'string', { list: true, search: true, maxLength: 200 }),
      f('noiDung', 'Nội dung', 'text', { required: true, search: true }),
      ts('updatedAt', 'Sửa lúc'),
    ],
  },
  normalizeKey: (v) => {
    const k = parseKhoa(v);
    return 'error' in k ? v : k.khoa;
  },
  async validate({ data }) {
    if (typeof data.khoa !== 'string') return [];
    const k = parseKhoa(data.khoa);
    if ('error' in k) return [{ name: 'khoa', message: k.error }];
    data.khoa = k.khoa;
    data.loai = k.loai;
    data.mon = k.mon;
    return [];
  },
};

/**
 * Tài khoản: xem và xóa. Xóa thì phiên, hồ sơ, lá số đi theo (khóa ngoại CASCADE).
 * Không bao giờ trả mật khẩu băm (không khai báo trường đó).
 */
const users: ResourceDefinition = {
  model: 'user',
  meta: {
    key: 'nguoi-dung',
    label: 'Người dùng',
    kind: 'collection',
    primaryKey: 'id',
    allowCreate: false,
    allowDelete: true,
    actions: [],
    fields: [
      f('id', 'Mã', 'int', { readonly: true, list: true, sortable: true }),
      f('email', 'Email', 'string', { readonly: true, list: true, search: true, sortable: true }),
      ts('createdAt', 'Đăng ký lúc'),
    ],
  },
};

export const RESOURCES: ResourceDefinition[] = [luanGiai, users];
