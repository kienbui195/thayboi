import type { BirthProfile } from "@/lib/types";
import { ProfileSwitcher } from "./profile-switcher";

/** Dòng đầu trang: tiêu đề + đang xem hồ sơ nào (AC-03.1). */
export function ViewingBar({ title, viewed, all }: { title: string; viewed: BirthProfile; all: BirthProfile[] }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">
          Đang xem: <span className="font-medium text-foreground">{viewed.name}</span> · sinh{" "}
          {formatDate(viewed.birthDate)}
          {viewed.birthTime ? ` lúc ${viewed.birthTime}` : " (không rõ giờ)"} tại {viewed.placeName}
        </p>
      </div>
      {all.length > 1 && (
        <ProfileSwitcher
          profiles={all.map((p) => ({ id: String(p.id), name: p.name, isPrimary: p.isPrimary }))}
          value={String(viewed.id)}
        />
      )}
    </div>
  );
}

export function formatDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
