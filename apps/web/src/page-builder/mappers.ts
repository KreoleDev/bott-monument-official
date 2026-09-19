import type { SectionContent } from "@/lib/strapi";
import type { FragmentName, PageExtras, SectionMapper } from "./types";

export const CHROME_FRAGMENT_KEYS = ["footer"] as const satisfies readonly FragmentName[];

export function mapHero(section: SectionContent) {
  return { section };
}

export function mapMarquee(section: SectionContent) {
  return { section };
}

export function mapFounder(section: SectionContent) {
  return { section };
}

export function mapNews(section: SectionContent, extras: PageExtras) {
  return { section, items: extras.pressItems };
}

export function mapFeaturedIn(section: SectionContent, extras: PageExtras) {
  return { section, features: extras.features };
}

export function mapGallery(section: SectionContent, extras: PageExtras) {
  return { section, items: extras.galleryItems };
}

export function mapShowroom(section: SectionContent) {
  return { section };
}

export function mapTestimonials(section: SectionContent, extras: PageExtras) {
  return { section, comments: extras.comments };
}

export function mapContact(section: SectionContent) {
  return { section };
}

export function mapFooter(section: SectionContent, extras: PageExtras) {
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
