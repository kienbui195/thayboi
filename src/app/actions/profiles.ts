"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import type { ChartKind } from "@/lib/charts";
import { profileInputSchema } from "@/lib/profile-input";
import {
  createProfile,
  deleteProfile,
  recomputeChart,
  setPrimaryProfile,
  updateProfile,
  type Result,
} from "@/lib/profiles";

export type ProfileFormState = { error?: string; fieldErrors?: Record<string, string> };

function readForm(formData: FormData) {
  const num = (k: string) => {
    const v = formData.get(k);
    return v === null || v === "" ? undefined : Number(v);
  };
  const timeUnknown = formData.get("timeUnknown") === "on";
  return profileInputSchema.safeParse({
    name: formData.get("name"),
    birthDate: formData.get("birthDate"),
    birthTime: timeUnknown ? null : formData.get("birthTime") || "",
    gender: formData.get("gender") ?? undefined,
    placeName: formData.get("placeName") ?? "",
    latitude: num("latitude"),
    longitude: num("longitude"),
    timezone: formData.get("timezone") ?? "",
  });
}

function fieldErrors(error: z.ZodError) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    // latitude/longitude/timezone đều là lỗi của ô nơi sinh
    const field = ["latitude", "longitude", "timezone"].includes(key) ? "placeName" : key;
    out[field] ??= issue.message;
  }
  return out;
}

export async function saveProfile(_: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  const user = await requireUser();
  const parsed = readForm(formData);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error) };
  const id = formData.get("id");
  const r = id ? await updateProfile(user.id, String(id), parsed.data) : await createProfile(user.id, parsed.data);
  if (!r.ok) return { error: r.error };
  revalidatePath("/", "layout");
  redirect(id ? "/ho-so" : "/trang-chu");
}

export async function makePrimary(id: string): Promise<Result> {
  const user = await requireUser();
  const r = await setPrimaryProfile(user.id, id);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}

export async function removeProfile(id: string): Promise<Result> {
  const user = await requireUser();
  const r = await deleteProfile(user.id, id);
  if (r.ok) revalidatePath("/", "layout");
  return r;
}

const kinds = z.enum(["tu_vi", "than_so_hoc", "chiem_tinh"]);

export async function recompute(profileId: string, kind: ChartKind): Promise<Result> {
  const user = await requireUser();
  const r = await recomputeChart(user.id, profileId, kinds.parse(kind));
  if (r.ok) revalidatePath("/la-so", "layout");
  return r;
}
