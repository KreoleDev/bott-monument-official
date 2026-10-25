"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { StrapiMedia } from "@/lib/strapi";
import type { CmsPage } from "@/lib/pages";
type GalleryCopy = NonNullable<CmsPage["privateGallery"]>;

type PrivateImage = {
  title: string;
  caption: string;
  category: string;
  categorySortOrder: number;
  sortOrder: number;
  images: StrapiMedia[];
};

const copy = {
  en: {
    eyebrow: "BOTT MONUMENT · PRIVATE GALLERY",
    title: "A collection of memories",
    intro: "Enter the email address approved for access to view this private collection.",
    accessEyebrow: "A PRIVATE COLLECTION",
    accessTitle: "Enter your email",
    email: "Email address",
    placeholder: "you@example.com",
    submit: "Open the gallery",
    checking: "Checking access…",
    invalid: "We couldn’t find active gallery access for that email. Check the address or contact us for help.",
    error: "We couldn’t check access right now. Please try again.",
    empty: "There are no photos in the gallery yet. Please check back later.",
    all: "All",
    materials: "Details",
    features: "Features",
    previous: "Previous image",
    next: "Next image",
    close: "Close image",
    galleryHeading: "Our Gallery",
    galleryIntro: "Explore our work by category. Click on any image to view a larger photo and details.",
  },
  pt: {
    eyebrow: "BOTT MONUMENT · GALERIA PRIVADA",
    title: "Uma coleção de memórias",
    intro: "Introduz o endereço de email autorizado para ver esta coleção privada.",
    accessEyebrow: "ACESSO RESERVADO",
    accessTitle: "Entre com o seu email",
    email: "Endereço de email",
    placeholder: "tu@exemplo.com",
    submit: "Abrir galeria",
    checking: "A verificar o acesso…",
    invalid: "Não encontrámos acesso ativo para este email. Confirma o endereço ou contacta-nos.",
    error: "Não foi possível verificar o acesso agora. Tenta novamente.",
    empty: "Ainda não existem fotografias na galeria. Volta mais tarde.",
    all: "Todas",
    materials: "Detalhes",
    features: "Características",
    previous: "Imagem anterior",
    next: "Imagem seguinte",
    close: "Fechar imagem",
    galleryHeading: "A nossa galeria",
    galleryIntro: "Explore o nosso trabalho por categoria. Selecione uma imagem para ver uma fotografia ampliada e os detalhes.",
  },
};

