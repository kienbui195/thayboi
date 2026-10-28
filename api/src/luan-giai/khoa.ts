import type { ChartKind } from '../charts/index.js';

/**
 * Khóa luận giải dạng `<loại>:<giá trị>`. Người soạn chỉ cần nhớ bảng này; môn và loại suy ra từ tiền tố.
 * Giá trị nhiều phần ngăn bằng `|` (sao|cung, thiên thể|cung hoàng đạo).
 */
export const LOAI: Record<string, { mon: ChartKind; label: string; example: string }> = {
  so: { mon: 'than_so_hoc', label: 'Con số (số chủ đạo, sứ mệnh…)', example: 'so:11' },
  cung: { mon: 'chiem_tinh', label: 'Cung hoàng đạo', example: 'cung:Bạch Dương' },
  'hanh-tinh': { mon: 'chiem_tinh', label: 'Thiên thể nằm ở một cung hoàng đạo', example: 'hanh-tinh:Mặt Trăng|Song Tử' },
  sao: { mon: 'tu_vi', label: 'Một sao, nói chung', example: 'sao:Tử Vi' },
  'sao-cung': { mon: 'tu_vi', label: 'Một sao đóng ở một cung', example: 'sao-cung:Tử Vi|Mệnh' },
};

export const KHOA_HINT = Object.entries(LOAI)
  .map(([, v]) => `${v.example} (${v.label})`)
  .join(' · ');

/** Chuẩn hóa khoảng trắng quanh `:` và `|`, giữ nguyên chữ hoa/thường và dấu. */
export function normalizeKhoa(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*([:|])\s*/g, '$1');
}

export function parseKhoa(raw: string): { khoa: string; loai: string; mon: ChartKind } | { error: string } {
  const khoa = normalizeKhoa(raw);
  const i = khoa.indexOf(':');
  const loai = i > 0 ? khoa.slice(0, i) : '';
  const value = i > 0 ? khoa.slice(i + 1) : '';
  const def = LOAI[loai];
  if (!def) return { error: `Khóa phải bắt đầu bằng một loại: ${Object.keys(LOAI).join(', ')}. Ví dụ ${KHOA_HINT}` };
  if (!value) return { error: `Thiếu giá trị sau "${loai}:"` };
  const parts = value.split('|');
  const needTwo = loai === 'hanh-tinh' || loai === 'sao-cung';
  if (needTwo && (parts.length !== 2 || parts.some((p) => !p))) return { error: `Loại "${loai}" cần hai phần ngăn bằng "|", ví dụ ${def.example}` };
  if (!needTwo && parts.length !== 1) return { error: `Loại "${loai}" chỉ có một phần, ví dụ ${def.example}` };
  return { khoa, loai, mon: def.mon };
}
