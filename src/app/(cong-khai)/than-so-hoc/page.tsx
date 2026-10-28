import { MonArticle, monMetadata } from "@/components/mon-article";
import { MON } from "@/content/mon";

const m = MON[1];
export const metadata = monMetadata(m);

export default function Page() {
  return <MonArticle m={m} />;
}
