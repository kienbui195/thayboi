import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BIG_THREE, SIGN_MEANINGS } from "@/content/y-nghia";
import { SIGNS, signOf, type AstrologyChart } from "@/lib/charts/astrology";

const fmt = (lon: number) => {
  const { sign, degree } = signOf(lon);
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${String(m).padStart(2, "0")}′ ${SIGNS[sign]}`;
};

const offset = (min: number) => `UTC${min >= 0 ? "+" : "−"}${Math.abs(min) / 60}`;

export function AstrologyView({ chart }: { chart: AstrologyChart }) {
  const [sun, moon] = chart.planets;
  const big = [
    { label: "Mặt Trời", hint: BIG_THREE.sun, lon: sun.longitude },
    { label: "Mặt Trăng", hint: BIG_THREE.moon, lon: moon.longitude },
    ...(chart.ascendant !== null ? [{ label: "Cung Mọc", hint: BIG_THREE.asc, lon: chart.ascendant }] : []),
  ];
  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Tính lúc {chart.utc.replace("T", " ").slice(0, 16)} UTC (giờ địa phương {offset(chart.utcOffsetMinutes)})
        {chart.houseSystem && ` · hệ nhà ${chart.houseSystem === "placidus" ? "Placidus" : "Whole Sign"}`}
      </p>
      {chart.note && (
        <Alert>
          <AlertDescription>{chart.note}</AlertDescription>
        </Alert>
      )}
      <div className="grid gap-4 md:grid-cols-3">
        {big.map((b) => (
          <Card key={b.label}>
            <CardHeader>
              <CardDescription>{b.label}</CardDescription>
              <CardTitle>{fmt(b.lon)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p>{SIGN_MEANINGS[signOf(b.lon).sign]}</p>
              <p className="text-muted-foreground">{b.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-semibold">Vị trí các thiên thể</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Thiên thể</TableHead>
              <TableHead>Vị trí</TableHead>
              {chart.houses && <TableHead>Nhà</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {chart.planets.map((p) => (
              <TableRow key={p.key}>
                <TableCell className="font-medium">
                  {p.name} {p.retrograde && <Badge variant="outline">nghịch hành</Badge>}
                </TableCell>
                <TableCell>{fmt(p.longitude)}</TableCell>
                {chart.houses && <TableCell>{p.house}</TableCell>}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      {chart.houses && chart.midheaven !== null && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">12 nhà</h2>
          <p className="text-sm text-muted-foreground">Thiên Đỉnh (MC): {fmt(chart.midheaven)}</p>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 md:grid-cols-4">
            {chart.houses.map((c, i) => (
              <div key={i} className="rounded-md border px-3 py-2">
                <span className="font-medium">Nhà {i + 1}:</span> {fmt(c)}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
