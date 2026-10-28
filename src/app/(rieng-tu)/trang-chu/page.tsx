import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { ViewingBar } from "@/components/viewing-bar";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MON } from "@/content/mon";
import { requireUser } from "@/lib/auth/session";
import { resolveViewedProfile } from "@/lib/profiles";

export const metadata: Metadata = { title: "Trang chủ" };

async function HomePageContent({ searchParams }: PageProps<"/trang-chu">) {
  const user = await requireUser();
  const { "ho-so": requested } = await searchParams;
  const { viewed, all } = await resolveViewedProfile(user.id, typeof requested === "string" ? requested : undefined);
  return (
    <>
      <ViewingBar title="Trang chủ" viewed={viewed} all={all} />
      <div className="grid gap-4 md:grid-cols-3">
        {MON.map((m) => (
          <Link key={m.slug} href={`/la-so/${m.slug}?ho-so=${viewed.id}`} className="group">
            <Card className="h-full transition-colors group-hover:bg-muted/50">
              <CardHeader>
                <CardTitle>{m.name}</CardTitle>
                <CardDescription>{m.short}</CardDescription>
              </CardHeader>
              <CardFooter className="mt-auto text-sm font-medium text-primary">Xem lá số của {viewed.name} →</CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}

// Mỗi trang tự bọc phần đọc phiên/dữ liệu trong Suspense: khung trang render tĩnh, chuyển trang tức thì (Cache Components)
export default function HomePage(props: PageProps<"/trang-chu">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <HomePageContent {...props} />
    </Suspense>
  );
}
