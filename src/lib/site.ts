export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
export const SITE_NAME = "Thầy Bói";

/** Trang công khai cho Google (BR18, Q14 = 4 trang). Thêm trang công khai thì thêm vào đây. */
export const PUBLIC_PAGES = ["/", "/tu-vi", "/than-so-hoc", "/chiem-tinh"] as const;

/** Trang cần đăng nhập: noindex, không vào sitemap, robots chặn (BR19). */
export const PRIVATE_PREFIXES = ["/trang-chu", "/ho-so", "/la-so"] as const;

export const isPrivatePath = (path: string) =>
  PRIVATE_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
