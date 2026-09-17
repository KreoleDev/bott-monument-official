import { cmsRead, cmsQuery } from "./cms-cache";
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

export type HomepageSection = {
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

export const HOMEPAGE_FIELDS = `      sectionKey
      contact { titleEmphasis counterText totalCommissions remainingCommissions inquiryLabel inquiryTypes namePlaceholder emailPlaceholder messagePlaceholder note successMessage phone studio email }
      footer { brand copyright tagline taglineEmphasis }
      showroom { visitTitle location appointment hours statistics { id value label } }
      galleryAccess { eyebrow title emphasis description requestLabel requestHref dismissLabel }
      eyebrow
      title
      description
      quote
      signature
      personName
      personRole
      backgroundColor
      textColor
      buttonLabel
      buttonHref
      sortOrder
      image {
        url
        alternativeText
      }
      video {
        url
        alternativeText
      }`;

export function getStrapiMediaUrl(media?: StrapiMedia | null) {
  if (!media?.url) return null;
  if (/^https?:\/\//i.test(media.url)) return media.url;
  const url = process.env.STRAPI_URL?.replace(/\/$/, "");
  if (!url || !media.url.startsWith("/") || media.url.startsWith("//")) return null;
  return `${url}${media.url}`;
}

export async function getHomepageSections(preview = false): Promise<HomepageSection[]> {
  return cmsRead(
    "homepage-sections",
    async () => {
      const data = await cmsQuery<{ homepageSections: HomepageSection[] }>(
        `query HomepageSections {
      homepageSections(status: ${preview ? "DRAFT" : "PUBLISHED"}, sort: ["sortOrder:asc", "sectionKey:asc"], pagination: {limit:100}) { ${HOMEPAGE_FIELDS} }
    }`,
        {},
        preview,
      );
      if (!Array.isArray(data.homepageSections)) throw new Error("Invalid homepage sections");
      return data.homepageSections;
    },
    [],
    preview,
  );
}
export async function getHomepageSection(sectionKey: string, preview = false) {
  return (
    (await getHomepageSections(preview)).find((section) => section.sectionKey === sectionKey) ??
    null
  );
}
