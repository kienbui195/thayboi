import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { personalYear, type NumerologyChart } from "@/lib/charts/types";
import type { LuanGiaiMap } from "@/lib/types";

export function NumerologyView({ chart, birthDate, luanGiai }: { chart: NumerologyChart; birthDate: string; luanGiai: LuanGiaiMap }) {
  const year = new Date().getFullYear();
  const items = [
    { label: "Số chủ đạo", hint: "Con đường cả đời, tính từ ngày sinh", n: chart.lifePath },
    { label: "Số sứ mệnh", hint: "Điều bạn đến để làm, tính từ cả họ tên", n: chart.destiny },
    { label: "Số linh hồn", hint: "Mong muốn bên trong, từ các nguyên âm của tên", n: chart.soulUrge },
    { label: "Số nhân cách", hint: "Cách người khác nhìn bạn, từ các phụ âm của tên", n: chart.personality },
    { label: "Số ngày sinh", hint: "Năng khiếu tự nhiên", n: chart.birthday },
    // Năm cá nhân đổi theo năm nên tính lúc mở, không lưu (Q8)
    { label: `Năm cá nhân ${year}`, hint: "Chủ đề của năm nay", n: personalYear(birthDate, year) },
  ];
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Tên dùng để tính: <span className="font-mono text-foreground">{chart.normalizedName}</span>
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((it) => {
          const m = luanGiai[`so:${it.n}`];
          return (
            <Card key={it.label}>
              <CardHeader>
                <CardDescription>{it.label}</CardDescription>
                <CardTitle className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">{it.n}</span>
                  <span>{m?.tieuDe}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p>{m?.noiDung ?? "Chưa có luận giải cho số này."}</p>
                <p className="text-muted-foreground">{it.hint}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
