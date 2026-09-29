import { getStrapiMediaUrl, type SectionContent } from "@/lib/strapi";
import type { GalleryItem } from "@/lib/gallery";
import { GalleryCarousel } from "./gallery-carousel";

export function Gallery({
  section,
  items,
  locale = "en",
}: {
  section: SectionContent | null;
  items: GalleryItem[];
  locale?: string;
}) {
  if (!section) return null;
  const images = items.flatMap((item) => {
    const src = getStrapiMediaUrl(item.image);
    return src ? [{ ...item, src }] : [];
  });
  if (!images.length) return null;
  return <GalleryCarousel section={section} items={images} locale={locale} />;
}
