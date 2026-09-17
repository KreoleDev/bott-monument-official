import { getStrapiMediaUrl, type HomepageSection } from "@/lib/strapi";
import type { Feature } from "@/lib/features";
import { FeaturedInGallery } from "./featured-in-gallery";

export function FeaturedIn({
  section,
  features,
}: {
  section: HomepageSection | null;
  features: Feature[];
}) {
  if (!section) return null;
  const covers = features.flatMap((cover) => {
    const src = getStrapiMediaUrl(cover.image);
    return src ? [{ ...cover, src }] : [];
  });
  if (!covers.length) return null;
  return <FeaturedInGallery section={section} covers={covers} />;
}
