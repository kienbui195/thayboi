import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MAJOR_STAR_MEANINGS } from "@/content/y-nghia";
import {
  branchHanh,
  cucHanh,
  HANH_NAME,
  menhCucRelation,
  napAm,
  starHanh,
  type Hanh,
} from "@/lib/charts/ngu-hanh";
import type { TuViChart, TuViPalace, TuViStar } from "@/lib/charts/tuvi";
import { cn } from "@/lib/utils";

// Vị trí 12 địa chi trên lá số vuông truyền thống (4×4, giữa là thông tin chung)
const GRID: Record<string, string> = {
  Tỵ: "col-start-1 row-start-1", Ngọ: "col-start-2 row-start-1", Mùi: "col-start-3 row-start-1", Thân: "col-start-4 row-start-1",
  Thìn: "col-start-1 row-start-2", Dậu: "col-start-4 row-start-2",
  Mão: "col-start-1 row-start-3", Tuất: "col-start-4 row-start-3",
  Dần: "col-start-1 row-start-4", Sửu: "col-start-2 row-start-4", Tý: "col-start-3 row-start-4", Hợi: "col-start-4 row-start-4",
};

// Tên lớp viết đủ để Tailwind nhận ra
const TEXT: Record<Hanh, string> = {
  kim: "text-hanh-kim", moc: "text-hanh-moc", thuy: "text-hanh-thuy", hoa: "text-hanh-hoa", tho: "text-hanh-tho",
};
const BG: Record<Hanh, string> = {
  kim: "bg-hanh-kim", moc: "bg-hanh-moc", thuy: "bg-hanh-thuy", hoa: "bg-hanh-hoa", tho: "bg-hanh-tho",
};
const HANH_ORDER: Hanh[] = ["kim", "moc", "thuy", "hoa", "tho"];

// Ký hiệu độ sáng như trên lá số giấy
const BRIGHT: Record<string, string> = { Miếu: "M", Vượng: "V", Đắc: "Đ", Lợi: "L", Bình: "B", Bất: "Bt", Hãm: "H" };

// Tứ Hóa: Lộc, Quyền, Khoa, Kỵ
const MUTAGEN: Record<string, Hanh> = { Lộc: "moc", Quyền: "hoa", Khoa: "kim", Kỵ: "thuy" };

const hanhText = (h: Hanh | undefined) => (h ? TEXT[h] : "text-muted-foreground");

function Star({ s, size }: { s: TuViStar; size: "major" | "minor" }) {
  const h = starHanh(s.name);
  return (
    <span
      className={cn("inline-flex items-baseline gap-0.5", hanhText(h), size === "major" ? "text-sm font-bold uppercase" : "text-xs font-medium")}
      title={[s.name, h && `hành ${HANH_NAME[h]}`, s.brightness, s.mutagen && `Hóa ${s.mutagen}`].filter(Boolean).join(" · ")}
    >
      {s.name}
      {s.brightness && <sup className="text-[0.65em] font-semibold normal-case opacity-80">{BRIGHT[s.brightness] ?? s.brightness}</sup>}
      {s.mutagen && (
        <span className={cn("ml-0.5 rounded px-1 text-[0.65rem] font-semibold normal-case text-background", BG[MUTAGEN[s.mutagen]])}>
          {s.mutagen}
        </span>
      )}
    </span>
  );
}

