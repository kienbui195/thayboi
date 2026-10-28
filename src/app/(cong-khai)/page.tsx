import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/link-button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { MON } from "@/content/mon";

export default function LandingPage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col items-center gap-5 py-10 text-center">
        <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-balance">
          Nhập ngày sinh một lần, xem cả tử vi, thần số học và chiêm tinh
        </h1>
        <p className="max-w-xl text-lg text-muted-foreground text-pretty">
          Không phải gõ lại ngày giờ sinh ở ba trang khác nhau. Lưu hồ sơ cho bạn và người thân, mở ra là thấy lá số.
        </p>
        <LinkButton href="/dang-ky" size="lg">
          Lập lá số miễn phí
          <ArrowRightIcon data-icon="inline-end" />
        </LinkButton>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {MON.map((m) => (
          <Card key={m.slug}>
            <CardHeader>
              <CardTitle>
                <h2>{m.name}</h2>
              </CardTitle>
              <CardDescription>{m.short}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href={`/${m.slug}`} className="text-sm font-medium text-primary hover:underline">
                Tìm hiểu về {m.name.toLowerCase()}
              </Link>
            </CardFooter>
          </Card>
        ))}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold">Vì sao lá số ở đây đáng tin hơn</h2>
        <ul className="flex list-disc flex-col gap-2 pl-6 text-muted-foreground">
          <li>Nơi sinh chọn từ danh sách, app tự lấy tọa độ và múi giờ — không phải tự gõ kinh độ, vĩ độ.</li>
          <li>Giờ sinh quy đổi theo múi giờ lúc bạn sinh. Ví dụ người sinh ở Sài Gòn năm 1970 dùng UTC+8, không phải UTC+7.</li>
          <li>Lá số được lưu lại. Khi cách tính được cải tiến, lá số cũ có nhãn &quot;Bản cũ&quot; để bạn chủ động tính lại.</li>
          <li>Hồ sơ và lá số chỉ mình bạn xem được, không bao giờ xuất hiện trên Google.</li>
        </ul>
      </section>
    </div>
  );
}
