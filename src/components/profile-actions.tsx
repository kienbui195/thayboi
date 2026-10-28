"use client";

import { StarIcon, Trash2Icon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { makePrimary, removeProfile } from "@/app/actions/profiles";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = { id: string; name: string; isPrimary: boolean; isLast: boolean };

/** Đặt làm hồ sơ chính và xóa. Nút xóa khóa kèm lý do theo BR11; server vẫn kiểm lại. */
export function ProfileActions({ id, name, isPrimary, isLast }: Props) {
  const [pending, start] = useTransition();
  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) =>
    start(async () => {
      const r = await fn();
      if (r.ok) toast.success(done);
      else toast.error(r.error);
    });

  const deleteBlocked = isLast ? "Cần giữ ít nhất một hồ sơ" : isPrimary ? "Hãy đặt hồ sơ khác làm hồ sơ chính trước khi xóa" : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {!isPrimary && (
        <Button variant="outline" size="sm" disabled={pending} onClick={() => run(() => makePrimary(id), `Đã đặt "${name}" làm hồ sơ chính`)}>
          <StarIcon data-icon="inline-start" />
          Đặt làm hồ sơ chính
        </Button>
      )}
      <AlertDialog>
        <AlertDialogTrigger
          render={
            <Button variant="ghost" size="sm" disabled={pending || !!deleteBlocked} title={deleteBlocked ?? undefined}>
              <Trash2Icon data-icon="inline-start" />
              Xóa
            </Button>
          }
        />
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa hồ sơ &quot;{name}&quot;?</AlertDialogTitle>
            <AlertDialogDescription>Hồ sơ và cả 3 lá số của hồ sơ này sẽ bị xóa, không lấy lại được.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Thôi</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={() => run(() => removeProfile(id), `Đã xóa "${name}"`)}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {deleteBlocked && <span className="text-xs text-muted-foreground">{deleteBlocked}</span>}
    </div>
  );
}