function Palace({ p }: { p: TuViPalace }) {
  const isSoul = p.name === "Mệnh";
  const bh = branchHanh(p.branch);
  return (
    <div
      className={cn(
        "relative flex min-h-44 flex-col gap-1.5 rounded-lg border bg-background p-2",
        GRID[p.branch],
        isSoul && "border-primary bg-primary/5 ring-2 ring-primary/25",
      )}
    >
      <div className={cn("absolute inset-x-2 top-0 h-0.5 rounded-full opacity-70", bh && BG[bh])} />
      <div className="flex items-start justify-between gap-1">
        <div className="flex flex-col">
          <span className={cn("text-xs font-bold tracking-wide uppercase", isSoul && "text-primary")}>{p.name}</span>
          <span className="text-[0.7rem] text-muted-foreground">
            {p.stem} <span className={cn("font-semibold", hanhText(bh))}>{p.branch}</span>
          </span>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-sm font-semibold tabular-nums text-muted-foreground">{p.decadal[0]}</span>
          {p.isBody && <Badge variant="secondary">Thân</Badge>}
        </div>
      </div>

      <div className="flex flex-col items-center gap-0.5 py-1 text-center">
        {p.majorStars.length === 0 ? (
          <span className="text-xs italic text-muted-foreground">Vô chính diệu</span>
        ) : (
          p.majorStars.map((s) => <Star key={s.name} s={s} size="major" />)
        )}
      </div>

      <div className="flex flex-wrap gap-x-2 gap-y-0.5">
        {p.minorStars.map((s) => (
          <Star key={s.name} s={s} size="minor" />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-1.5 text-[0.68rem] leading-tight">
        {p.adjectiveStars.map((s) => (
          <span key={s.name} className={cn("opacity-85", hanhText(starHanh(s.name)))}>
            {s.name}
          </span>
        ))}
      </div>

      <div className="mt-auto flex justify-between border-t pt-1 text-[0.68rem] text-muted-foreground">
        <span>{p.changsheng}</span>
        <span className="tabular-nums">
          {p.decadal[0]}–{p.decadal[1]}
        </span>
      </div>
    </div>
  );
}

function Center({ chart, name }: { chart: TuViChart; name: string }) {
  const yearCanChi = chart.chineseDate.split("-")[0].trim();
  const menh = napAm(yearCanChi);
  const cuc = cucHanh(chart.fiveElementsClass);
  const rel = menh && cuc ? menhCucRelation(menh.hanh, cuc) : null;
  return (
    <div className="col-span-2 col-start-2 row-span-2 row-start-2 flex flex-col items-center justify-center gap-3 rounded-lg border bg-gradient-to-b from-muted/60 to-muted p-4 text-center">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs tracking-[0.3em] text-muted-foreground uppercase">Lá số tử vi</span>
        <span className="text-xl font-bold">{name}</span>
      </div>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-left text-sm">
        <dt className="text-muted-foreground">Dương lịch</dt>
        <dd>
          {chart.solarDate.split("-").reverse().join("/")}, {chart.hourName.toLowerCase()} ({chart.hourRange})
        </dd>
        <dt className="text-muted-foreground">Âm lịch</dt>
        <dd>{chart.lunarDate.replace(/^Âm lịch /, "")}</dd>
        <dt className="text-muted-foreground">Năm</dt>
        <dd>
          {yearCanChi} · tuổi {chart.zodiac}
        </dd>
        <dt className="text-muted-foreground">Bản mệnh</dt>
        <dd className={cn("font-semibold", hanhText(menh?.hanh))}>{menh?.name ?? "—"}</dd>
        <dt className="text-muted-foreground">Cục</dt>
        <dd className={cn("font-semibold", hanhText(cuc))}>{chart.fiveElementsClass}</dd>
        <dt className="text-muted-foreground">Mệnh chủ</dt>
        <dd>
          {chart.soulStar} · Thân chủ {chart.bodyStar}
        </dd>
      </dl>
      {rel && <Badge variant={rel.tone === "bad" ? "destructive" : rel.tone === "good" ? "default" : "secondary"}>{rel.text}</Badge>}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs">
        {HANH_ORDER.map((h) => (
          <span key={h} className="inline-flex items-center gap-1">
            <span className={cn("size-2.5 rounded-full", BG[h])} />
            {HANH_NAME[h]}
          </span>
        ))}
      </div>
      <p className="text-[0.68rem] text-muted-foreground">
        M Miếu · V Vượng · Đ Đắc · L Lợi · B Bình · H Hãm · giờ quy về giờ Việt Nam
      </p>
    </div>
  );
}

export function TuViView({ chart, name }: { chart: TuViChart; name: string }) {
  const majorInSoul = chart.palaces.find((p) => p.name === "Mệnh")?.majorStars ?? [];
  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto rounded-xl border-2 bg-card p-1.5 shadow-sm">
        <div className="grid min-w-[56rem] grid-cols-4 grid-rows-4 gap-1.5">
          {chart.palaces.map((p) => (
            <Palace key={p.branch} p={p} />
          ))}
          <Center chart={chart} name={name} />
        </div>
      </div>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Chính tinh ở cung Mệnh</h2>
        {majorInSoul.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Cung Mệnh vô chính diệu (không có chính tinh), xem các sao ở cung đối diện (Thiên Di).
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sao</TableHead>
                <TableHead>Hành</TableHead>
                <TableHead>Ý nghĩa</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {majorInSoul.map((s) => {
                const h = starHanh(s.name);
                return (
                  <TableRow key={s.name}>
                    <TableCell className={cn("font-semibold", hanhText(h))}>
                      {s.name}
                      {s.brightness && ` (${s.brightness})`}
                    </TableCell>
                    <TableCell className={hanhText(h)}>{h ? HANH_NAME[h] : "—"}</TableCell>
                    <TableCell className="whitespace-normal">{MAJOR_STAR_MEANINGS[s.name] ?? "—"}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </section>
    </div>
  );
}
