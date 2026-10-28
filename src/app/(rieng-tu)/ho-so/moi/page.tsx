import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { requireUser } from "@/lib/auth/session";
import { MAX_PROFILES } from "@/lib/profile-input";
import { listProfiles } from "@/lib/profiles";

export const metadata: Metadata = { title: "Thêm hồ sơ" };

export default async function NewProfilePage() {
  const user = await requireUser();
  const count = (await listProfiles(user.id)).length;
  const first = count === 0;
  return (
    <>
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{first ? "Tạo hồ sơ đầu tiên" : "Thêm hồ sơ"}</h1>
        <p className="text-sm text-muted-foreground">
          {first
            ? "Nhập thông tin sinh của bạn. Hồ sơ này sẽ là hồ sơ chính, đổi được sau."
            : "Hồ sơ cho người thân, bạn bè. Thông tin chỉ mình bạn xem được."}
        </p>
      </div>
      {count >= MAX_PROFILES ? (
        <Alert>
          <AlertTitle>Đã đủ {MAX_PROFILES} hồ sơ</AlertTitle>
          <AlertDescription>
            Xóa bớt một hồ sơ ở <Link href="/ho-so">Hồ sơ của tôi</Link> để thêm hồ sơ mới.
          </AlertDescription>
        </Alert>
      ) : (
        <ProfileForm cancelHref={first ? undefined : "/ho-so"} />
      )}
    </>
  );
}
