import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileForm } from "@/components/profile-form";
import { requireUser } from "@/lib/auth/session";
import { getProfile } from "@/lib/profiles";

export const metadata: Metadata = { title: "Sửa hồ sơ" };

async function EditProfilePageContent({ params }: PageProps<"/ho-so/[id]">) {
  const user = await requireUser();
  const profile = await getProfile(user.id, (await params).id);
  if (!profile) notFound(); // hồ sơ của người khác coi như không có (BR7)
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">Sửa hồ sơ {profile.name}</h1>
        <p className="text-sm text-muted-foreground">Lưu xong, cả 3 lá số được tính lại theo thông tin mới.</p>
      </div>
      <ProfileForm profile={profile} cancelHref="/ho-so" />
    </>
  );
}

// Mỗi trang tự bọc phần đọc phiên/dữ liệu trong Suspense: khung trang render tĩnh, chuyển trang tức thì (Cache Components)
export default function EditProfilePage(props: PageProps<"/ho-so/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <EditProfilePageContent {...props} />
    </Suspense>
  );
}
