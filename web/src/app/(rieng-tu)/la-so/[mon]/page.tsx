import { Suspense } from "react";
import { PageSkeleton } from "@/components/page-skeleton";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AstrologyView } from "@/components/charts/astrology-view";
import { NumerologyView } from "@/components/charts/numerology-view";
import { RecomputeButton } from "@/components/charts/recompute-button";
import { TuViView } from "@/components/charts/tuvi-view";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ViewingBar } from "@/components/viewing-bar";
import { MON, monBySlug } from "@/content/mon";
import { requireUser } from "@/lib/session";
import type { AstrologyChart, NumerologyChart, TuViChart } from "@/lib/charts/types";
import { getChart, resolveViewedProfile } from "@/lib/profiles";

export function generateStaticParams() {
  return MON.map((m) => ({ mon: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/la-so/[mon]">): Promise<Metadata> {
  const m = monBySlug((await params).mon);
  return { title: m ? `Lá số ${m.name.toLowerCase()}` : "Lá số" };
}

async function ChartPageContent({ params, searchParams }: PageProps<"/la-so/[mon]">) {
  const m = monBySlug((await params).mon);
  if (!m) notFound();
  await requireUser();
  const { "ho-so": requested } = await searchParams;
  const { viewed, all } = await resolveViewedProfile(typeof requested === "string" ? requested : undefined);
  const res = await getChart(viewed.id, m.kind);
  const chart = res?.chart;
  const luanGiai = res?.luanGiai ?? {};

  return (
    <>
      <ViewingBar title={`Lá số ${m.name.toLowerCase()}`} viewed={viewed} all={all} />

      {chart?.status === "ok" && chart.outdated && (
        <Alert>
          <AlertTitle className="flex items-center gap-2">
            <Badge variant="secondary">Bản cũ</Badge>
            Lá số này tính bằng cách tính cũ
          </AlertTitle>
          <AlertDescription>Cách tính đã được cập nhật. Bấm &quot;Tính lại&quot; để xem bản mới.</AlertDescription>
          <AlertAction>
            <RecomputeButton profileId={viewed.id} kind={m.kind} />
          </AlertAction>
        </Alert>
      )}

      {!chart || chart.status === "error" ? (
        <Alert variant="destructive">
          <AlertDescription>Chưa lập được lá số, thử lại sau.</AlertDescription>
        </Alert>
      ) : chart.status === "skipped" ? (
        <Alert>
          <AlertTitle>Cần giờ sinh để lập lá số tử vi</AlertTitle>
          <AlertDescription>
            Tử vi an sao theo giờ sinh. <Link href={`/ho-so/${viewed.id}`}>Bổ sung giờ sinh</Link> cho hồ sơ {viewed.name} để
            xem lá số.
          </AlertDescription>
        </Alert>
      ) : m.kind === "tu_vi" ? (
        <TuViView chart={chart.data as TuViChart} name={viewed.name} luanGiai={luanGiai} />
      ) : m.kind === "than_so_hoc" ? (
        <NumerologyView chart={chart.data as NumerologyChart} birthDate={viewed.birthDate} luanGiai={luanGiai} />
      ) : (
        <AstrologyView chart={chart.data as AstrologyChart} luanGiai={luanGiai} />
      )}
    </>
  );
}

// Mỗi trang tự bọc phần đọc phiên/dữ liệu trong Suspense: khung trang render tĩnh, chuyển trang tức thì (Cache Components)
export default function ChartPage(props: PageProps<"/la-so/[mon]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <ChartPageContent {...props} />
    </Suspense>
  );
}
