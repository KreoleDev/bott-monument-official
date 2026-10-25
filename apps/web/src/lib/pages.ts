import { cmsQuery, cmsRead } from "./cms-cache";
import { HOME_PAGE_QUERY } from "./page-query";
import { DEFAULT_LOCALE } from "./locale";
import type { FooterDetails, SectionContent, StrapiMedia } from "./strapi";

export const ITEM_RELATIONS = ["comments", "features", "galleryItems", "pressItems"] as const;
type Selection = { nodes: { documentId: string }[] };
export type PageBlock = Partial<SectionContent> & {
  id: string;
  __typename: string;
  items?: { label: string }[];
} & Partial<Record<`${(typeof ITEM_RELATIONS)[number]}_connection`, Selection>>;
export type CmsPage = {
  documentId: string;
  title: string;
  locale: string;
  localizations: { locale: string }[];
  seo: {
    metaTitle: string | null;
    metaDescription: string | null;
    metaImage: StrapiMedia | null;
  } | null;
  header: {
    siteName: string | null;
    logo: StrapiMedia | null;
    links: { label: string; href: string }[];
  } | null;
  hero: PageBlock | null;
  footer: FooterDetails | null;
  privateGallery: {
    eyebrow?: string | null;
    title?: string | null;
    description?: string | null;
    accessCheckEyebrow?: string | null;
    accessCheckTitle?: string | null;
    emailLabel?: string | null;
    emailPlaceholder?: string | null;
    submitLabel?: string | null;
    checkingLabel?: string | null;
    accessDeniedMessage?: string | null;
    errorMessage?: string | null;
    emptyGalleryMessage?: string | null;
    backgroundColor?: string | null;
    backgroundMiddleColor?: string | null;
    backgroundEndColor?: string | null;
    textColor?: string | null;
    mutedTextColor?: string | null;
    accentColor?: string | null;
    surfaceColor?: string | null;
    surfaceTextColor?: string | null;
    borderColor?: string | null;
    buttonColor?: string | null;
    buttonTextColor?: string | null;
  } | null;
  content: PageBlock[];
};

export async function getPageBySlug(
  slug: string,
  preview = false,
  locale = DEFAULT_LOCALE,
): Promise<CmsPage | null> {
  return cmsRead(
    `page:${slug}:${locale}`,
    async () => {
      let result: CmsPage | null = null;
      let relationPage = 1;
      let hasMore = false;
      do {
        const data = await cmsQuery<{ pages: CmsPage[] }>(
          HOME_PAGE_QUERY,
          {
            slug,
            status: preview ? "DRAFT" : "PUBLISHED",
            relationPage,
            locale,
          },
          preview,
        );
        if (!Array.isArray(data.pages)) throw new Error("Invalid Pages response");
        const page = data.pages[0];
        if (!page) return null;
        if (!Array.isArray(page.content)) throw new Error("Invalid Page content");
        if (!result) result = page;
        hasMore = false;
        for (const block of page.content) {
          for (const relation of ITEM_RELATIONS) {
            const key = `${relation}_connection` as const;
            const selection = block[key];
            if (!selection) continue;
            hasMore ||= selection.nodes.length === 100;
            if (relationPage > 1) {
              const target = result.content.find(
                (item) => item.id === block.id && item.__typename === block.__typename,
              );
              if (!target?.[key]) throw new Error("Page changed during pagination");
              target[key].nodes.push(...selection.nodes);
            }
          }
        }
        relationPage++;
      } while (hasMore);
      return result;
    },
    null,
    preview,
  );
}

export function getHomePage(preview = false, locale = DEFAULT_LOCALE) {
  return getPageBySlug("home", preview, locale);
}
