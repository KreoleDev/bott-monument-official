export type HomepageSection = {
  sectionKey: string;
  eyebrow: string | null;
  title: string | null;
  description: string | null;
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

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

const HOMEPAGE_SECTION_QUERY = `
  query HomepageSection($sectionKey: String!) {
    homepageSections(filters: { sectionKey: { eq: $sectionKey } }) {
      sectionKey
      eyebrow
      title
      description
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
      }
    }
  }
`;

function getStrapiConfig() {
  const url = process.env.STRAPI_URL;
  const token = process.env.STRAPI_API_TOKEN;

  if (!url || !token) {
    throw new Error("Missing STRAPI_URL or STRAPI_API_TOKEN");
  }

  return {
    token,
    url: url.replace(/\/$/, ""),
  };
}

export function getStrapiMediaUrl(media?: StrapiMedia | null) {
  if (!media?.url) {
    return null;
  }

  if (media.url.startsWith("http")) {
    return media.url;
  }

  const { url } = getStrapiConfig();
  return `${url}${media.url}`;
}

export async function getHomepageSection(sectionKey: string) {
  const { token, url } = getStrapiConfig();

  try {
    const response = await fetch(`${url}/graphql`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: HOMEPAGE_SECTION_QUERY,
        variables: { sectionKey },
      }),
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Strapi request failed: ${response.status}`);
    }

    const result = (await response.json()) as GraphQLResponse<{
      homepageSections: HomepageSection[];
    }>;

    if (result.errors?.length) {
      throw new Error(result.errors.map((error) => error.message).join(", "));
    }

    return result.data?.homepageSections[0] ?? null;
  } catch (error) {
    console.warn(`Could not fetch ${sectionKey} from Strapi`, error);
    return null;
  }
}
