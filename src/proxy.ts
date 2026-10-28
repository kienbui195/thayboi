import { NextResponse, type NextRequest } from "next/server";
import { isPrivatePath } from "@/lib/site";

const SESSION_COOKIE = "tb_session";

/**
 * Kiểm tra nhanh theo cookie, chưa đọc DB. Kiểm tra thật nằm ở layout trang riêng tư (requireUser).
 * - Trang riêng tư mà không có cookie → về đăng nhập; luôn gắn X-Robots-Tag noindex (BR19).
 * - Đã đăng nhập mà mở "/" → vào thẳng trang 3 thẻ (US-09 A1).
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);

  if (pathname === "/" && hasSession) {
    return NextResponse.redirect(new URL("/trang-chu", request.url));
  }
  if (isPrivatePath(pathname)) {
    if (!hasSession) return NextResponse.redirect(new URL("/dang-nhap", request.url));
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/trang-chu/:path*", "/ho-so/:path*", "/la-so/:path*"],
};
