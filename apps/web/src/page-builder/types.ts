import type { Comment } from "@/lib/comments";
import type { Feature } from "@/lib/features";
import type { GalleryItem } from "@/lib/gallery";
import type { PressItem } from "@/lib/news";
import type { SiteSettings } from "@/lib/site-settings";
import type { SectionContent } from "@/lib/strapi";

export type PageExtras = {
  comments: Comment[];
  galleryItems: GalleryItem[];
  features: Feature[];
  pressItems: PressItem[];
  settings: SiteSettings | null;
};

export type FragmentName =
  | "hero"
  | "marquee"
  | "founder"
  | "news"
  | "featured-in"
  | "gallery"
  | "showroom"
  | "testimonials"
  | "contact"
  | "footer";

export type MappedFragment<P = Record<string, unknown>> = {
  key?: string;
  fragmentName: FragmentName;
  payload: P;
};

export type SectionMapper<P> = (section: SectionContent, extras: PageExtras) => P;
