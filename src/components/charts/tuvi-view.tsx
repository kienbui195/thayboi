import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MAJOR_STAR_MEANINGS } from "@/content/y-nghia";
import type { TuViChart, TuViPalace, TuViStar } from "@/lib/charts/tuvi";
import { cn } from "@/lib/utils";

// Vị trí 12 địa chi trên lá số vuông truyền thống (4×4, giữa là thông tin chung)
const GRID: Record<string, string> = {
  Tỵ: "col-start-1 row-start-1", Ngọ: "col-start-2 row-start-1", Mùi: "col-start-3 row-start-1", Thân: "col-start-4 row-start-1",
  Thìn: "col-start-1 row-start-2", Dậu: "col-start-4 row-start-2",
  Mão: "col-start-1 row-start-3", Tuất: "col-start-4 row-start-3",
  Dần: "col-start-1 row-start-4", Sửu: "col-start-2 row-start-4", Tý: "col-start-3 row-start-4", Hợi: "col-start-4 row-start-4",
};

const starLabel = (s: TuViStar) => `${s.name}${s.brightness ? ` (${s.brightness})` : ""}${s.mutagen ? ` · Hóa ${s.mutagen}` : ""}`;

function Palace({ p }: { p: TuViPalace }) {
  const isSoul = p.name === "Mệnh";
  return (
    <div className={cn("flex min-h-36 flex-col gap-1 rounded-md border p-2 text-xs", GRID[p.branch], isSoul && "border-primary")}>
      <div className="flex items-center justify-between gap-1">
        <span className="font-semibold uppercase">{p.name}</span>
        {p.isBody && <Badge variant="secondary">Thân</Badge>}
      </div>
      <div className="text-muted-foreground">
        {p.stem} {p.branch} · {p.decadal[0]}–{p.decadal[1]}
      </div>
      {p.majorStars.map((s) => (
        <div key={s.name} className="font-medium text-primary">
          {starLabel(s)}
        </div>
      ))}
      <div className="text-muted-foreground">{p.minorStars.map(starLabel).join(", ")}</div>
    </div>
  );
}

export function TuViView({ chart }: { chart: TuViChart }) {
  const majorInSoul = chart.palaces.find((p) => p.name === "Mệnh")?.majorStars ?? [];
  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto">
        <div className="grid min-w-[44rem] grid-cols-4 grid-rows-4 gap-1">
          {chart.palaces.map((p) => (
            <Palace key={p.branch} p={p} />
          ))}
          <div className="col-span-2 col-start-2 row-span-2 row-start-2 flex flex-col justify-center gap-1 rounded-md bg-muted p-4 text-sm">
            <div>Dương lịch: {chart.solarDate} (giờ Việt Nam)</div>
            <div>{chart.lunarDate}</div>
            <div>Bát tự: {chart.chineseDate}</div>
            <div>
              {chart.hourName} ({chart.hourRange})
            </div>
            <div>Cục: {chart.fiveElementsClass}</div>
            <div>
              Mệnh chủ: {chart.soulStar} · Thân chủ: {chart.bodyStar}
            </div>
          </div>
        </div>
      </div>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Chính tinh ở cung Mệnh</h2>
        {majorInSoul.length === 0 ? (
          <p className="text-sm text-muted-foreground">Cung Mệnh vô chính diệu (không có chính tinh), xem các sao ở cung đối diện (Thiên Di).</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sao</TableHead>
                <TableHead>Ý nghĩa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {majorInSoul.map((s) => (
                <TableRow key={s.name}>
                  <TableCell className="font-medium">{starLabel(s)}</TableCell>
                  <TableCell className="whitespace-normal">{MAJOR_STAR_MEANINGS[s.name] ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
