"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, API_URL, ApiError, fieldErrorMap, readJson } from "@/lib/api";
import { SESSION_COOKIE } from "@/lib/session";

export type AuthState = { error?: string; fieldErrors?: { email?: string; password?: string }; email?: string };

/**
 * Gọi API đăng ký/đăng nhập rồi chép cookie phiên mà API đặt sang trình duyệt.
 * (Server action chạy trên server của Next, nên Set-Cookie của API không tự tới trình duyệt.)
 */
async function authCall(path: string, formData: FormData): Promise<AuthState | null> {
  const email = String(formData.get("email") ?? "");
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email, password: String(formData.get("password") ?? "") }),
    cache: "no-store",
  });
  try {
    await readJson(res);
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    if (e.fields.length > 0) return { fieldErrors: fieldErrorMap(e.fields), email };
    if (e.code === "email_taken") return { fieldErrors: { email: e.message }, email };
    return { error: e.message, email };
  }
  const raw = res.headers.getSetCookie().find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  const token = raw?.split(";")[0].slice(SESSION_COOKIE.length + 1);
  const expires = raw?.match(/Expires=([^;]+)/i)?.[1];
  if (!token) return { error: "Có lỗi, thử lại sau", email };
  (await cookies()).set(SESSION_COOKIE, decodeURIComponent(token), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expires ? new Date(expires) : undefined,
  });
  return null;
}

/** US-01: đăng ký xong là đăng nhập và sang tạo hồ sơ (AC-01.1). */
export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const err = await authCall("/api/auth/dang-ky", formData);
  if (err) return err;
  redirect("/ho-so/moi");
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const err = await authCall("/api/auth/dang-nhap", formData);
  if (err) return err;
  redirect("/trang-chu");
}

export async function signOut() {
  await api("/api/auth/dang-xuat", { method: "POST" }).catch(() => undefined);
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/");
}
