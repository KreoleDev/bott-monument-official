export type ContactDetails = {
  titleEmphasis: string;
  inquiryLabel: string;
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
  facebookUrl: string | null;
  instagramUrl: string | null;
  youtubeUrl: string | null;
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
  visible: boolean | null;
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
  width?: number | null;
  height?: number | null;
  hash?: string | null;
  updatedAt?: string | null;
};

export function getStrapiMediaUrl(media?: StrapiMedia | null, version?: string | null) {
  if (!media?.url) return null;
  const cacheVersion = version || media.updatedAt || media.hash;
  const withVersion = (value: string) => {
    if (!cacheVersion) return value;
    const url = new URL(value);
    url.searchParams.set("v", cacheVersion);
    return url.toString();
  };
  if (/^https?:\/\//i.test(media.url)) return withVersion(media.url);
  const origin = process.env.STRAPI_URL?.replace(/\/$/, "");
  if (!origin || !media.url.startsWith("/") || media.url.startsWith("//")) return null;
  return withVersion(`${origin}${media.url}`);
}
