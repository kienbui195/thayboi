"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api, ApiError, fieldErrorMap } from "@/lib/api";
import { chartSlug } from "@/lib/profiles";
import type { ChartKind } from "@/lib/types";

export type ProfileFormState = { error?: string; fieldErrors?: Record<string, string> };
export type Result = { ok: true } | { ok: false; error: string };

function readForm(formData: FormData) {
  const num = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? undefined : Number(v);
  };
  return {
    name: formData.get("name"),
    birthDate: formData.get("birthDate"),
    // Ô "Không rõ giờ sinh" (BR14)
    birthTime: formData.get("timeUnknown") === "on" ? null : formData.get("birthTime") || "",
    gender: formData.get("gender") || undefined,
    placeName: formData.get("placeName") ?? "",
    latitude: num("latitude"),
    longitude: num("longitude"),
    timezone: formData.get("timezone") ?? "",
  };
}

/** Luật nhập hồ sơ kiểm ở API; lỗi trả về theo từng ô. */
export async function saveProfile(_: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const id = formData.get("id");
  try {
    await api(id ? `/api/ho-so/${id}` : "/api/ho-so", { method: id ? "PUT" : "POST", body: readForm(formData) });
  } catch (e) {
    if (!(e instanceof ApiError)) throw e;
    return e.fields.length > 0 ? { fieldErrors: fieldErrorMap(e.fields) } : { error: e.message };
  }
  revalidatePath("/", "layout");
  redirect(id ? "/ho-so" : "/trang-chu");
}

async function call(path: string): Promise<Result> {
  try {
    await api(path, { method: "POST" });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    throw e;
  }
}

export const makePrimary = async (id: number) => call(`/api/ho-so/${id}/dat-chinh`);

export async function removeProfile(id: number): Promise<Result> {
  try {
    await api(`/api/ho-so/${id}`, { method: "DELETE" });
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    if (e instanceof ApiError) return { ok: false, error: e.message };
    throw e;
  }
}

export const recompute = async (profileId: number, kind: ChartKind) => call(`/api/ho-so/${profileId}/la-so/${chartSlug(kind)}/tinh-lai`);
