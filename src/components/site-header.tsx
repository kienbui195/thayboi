import { SparklesIcon } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function SiteHeader({ nav, actions }: { nav: ReactNode; actions: ReactNode }) {
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <SparklesIcon className="text-primary" />
          Thầy Bói
        </Link>
        <nav className="flex flex-1 flex-wrap items-center gap-4 text-sm text-muted-foreground">{nav}</nav>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
    </header>
  );
}
