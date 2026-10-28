import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import { PencilIcon, PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LinkButton } from "@/components/link-button";
import { ProfileActions } from "@/components/profile-actions";
import { Badge } from "@/components/ui/badge";
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/components/viewing-bar";
import { requireUser } from "@/lib/session";
import { MAX_PROFILES } from "@/lib/types";
import { listProfiles } from "@/lib/profiles";

export const metadata: Metadata = { title: "Hồ sơ của tôi" };

async function ProfilesPageContent() {
  await requireUser();
  const profiles = await listProfiles();
  if (profiles.length === 0) redirect("/ho-so/moi"); // BR16
  const full = profiles.length >= MAX_PROFILES;
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Hồ sơ của tôi</h1>
          <p className="text-sm text-muted-foreground">
            {profiles.length}/{MAX_PROFILES} hồ sơ. Hồ sơ chính (⭐) hiện mặc định ở mọi trang.
          </p>
        </div>
        {full ? (
          <Badge variant="secondary">Đã đủ {MAX_PROFILES} hồ sơ, không thêm được</Badge>
        ) : (
          <LinkButton href="/ho-so/moi">
            <PlusIcon data-icon="inline-start" />
            Thêm hồ sơ
          </LinkButton>
        )}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {profiles.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {p.name}
                {p.isPrimary && <Badge>⭐ Hồ sơ chính</Badge>}
              </CardTitle>
              <CardDescription>
                {p.gender === "male" ? "Nam" : "Nữ"} · {formatDate(p.birthDate)}
                {p.birthTime ? ` lúc ${p.birthTime}` : " · không rõ giờ"} · {p.placeName}
              </CardDescription>
              <CardAction>
                <LinkButton href={`/ho-so/${p.id}`} variant="ghost" size="icon-sm" aria-label={`Sửa ${p.name}`}>
                  <PencilIcon />
                </LinkButton>
              </CardAction>
            </CardHeader>
            <CardFooter>
              <ProfileActions id={p.id} name={p.name} isPrimary={p.isPrimary} isLast={profiles.length === 1} />
            </CardFooter>
          </Card>
        ))}
      </div>
    </>
  );
}

// Mỗi trang tự bọc phần đọc phiên/dữ liệu trong Suspense: khung trang render tĩnh, chuyển trang tức thì (Cache Components)
export default function ProfilesPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ProfilesPageContent />
    </Suspense>
  );
}
