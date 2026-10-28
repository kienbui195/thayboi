import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { signOut } from "@/app/actions/auth";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MON } from "@/content/mon";
import { requireUser } from "@/lib/auth/session";

// BR19: trang cá nhân không bao giờ lên Google
export const metadata: Metadata = { robots: { index: false, follow: false } };

async function Account() {
  const user = await requireUser();
  return <span className="hidden text-sm text-muted-foreground sm:inline">{user.email}</span>;
}

/** Khung trang tĩnh; mọi phần đọc phiên đăng nhập nằm trong Suspense (Cache Components). */
export default function PrivateLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader
        nav={
          <>
            <Link href="/trang-chu" className="hover:text-foreground">
              Trang chủ
            </Link>
            {MON.map((m) => (
              <Link key={m.slug} href={`/la-so/${m.slug}`} className="hover:text-foreground">
                {m.name}
              </Link>
            ))}
            <Link href="/ho-so" className="hover:text-foreground">
              Hồ sơ của tôi
            </Link>
          </>
        }
        actions={
          <form action={signOut} className="flex items-center gap-2">
            <Suspense>
              <Account />
            </Suspense>
            <Button type="submit" variant="ghost" size="sm">
              Đăng xuất
            </Button>
          </form>
        }
      />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-8">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>{children}</Suspense>
      </main>
    </>
  );
}
