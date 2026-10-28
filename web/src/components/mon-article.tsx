import { ArrowRightIcon } from "lucide-react";
import type { Metadata } from "next";
import { LinkButton } from "@/components/link-button";
import type { Mon } from "@/content/mon";

export function monMetadata(m: Mon): Metadata {
  return {
    title: { absolute: m.title },
    description: m.description,
    alternates: { canonical: `/${m.slug}` },
    openGraph: { title: m.title, description: m.description, url: `/${m.slug}` },
  };
}

/** Trang giới thiệu một môn cho Google (BR18). */
export function MonArticle({ m }: { m: Mon }) {
  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-balance">{m.title}</h1>
      {m.intro.map((p) => (
        <p key={p} className="leading-relaxed text-muted-foreground">
          {p}
        </p>
      ))}
      <section className="flex flex-col gap-3">
        <h2 className="text-xl font-semibold">Lá số {m.name.toLowerCase()} cho bạn biết</h2>
        <ul className="flex list-disc flex-col gap-1 pl-6">
          {m.sees.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
      </section>
      <div>
        <LinkButton href="/dang-ky" size="lg">
          Lập lá số {m.name.toLowerCase()}
          <ArrowRightIcon data-icon="inline-end" />
        </LinkButton>
      </div>
    </article>
  );
}
