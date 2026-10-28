import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { cache } from "react";
import { api, ApiError } from "./api";

export const SESSION_COOKIE = "tb_session";

/** Người dùng của request hiện tại (hỏi API bằng cookie phiên), hoặc null. Mỗi request chỉ hỏi một lần. */
export const getCurrentUser = cache(async () => {
  await connection();
  try {
    return (await api<{ user: { id: number; email: string } }>("/api/auth/toi")).user;
  } catch (e) {
    if (e instanceof ApiError && e.status === 401) return null;
    throw e;
  }
});

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/dang-nhap");
  return user;
}
