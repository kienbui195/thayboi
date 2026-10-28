"use client";

import { RefreshCwIcon } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { recompute } from "@/app/actions/profiles";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ChartKind } from "@/lib/charts";

export function RecomputeButton({ profileId, kind }: { profileId: string; kind: ChartKind }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await recompute(profileId, kind);
          if (r.ok) toast.success("Đã tính lại lá số");
          else toast.error(r.error); // AC-09.2: lá số cũ giữ nguyên
        })
      }
    >
      {pending ? <Spinner data-icon="inline-start" /> : <RefreshCwIcon data-icon="inline-start" />}
      Tính lại
    </Button>
  );
}
