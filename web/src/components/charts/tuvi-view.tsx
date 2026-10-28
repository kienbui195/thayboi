import { Badge } from "@/components/ui/badge";
import { CUNG_TU_VI, THAN_CU } from "@/content/cung-tu-vi";
import {
  branchHanh,
  cucHanh,
  HANH_NAME,
  menhCucRelation,
  napAm,
  starHanh,
  type Hanh,
} from "@/lib/charts/ngu-hanh";
import type { TuViChart, TuViPalace, TuViStar } from "@/lib/charts/types";
import type { LuanGiaiMap } from "@/lib/types";
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

/**
 * Luận giải theo cung: mỗi cung có lời giải thích cung đó nói về gì, rồi tới lời của từng sao:
 * dòng `sao-cung:<sao>|<cung>` (riêng cho cung đó), chính tinh không có dòng riêng thì lấy dòng chung `sao:<sao>`.
 * Lời của sao soạn trên dashboard.
 */
function LuanGiaiTheoCung({ chart, luanGiai }: { chart: TuViChart; luanGiai: LuanGiaiMap }) {
  const byName = new Map(chart.palaces.map((p) => [p.name, p]));
  const sections = CUNG_TU_VI.flatMap((cung) => {
    const p = byName.get(cung.name);
    if (!p) return [];
    const lines = [
      ...p.majorStars.map((s) => ({ s, l: luanGiai[`sao-cung:${s.name}|${p.name}`] ?? luanGiai[`sao:${s.name}`] })),
      ...p.minorStars.map((s) => ({ s, l: luanGiai[`sao-cung:${s.name}|${p.name}`] })),
    ].filter((x) => x.l);
    return [{ palace: p, yNghia: cung.yNghia, lines }];
  });

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">Luận giải</h2>
      {sections.map(({ palace, yNghia, lines }) => (
        <div key={palace.name} className="flex flex-col gap-2 rounded-lg border p-4">
          <div className="flex flex-col gap-0.5">
            <h3 className={cn("font-semibold uppercase", palace.name === "Mệnh" && "text-primary")}>
              Cung {palace.name}
              {palace.isBody && " · Thân cư"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {yNghia}
              {palace.isBody && ` ${THAN_CU}`}
            </p>
          </div>
          {lines.length === 0 && <p className="text-sm italic text-muted-foreground">Chưa có lời luận giải cho các sao ở cung này.</p>}
          <ul className="flex flex-col gap-2 text-sm">
            {lines.map(({ s, l }) => (
              <li key={s.name}>
                <span className={cn("font-semibold", hanhText(starHanh(s.name)))}>
                  {s.name}
                  {s.brightness && ` (${s.brightness})`}
                </span>
                {l!.tieuDe && l!.tieuDe !== s.name && <span className="font-medium"> — {l!.tieuDe}</span>}: {l!.noiDung}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

export function TuViView({ chart, name, luanGiai }: { chart: TuViChart; name: string; luanGiai: LuanGiaiMap }) {
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
      <LuanGiaiTheoCung chart={chart} luanGiai={luanGiai} />
    </div>
  );
}
