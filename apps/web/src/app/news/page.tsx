import Link from "next/link";
import { News } from "@/components/news";
import { getPressItems } from "@/lib/news";

export const metadata = { title: "Press Coverage | Bott Monument" };

export default async function NewsPage() {
  const items = await getPressItems();
  return <main>
    <nav className="news-back-nav" aria-label="Back to main site"><Link href="/">← Bott Monument</Link></nav>
    <News items={items} all />
  </main>;
}