export function PrivateGalleryGate({
  locale,
  token,
  pageTitle,
  copyOverrides,
}: {
  locale: string;
  token?: string;
  pageTitle?: string;
  copyOverrides?: GalleryCopy | null;
}) {
  const fallback = locale.toLowerCase().startsWith("pt") ? copy.pt : copy.en;
  const text = {
    eyebrow: copyOverrides?.eyebrow || fallback.eyebrow,
    title: pageTitle || copyOverrides?.title || fallback.title,
    intro: copyOverrides?.description || fallback.intro,
    accessEyebrow: copyOverrides?.accessCheckEyebrow || fallback.accessEyebrow,
    accessTitle: copyOverrides?.accessCheckTitle || fallback.accessTitle,
    email: copyOverrides?.emailLabel || fallback.email,
    placeholder: copyOverrides?.emailPlaceholder || fallback.placeholder,
    submit: copyOverrides?.submitLabel || fallback.submit,
    checking: copyOverrides?.checkingLabel || fallback.checking,
    invalid: copyOverrides?.accessDeniedMessage || fallback.invalid,
    error: copyOverrides?.errorMessage || fallback.error,
    empty: copyOverrides?.emptyGalleryMessage || fallback.empty,
    all: fallback.all,
    galleryHeading: fallback.galleryHeading,
    galleryIntro: fallback.galleryIntro,
    previous: fallback.previous,
    next: fallback.next,
    close: fallback.close,
  };
  const [email, setEmail] = useState("");
  const [images, setImages] = useState<PrivateImage[] | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const categories = useMemo(() => {
    if (!images) return [];
    const names = new Map<string, { name: string; sortOrder: number }>();
    images.forEach((image) => {
      const name = image.category?.trim();
      if (name) {
        const id = name.toLocaleLowerCase();
        const existing = names.get(id);
        if (!existing || image.categorySortOrder < existing.sortOrder) {
          names.set(id, { name, sortOrder: image.categorySortOrder });
        }
      }
    });
    return [...names.entries()]
      .map(([id, category]) => ({ id, ...category }))
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }, [images]);
  const visibleImages = useMemo(
    () => images?.filter((image) => selectedCategory === "all" || image.category?.trim().toLocaleLowerCase() === selectedCategory) || [],
    [images, selectedCategory],
  );
  const activePhotoCount = selectedImage === null ? 0 : visibleImages[selectedImage]?.images.length || 0;

  useEffect(() => {
    if (selectedImage === null) return;
    const savedOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedImage(null);
      if (event.key === "ArrowLeft") {
        setSelectedPhoto((index) => (index + activePhotoCount - 1) % activePhotoCount);
      }
      if (event.key === "ArrowRight") {
        setSelectedPhoto((index) => (index + 1) % activePhotoCount);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = savedOverflow;
    };
  }, [selectedImage, activePhotoCount]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/private-gallery/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ...(token ? { token } : {}) }),
      });
      if (!response.ok) {
        setMessage(response.status === 404 ? text.invalid : text.error);
        return;
      }
      const result = (await response.json()) as { images?: PrivateImage[] };
      setImages(Array.isArray(result.images) ? result.images : []);
      if (token) window.history.replaceState({}, "", window.location.pathname);
    } catch {
      setMessage(text.error);
    } finally {
      setPending(false);
    }
  }

  return (
    <main
      id="main-content"
      className={`private-gallery-page ${images === null ? "private-gallery-page--gate" : "private-gallery-page--open"}`}
    >
      <div className="private-gallery-art" aria-hidden="true" />
      <header className={`private-gallery-header${images !== null ? " private-gallery-header--open" : ""}`}>
        <p>{text.eyebrow}</p>
        <div className="private-gallery-header-row">
          <div>
            <h1>{images !== null ? text.galleryHeading : pageTitle || text.title}</h1>
            {images !== null && <p className="private-gallery-header-intro">{text.galleryIntro}</p>}
          </div>
        </div>
      </header>

      {images === null ? (
        <section className="private-gallery-gate" aria-labelledby="private-gallery-gate-title">
          <p className="private-gallery-gate-kicker">
            {text.accessEyebrow}
          </p>
          <h2 id="private-gallery-gate-title">
            {text.accessTitle}
          </h2>
          <p className="private-gallery-intro">{text.intro}</p>
          <form onSubmit={submit}>
            <label htmlFor="private-gallery-email">{text.email}</label>
            <input
              id="private-gallery-email"
              type="email"
              name="email"
              autoComplete="email"
              placeholder={text.placeholder}
              maxLength={254}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={pending}
            />
            <button type="submit" disabled={pending}>
              {pending ? text.checking : text.submit}
            </button>
          </form>
          <p className="private-gallery-message" role="status" aria-live="polite">{message}</p>
        </section>
      ) : (
        <section className="private-gallery-open" aria-label={text.title}>
          {images.length === 0 ? (
            <p className="private-gallery-message">{text.empty}</p>
          ) : (
            <>
              {categories.length > 0 && (
                <nav className="private-gallery-categories" aria-label="Gallery categories">
                  <button className={selectedCategory === "all" ? "is-active" : ""} type="button" aria-pressed={selectedCategory === "all"} onClick={() => { setSelectedCategory("all"); setSelectedImage(null); setSelectedPhoto(0); }}>{text.all}</button>
                  {categories.map((category) => (
                    <button key={category.id} className={selectedCategory === category.id ? "is-active" : ""} type="button" aria-pressed={selectedCategory === category.id} onClick={() => { setSelectedCategory(category.id); setSelectedImage(null); setSelectedPhoto(0); }}>{category.name}</button>
                  ))}
                </nav>
              )}
              <div className="private-gallery-grid">
                {visibleImages.map((item, index) => (
                  <button className="private-gallery-card" key={`${item.sortOrder}-${item.title}-${index}`} type="button" onClick={() => { setSelectedImage(index); setSelectedPhoto(0); }} aria-label={`${item.title}. ${item.category}`}>
                    <Image
                      src={item.images[0].url}
                      alt={item.images[0].alternativeText || item.title}
                      width={item.images[0].width || 1200}
                      height={item.images[0].height || 900}
                      loading="lazy"
                    />
                    <span className="private-gallery-card-copy">
                      <strong>{item.title}</strong>
                      {item.caption && <span>{item.caption}</span>}
                      <span className="private-gallery-card-footer">
                        <span className="private-gallery-card-arrow" aria-hidden="true">→</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              {selectedImage !== null && visibleImages[selectedImage] && visibleImages[selectedImage].images[selectedPhoto] && (
                <div className="private-gallery-lightbox" role="dialog" aria-modal="true" aria-label={visibleImages[selectedImage].title} onClick={() => setSelectedImage(null)}>
                  <button className="private-gallery-lightbox-close" type="button" aria-label={text.close} onClick={() => setSelectedImage(null)}>×</button>
                  <div className="private-gallery-lightbox-panel" onClick={(event) => event.stopPropagation()}>
                    <div className="private-gallery-lightbox-visual">
                      <Image src={visibleImages[selectedImage].images[selectedPhoto].url} alt={visibleImages[selectedImage].images[selectedPhoto].alternativeText || visibleImages[selectedImage].title} width={visibleImages[selectedImage].images[selectedPhoto].width || 1600} height={visibleImages[selectedImage].images[selectedPhoto].height || 1200} priority />
                      {visibleImages[selectedImage].images.length > 1 && (
                        <>
                          <button className="private-gallery-lightbox-prev" type="button" aria-label={text.previous} onClick={() => setSelectedPhoto((selectedPhoto + visibleImages[selectedImage].images.length - 1) % visibleImages[selectedImage].images.length)}>‹</button>
                          <button className="private-gallery-lightbox-next" type="button" aria-label={text.next} onClick={() => setSelectedPhoto((selectedPhoto + 1) % visibleImages[selectedImage].images.length)}>›</button>
                        </>
                      )}
                      <nav className="private-gallery-thumbnails" aria-label={text.galleryHeading}>
                        {visibleImages[selectedImage].images.map((photo, index) => (
                          <button key={`${visibleImages[selectedImage].title}-${photo.url}-${index}`} type="button" className={index === selectedPhoto ? "is-active" : ""} aria-label={`${visibleImages[selectedImage].title} — ${index + 1}`} aria-current={index === selectedPhoto ? "true" : undefined} onClick={() => setSelectedPhoto(index)}>
                            <Image src={photo.url} alt="" width={84} height={60} />
                          </button>
                        ))}
                      </nav>
                    </div>
                    <aside className="private-gallery-lightbox-details">
                      <h2>{visibleImages[selectedImage].title}</h2>
                      <p className="private-gallery-lightbox-category">{visibleImages[selectedImage].category}</p>
                      <hr />
                      {visibleImages[selectedImage].caption && <p>{visibleImages[selectedImage].caption}</p>}
                    </aside>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
