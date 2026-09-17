import type { ComponentType } from "react";
import { Contact } from "@/components/contact";
import { FeaturedIn } from "@/components/featured-in";
import { Footer } from "@/components/footer";
import { Founder } from "@/components/founder";
import { Gallery } from "@/components/gallery";
import { Hero } from "@/components/hero";
import { MarqueeStrip } from "@/components/marquee-strip";
import { News } from "@/components/news";
import { Showroom } from "@/components/showroom";
import { Testimonials } from "@/components/testimonials";
import type { FragmentName } from "./types";

type FragmentEntry = {
  component: ComponentType<Record<string, unknown>>;
  placement: "main" | "chrome";
};

export const FRAGMENT_REGISTRY: Record<FragmentName, FragmentEntry> = {
  hero: { component: Hero as FragmentEntry["component"], placement: "main" },
  marquee: { component: MarqueeStrip as FragmentEntry["component"], placement: "main" },
  founder: { component: Founder as FragmentEntry["component"], placement: "main" },
  news: { component: News as FragmentEntry["component"], placement: "main" },
  "featured-in": { component: FeaturedIn as FragmentEntry["component"], placement: "main" },
  gallery: { component: Gallery as FragmentEntry["component"], placement: "main" },
  showroom: { component: Showroom as FragmentEntry["component"], placement: "main" },
  testimonials: { component: Testimonials as FragmentEntry["component"], placement: "main" },
  contact: { component: Contact as FragmentEntry["component"], placement: "main" },
  footer: { component: Footer as FragmentEntry["component"], placement: "chrome" },
};
