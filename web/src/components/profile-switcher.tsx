"use client";

import { usePathname, useRouter } from "next/navigation";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Option = { id: string; name: string; isPrimary: boolean };

/** Chọn hồ sơ để xem. Chỉ đổi hồ sơ cho lần xem này, không đổi hồ sơ chính (BR13). */
export function ProfileSwitcher({ profiles, value }: { profiles: Option[]; value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const items = profiles.map((p) => ({ value: p.id, label: p.isPrimary ? `⭐ ${p.name}` : p.name }));
  return (
    <Select
      items={items}
      value={value}
      onValueChange={(id) => {
        if (id) router.push(`${pathname}?ho-so=${id}`);
      }}
    >
      <SelectTrigger aria-label="Đang xem hồ sơ" className="min-w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {items.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
