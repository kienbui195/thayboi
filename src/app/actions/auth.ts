"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearLoginFailures, isLoginBlocked, recordLoginFailure } from "@/lib/auth/rate-limit";
import { createSession, deleteSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type AuthState = { error?: string; fieldErrors?: { email?: string; password?: string }; email?: string };

const credentials = z.object({
  email: z.email("Email không hợp lệ").trim().toLowerCase(),
  password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(200),
});

function parse(formData: FormData) {
  const r = credentials.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (r.success) return { data: r.data };
  const f = z.flattenError(r.error).fieldErrors;
  return { state: { fieldErrors: { email: f.email?.[0], password: f.password?.[0] }, email: String(formData.get("email") ?? "") } };
}

/** US-01, BR1: email không trùng, mật khẩu ≥ 8 ký tự; xong là đăng nhập và sang tạo hồ sơ (AC-01.1). */
export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const { data, state } = parse(formData);
  if (!data) return state;
  const passwordHash = await hashPassword(data.password);
  const user = await db.insert(users).values({ email: data.email, passwordHash }).onConflictDoNothing().returning().get();
  if (!user) return { fieldErrors: { email: "Email này đã đăng ký" }, email: data.email };
  await createSession(user.id);
  redirect("/ho-so/moi");
}

const WRONG = "Sai email hoặc mật khẩu";

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (await isLoginBlocked(email)) {
    return { error: "Bạn đã nhập sai quá 5 lần. Thử lại sau 15 phút.", email };
  }
  const user = await db.select().from(users).where(eq(users.email, email)).get();
  // Không nói sai email hay sai mật khẩu (US-01 E2)
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    await recordLoginFailure(email);
    return { error: WRONG, email };
  }
  await clearLoginFailures(email);
  await createSession(user.id);
  redirect("/trang-chu");
}

export async function signOut() {
  await deleteSession();
  redirect("/");
}
