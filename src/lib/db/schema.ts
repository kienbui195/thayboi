import { sql } from "drizzle-orm";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

const id = () => text("id").primaryKey().$defaultFn(() => crypto.randomUUID());
const createdAt = () => integer("created_at", { mode: "timestamp_ms" }).notNull().$defaultFn(() => new Date());

export const users = sqliteTable("users", {
  id: id(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: createdAt(),
});

/** id là SHA-256 của token trong cookie, lộ DB cũng không dùng lại được phiên. */
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
});

/** Lần đăng nhập sai, để chặn sau 5 lần trong 15 phút (AC-01.5). */
export const loginFailures = sqliteTable(
  "login_failures",
  {
    id: id(),
    email: text("email").notNull(),
    at: integer("at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [index("login_failures_email_at").on(t.email, t.at)],
);

export const birthProfiles = sqliteTable(
  "birth_profiles",
  {
    id: id(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    birthDate: text("birth_date").notNull(), // YYYY-MM-DD dương lịch
    birthTime: text("birth_time"), // HH:mm; null = không rõ giờ
    gender: text("gender", { enum: ["male", "female"] }).notNull(),
    placeName: text("place_name").notNull(),
    latitude: real("latitude").notNull(),
    longitude: real("longitude").notNull(),
    timezone: text("timezone").notNull(),
    isPrimary: integer("is_primary", { mode: "boolean" }).notNull().default(false),
    createdAt: createdAt(),
  },
  // BR10: mỗi tài khoản tối đa một hồ sơ chính, chặn ngay trong DB
  (t) => [
    uniqueIndex("one_primary_per_user").on(t.userId).where(sql`${t.isPrimary} = 1`),
    index("birth_profiles_user").on(t.userId),
  ],
);

export const charts = sqliteTable(
  "charts",
  {
    id: id(),
    profileId: text("profile_id").notNull().references(() => birthProfiles.id, { onDelete: "cascade" }),
    kind: text("kind", { enum: ["tu_vi", "than_so_hoc", "chiem_tinh"] }).notNull(),
    status: text("status", { enum: ["ok", "skipped", "error"] }).notNull(),
    data: text("data", { mode: "json" }),
    houseSystem: text("house_system"),
    calcVersion: integer("calc_version").notNull(),
    computedAt: integer("computed_at", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("charts_profile_kind").on(t.profileId, t.kind)],
);

export type BirthProfile = typeof birthProfiles.$inferSelect;
export type Chart = typeof charts.$inferSelect;
