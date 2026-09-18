import type { HomepageSection } from "@/lib/strapi";
import type { FragmentName, PageExtras, SectionMapper } from "./types";

export const MAIN_FRAGMENT_KEYS = [
  "hero",
  "marquee",
  "founder",
  "news",
  "featured-in",
  "gallery",
  "showroom",
  "testimonials",
  "contact",
] as const satisfies readonly FragmentName[];

export const CHROME_FRAGMENT_KEYS = ["footer"] as const satisfies readonly FragmentName[];

export function mapHero(section: HomepageSection) {
  return { section };
}

export function mapMarquee(section: HomepageSection) {
  return { section };
}

export function mapFounder(section: HomepageSection) {
  return { section };
}

export function mapNews(section: HomepageSection, extras: PageExtras) {
  return { section, items: extras.pressItems };
}

export function mapFeaturedIn(section: HomepageSection, extras: PageExtras) {
  return { section, features: extras.features };
}

export function mapGallery(section: HomepageSection, extras: PageExtras) {
  return { section, items: extras.galleryItems };
}

export function mapShowroom(section: HomepageSection) {
  return { section };
}

export function mapTestimonials(section: HomepageSection, extras: PageExtras) {
  return { section, comments: extras.comments };
}

export function mapContact(section: HomepageSection) {
  return { section };
}

export function mapFooter(section: HomepageSection, extras: PageExtras) {
  return { section, settings: extras.settings };
}

export const MAPPERS = {
  hero: mapHero,
  marquee: mapMarquee,
  founder: mapFounder,
  news: mapNews,
  "featured-in": mapFeaturedIn,
  gallery: mapGallery,
  showroom: mapShowroom,
  testimonials: mapTestimonials,
  contact: mapContact,
  footer: mapFooter,
} as const satisfies Record<FragmentName, SectionMapper<unknown>>;
