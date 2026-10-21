import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStrapiMediaUrl, type StrapiMedia } from "@/lib/strapi";
import { isLocaleCode } from "@/lib/locale";
import "./private-gallery.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Private Gallery | Bott Monument",
  robots: { index: false, follow: false },
};

type PrivateImage = {
  title: string;
  caption: string;
  sortOrder: number;
  image: StrapiMedia;
};

type PrivateGalleryPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ token?: string | string[] }>;
};

export default async function PrivateGalleryPage({ params, searchParams }: PrivateGalleryPageProps) {
  const [{ locale }, query] = await Promise.all([params, searchParams]);
  if (!isLocaleCode(locale)) notFound();

  const token = Array.isArray(query.token) ? query.token[0] : query.token;
  const cmsUrl = process.env.STRAPI_URL?.replace(/\/$/, "");
  let images: PrivateImage[] = [];
  let valid = false;

  if (token && cmsUrl) {
    try {
      const response = await fetch(`${cmsUrl}/api/private-gallery/access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      });
      if (response.ok) {
        const result = (await response.json()) as { images?: PrivateImage[] };
        images = Array.isArray(result.images) ? result.images : [];
        valid = true;
      }
    } catch {
      valid = false;
    }
  }

  const isPortuguese = locale.toLowerCase().startsWith("pt");
  const copy = isPortuguese
    ? {
        eyebrow: "BOTT MONUMENT · GALERIA PRIVADA",
        title: "Uma coleção de memórias",
        invalid: "Este link expirou ou não é válido. Contacte-nos para pedir novo acesso.",
        empty: "A galeria ainda não tem fotografias. Volte mais tarde.",
      }
    : {
        eyebrow: "BOTT MONUMENT · PRIVATE GALLERY",
        title: "A collection of memories",
        invalid: "This link has expired or is invalid. Contact us to request access again.",
        empty: "There are no photos in the gallery yet. Please check back later.",
      };

  return (
    <main className="private-gallery-page">
      <header className="private-gallery-header">
        <p>{copy.eyebrow}</p>
        <h1>{copy.title}</h1>
      </header>
      {!valid ? (
        <p className="private-gallery-message" role="status">{copy.invalid}</p>
      ) : images.length === 0 ? (
        <p className="private-gallery-message">{copy.empty}</p>
      ) : (
        <div className="private-gallery-grid">
          {images.map((item, index) => {
            const src = getStrapiMediaUrl(item.image);
            if (!src) return null;
            return (
              <figure key={`${item.sortOrder}-${item.title}-${index}`}>
                {/* These local prototype images still use the CMS public media URLs. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt={item.image.alternativeText || item.title} loading="lazy" />
                {(item.title || item.caption) && (
                  <figcaption>
                    {item.title && <h2>{item.title}</h2>}
                    {item.caption && <p>{item.caption}</p>}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </main>
  );
}
