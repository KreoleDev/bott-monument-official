import type { SectionContent } from "@/lib/strapi";
import type { Feature } from "@/lib/features";
import { FeaturedInGallery } from "./featured-in-gallery";

const featuredCoverSet: (Feature & { src: string })[] = [
  {
    documentId: "local-mbnews-april-2025",
    title: "MB News — Cover Feature",
    publication: "MB News, April 2025",
    detail: "Benefits of Membership",
    featured: true,
    sortOrder: 1,
    image: {
      url: "/featured-in/mbnews-april-2025-monument-builders.png",
      alternativeText: "MB News April 2025 cover featuring a Bott Monument memorial",
    },
    src: "/featured-in/mbnews-april-2025-monument-builders.png",
  },
  {
    documentId: "local-from-the-cover-wolf",
    title: "From the Cover — Wolf",
    publication: "Monument Builders of North America",
    detail: "A full article feature on a custom Wolf memorial",
    featured: false,
    sortOrder: 2,
    image: {
      url: "/featured-in/from-the-cover-wolf-memorial.png",
      alternativeText: "From the Cover article page featuring the Wolf memorial",
    },
    src: "/featured-in/from-the-cover-wolf-memorial.png",
  },
  {
    documentId: "local-mbnews-technology",
    title: "Technology in Memorial Design",
    publication: "MB News, July 2024",
    detail: "Innovations in monument design",
    featured: false,
    sortOrder: 3,
    image: {
      url: "/featured-in/mbnews-technology-in-memorial-design.png",
      alternativeText: "MB News July 2024 Technology cover",
    },
    src: "/featured-in/mbnews-technology-in-memorial-design.png",
  },
  {
    documentId: "local-mbnews-mountain-tribute",
    title: "Mountain Memorial Tribute",
    publication: "MB News, September 2024",
    detail: "Operations issue cover showcase",
    featured: false,
    sortOrder: 4,
    image: {
      url: "/featured-in/mbnews-mountain-memorial-tribute.png",
      alternativeText: "MB News September 2024 cover with mountain memorial",
    },
    src: "/featured-in/mbnews-mountain-memorial-tribute.png",
  },
  {
    documentId: "local-mbnews-mountain-showcase",
    title: "Mountain Monument Showcase",
    publication: "MB News, March 2024",
    detail: "WinMBNA cover feature",
    featured: false,
    sortOrder: 5,
    image: {
      url: "/featured-in/mbnews-mountain-monument-showcase.png",
      alternativeText: "MB News March 2024 cover featuring a mountain monument",
    },
    src: "/featured-in/mbnews-mountain-monument-showcase.png",
  },
  {
    documentId: "local-mbnews-marketplace-issue",
    title: "North American Marketplace Issue",
    publication: "MB News, January 2022",
    detail: "Marketplace cover spotlight",
    featured: false,
    sortOrder: 6,
    image: {
      url: "/featured-in/mbnews-monument-marketplace-issue.png",
      alternativeText: "MB News January 2022 North American Marketplace issue cover",
    },
    src: "/featured-in/mbnews-monument-marketplace-issue.png",
  },
  {
    documentId: "local-mbnews-virtual-show",
    title: "Virtual Monument Showcase",
    publication: "MB News, April 2021",
    detail: "Virtual monument industry show cover",
    featured: false,
    sortOrder: 7,
    image: {
      url: "/featured-in/mbnews-virtual-monument-showcase.png",
      alternativeText: "MB News April 2021 virtual monument industry show cover",
    },
    src: "/featured-in/mbnews-virtual-monument-showcase.png",
  },
  {
    documentId: "local-mbnews-awards",
    title: "Awards Issue Cover",
    publication: "MB News, January 2023",
    detail: "Showcase of excellence",
    featured: false,
    sortOrder: 8,
    image: {
      url: "/featured-in/mbnews-awards-issue-monument-cover.png",
      alternativeText: "MB News January 2023 awards issue cover",
    },
    src: "/featured-in/mbnews-awards-issue-monument-cover.png",
  },
  {
    documentId: "local-mbnews-marketplace-cover",
    title: "Monument Marketplace Cover",
    publication: "MB News, January 2022",
    detail: "North American marketplace feature",
    featured: false,
    sortOrder: 9,
    image: {
      url: "/featured-in/mbnews-monument-marketplace-cover.png",
      alternativeText: "MB News January 2022 monument marketplace cover",
    },
    src: "/featured-in/mbnews-monument-marketplace-cover.png",
  },
  {
    documentId: "local-stone-spring",
    title: "Stone in America — Spring",
    publication: "Stone in America, Spring 2010",
    detail: "Memorial design magazine cover",
    featured: false,
    sortOrder: 10,
    image: {
      url: "/featured-in/stone-in-america-memorials-in-spring.png",
      alternativeText: "Stone in America Spring 2010 cover",
    },
    src: "/featured-in/stone-in-america-memorials-in-spring.png",
  },
  {
    documentId: "local-stone-winter",
    title: "Stone in America — Winter",
    publication: "Stone in America, Winter 2011",
    detail: "Memorialist magazine cover",
    featured: false,
    sortOrder: 11,
    image: {
      url: "/featured-in/stone-memorials-in-winter-cemetery.png",
      alternativeText: "Stone in America Winter 2011 cover",
    },
    src: "/featured-in/stone-memorials-in-winter-cemetery.png",
  },
];

export function FeaturedIn({
  section,
}: {
  section: SectionContent | null;
  features: Feature[];
}) {
  if (!section) return null;
  return <FeaturedInGallery section={section} covers={featuredCoverSet} />;
}
