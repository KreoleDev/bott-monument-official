export type ContactDetails = {
  titleEmphasis: string;
  counterText: string;
  totalCommissions: number;
  remainingCommissions: number;
  inquiryLabel: string;
  inquiryTypes: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  note: string;
  successMessage: string;
  phone: string;
  studio: string;
  email: string;
};
export type FooterDetails = {
  brand: string;
  copyright: string;
  tagline: string;
  taglineEmphasis: string;
};

export type GalleryAccess = {
  eyebrow: string | null;
  title: string | null;
  emphasis: string | null;
  description: string | null;
  requestLabel: string | null;
  requestHref: string | null;
  dismissLabel: string | null;
};

export type ShowroomDetails = {
  visitTitle: string | null;
  location: string | null;
  appointment: string | null;
  hours: string | null;
  statistics: { id: string; value: string; label: string }[];
};

export type SectionContent = {
  contact: ContactDetails | null;
  footer: FooterDetails | null;
  showroom: ShowroomDetails | null;
  galleryAccess: GalleryAccess | null;
  sectionKey: string;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
  quote: string | null;
  signature: string | null;
  personName: string | null;
  personRole: string | null;
  backgroundColor: string | null;
  textColor: string | null;
  buttonLabel: string | null;
  buttonHref: string | null;
  sortOrder: number | null;
  image: StrapiMedia | null;
  video: StrapiMedia | null;
};

export type StrapiMedia = {
  url: string;
  alternativeText: string | null;
};

export function getStrapiMediaUrl(media?: StrapiMedia | null) {
  if (!media?.url) return null;
  if (/^https?:\/\//i.test(media.url)) return media.url;
  const url = process.env.STRAPI_URL?.replace(/\/$/, "");
  if (!url || !media.url.startsWith("/") || media.url.startsWith("//")) return null;
  return `${url}${media.url}`;
}
