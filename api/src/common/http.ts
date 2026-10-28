import { HttpStatus } from '@nestjs/common';
import type { ZodError } from 'zod';
import { apiError, unprocessable } from '../admin/errors.js';

export { apiError, unprocessable };

/** Lỗi nghiệp vụ trả cho web: { error: { code, message } }, mã HTTP theo loại lỗi. */
export const conflict = (code: string, message: string) => apiError(HttpStatus.CONFLICT, code, message);
export const notFoundError = (message = 'Không tìm thấy') => apiError(HttpStatus.NOT_FOUND, 'not_found', message);
export const unauthenticated = () => apiError(HttpStatus.UNAUTHORIZED, 'unauthenticated', 'Cần đăng nhập');

/** Lỗi zod → 422 kèm lỗi từng ô; latitude/longitude/timezone gom về ô nơi sinh. */
export function zodToHttp(error: ZodError) {
  const seen = new Set<string>();
  const fields = [];
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? 'form');
    const name = ['latitude', 'longitude', 'timezone'].includes(key) ? 'placeName' : key;
    if (seen.has(name)) continue;
    seen.add(name);
    fields.push({ name, message: issue.message });
  }
  return unprocessable(fields);
}

/** Đọc một cookie từ header, không cần thư viện. */
export function readCookie(header: string | undefined, name: string): string | undefined {
  for (const part of (header ?? '').split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return undefined;
}
