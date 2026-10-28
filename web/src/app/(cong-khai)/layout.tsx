import Link from "next/link";
import { LinkButton } from "@/components/link-button";
import { SiteHeader } from "@/components/site-header";
import { MON } from "@/content/mon";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <SiteHeader
        nav={MON.map((m) => (
          <Link key={m.slug} href={`/${m.slug}`} className="hover:text-foreground">
            {m.name}
          </Link>
        ))}
        actions={
          <>
            <LinkButton href="/dang-nhap" variant="ghost" size="sm">
              Đăng nhập
            </LinkButton>
            <LinkButton href="/dang-ky" size="sm">
              Đăng ký
            </LinkButton>
          </>
        }
      />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-4 py-10">{children}</main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        Thầy Bói — nội dung mang tính tham khảo, giải trí.
      </footer>
    </>
  );
}
