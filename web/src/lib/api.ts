import "server-only";
import { cookies } from "next/headers";

/** Địa chỉ Nest trong mạng nội bộ: Docker `http://thayboi-api:3000`, máy dev `http://127.0.0.1:3001`. */
export const API_URL = process.env.API_URL ?? "http://127.0.0.1:3001";

export type FieldError = { name: string; message: string };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly fields: FieldError[] = [],
  ) {
    super(message);
  }
}

/**
 * Gọi API từ server của Next, chuyển tiếp cookie đăng nhập của người dùng.
 * Lỗi của API có khuôn { error: { code, message, fields? } } → ném ApiError.
 */
export async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const cookie = (await cookies()).toString();
  const res = await fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers: { "content-type": "application/json", ...(cookie ? { cookie } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  return readJson<T>(res);
}

export async function readJson<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const e = data?.error ?? {};
    throw new ApiError(res.status, e.code ?? "error", e.message ?? "Có lỗi, thử lại sau", e.fields ?? []);
  }
  return data as T;
}

export const fieldErrorMap = (fields: FieldError[]) => Object.fromEntries(fields.map((f) => [f.name, f.message]));
