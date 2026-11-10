"use client";

import Image from "next/image";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
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

function renderInlineMarkdown(value: string): ReactNode[] {
  const pattern = /(\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|`[^`]+`)/g;
  return value.split(pattern).map((part, index) => {
    if ((part.startsWith("**") && part.endsWith("**")) || (part.startsWith("__") && part.endsWith("__"))) {
      return <strong key={index}>{part.slice(2, -2)}</strong>;
    }
    if ((part.startsWith("*") && part.endsWith("*")) || (part.startsWith("_") && part.endsWith("_"))) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={index}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function renderFormattedDescription(value: string) {
  const blocks: Array<{ type: "paragraph" | "heading"; text: string }> = [];
  let paragraph: string[] = [];
  const flushParagraph = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", text: paragraph.join("\n") });
    paragraph = [];
  };

  for (const line of value.replace(/\r\n?/g, "\n").split("\n")) {
    if (!line.trim()) {
      flushParagraph();
      continue;
    }
    const heading = line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      blocks.push({ type: "heading", text: heading[2] });
    } else {
      paragraph.push(line);
    }
  }
  flushParagraph();

  return blocks.map((block, index) => {
    const lines = block.text.split("\n");
    const content = lines.flatMap((line, lineIndex) => [
      ...(lineIndex ? [<br key={`br-${index}-${lineIndex}`} />] : []),
      ...renderInlineMarkdown(line),
    ]);
    return block.type === "heading" ? (
      <h3 key={index}>{content}</h3>
    ) : (
      <p key={index}>{content}</p>
    );
  });
}

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
    loadingPhoto: "Loading photo…",
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
    loadingPhoto: "A carregar fotografia…",
    close: "Fechar imagem",
    galleryHeading: "A nossa galeria",
    galleryIntro: "Explore o nosso trabalho por categoria. Selecione uma imagem para ver uma fotografia ampliada e os detalhes.",
  },
};

export function PrivateGalleryGate({
  locale,
  token,
  copyOverrides,
}: {
  locale: string;
  token?: string;
  copyOverrides?: GalleryCopy | null;
}) {
  const fallback = locale.toLowerCase().startsWith("pt") ? copy.pt : copy.en;
  const text = {
    eyebrow: copyOverrides?.eyebrow || fallback.eyebrow,
    title: copyOverrides?.title || fallback.title,
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
    close: fallback.close,
    loadingPhoto: fallback.loadingPhoto,
  };
  const [email, setEmail] = useState("");
  const [images, setImages] = useState<PrivateImage[] | null>(null);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedPhoto, setSelectedPhoto] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const [settledCardImages, setSettledCardImages] = useState<Set<string>>(() => new Set());
  const [readyDetailImage, setReadyDetailImage] = useState<string | null>(null);
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
  function settleCardImage(url: string) {
    setSettledCardImages((current) => {
      if (current.has(url)) return current;
      const next = new Set(current);
      next.add(url);
      return next;
    });
  }

  useEffect(() => {
    if (selectedImage === null || activePhotoCount < 2) return;
    const photos = visibleImages[selectedImage]?.images;
    if (!photos?.length) return;
    const adjacent = [
      photos[(selectedPhoto + photos.length - 1) % photos.length],
      photos[(selectedPhoto + 1) % photos.length],
    ];
    adjacent.forEach((photo) => {
      const image = new window.Image();
      image.decoding = "async";
      image.src = photo.url;
    });
  }, [selectedImage, selectedPhoto, activePhotoCount, visibleImages]);

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
            <h1>{images !== null ? text.galleryHeading : text.title}</h1>
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
                    <span className="private-gallery-card-media">
                      <Image
                        unoptimized
                        className={settledCardImages.has(item.images[0].url) ? "is-loaded" : "is-loading"}
                        src={item.images[0].url}
                        alt={item.images[0].alternativeText || item.title}
                        width={item.images[0].width || 1200}
                        height={item.images[0].height || 900}
                        loading="lazy"
                        onLoad={() => settleCardImage(item.images[0].url)}
                        onError={() => settleCardImage(item.images[0].url)}
                      />
                      {!settledCardImages.has(item.images[0].url) && (
                        <span className="private-gallery-image-loading" role="status">
                          <span className="private-gallery-loading-spinner" aria-hidden="true" />
                          <span>{text.loadingPhoto}</span>
                        </span>
                      )}
                    </span>
                    <span className="private-gallery-card-copy">
                      <strong>{item.title}</strong>
                      <span className="private-gallery-card-footer">
                        <span className="private-gallery-card-arrow" aria-hidden="true">→</span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              {selectedImage !== null && visibleImages[selectedImage] && visibleImages[selectedImage].images[selectedPhoto] && typeof document !== "undefined" && createPortal(
                <div className="private-gallery-lightbox" role="dialog" aria-modal="true" aria-label={visibleImages[selectedImage].title} onClick={() => setSelectedImage(null)}>
                  <div className="private-gallery-lightbox-panel" onClick={(event) => event.stopPropagation()}>
                    <button className="private-gallery-lightbox-close" type="button" aria-label={text.close} onClick={() => setSelectedImage(null)}>×</button>
                    <div
                      className="private-gallery-lightbox-visual"
                      style={{ "--private-gallery-photo": `url("${visibleImages[selectedImage].images[selectedPhoto].url}")` } as CSSProperties}
                    >
                      <Image
                        unoptimized
                        src={visibleImages[selectedImage].images[selectedPhoto].url}
                        alt={visibleImages[selectedImage].images[selectedPhoto].alternativeText || visibleImages[selectedImage].title}
                        width={visibleImages[selectedImage].images[selectedPhoto].width || 1600}
                        height={visibleImages[selectedImage].images[selectedPhoto].height || 1200}
                        priority
                        className={readyDetailImage === visibleImages[selectedImage].images[selectedPhoto].url ? "is-loaded" : "is-loading"}
                        onLoad={() => setReadyDetailImage(visibleImages[selectedImage].images[selectedPhoto].url)}
                        onError={() => setReadyDetailImage(visibleImages[selectedImage].images[selectedPhoto].url)}
                        onTouchStart={(event) => { touchStartX.current = event.changedTouches[0]?.clientX ?? null; }}
                        onTouchEnd={(event) => {
                          const startX = touchStartX.current;
                          touchStartX.current = null;
                          if (startX === null || visibleImages[selectedImage].images.length < 2) return;
                          const distance = event.changedTouches[0].clientX - startX;
                          if (Math.abs(distance) < 45) return;
                          const count = visibleImages[selectedImage].images.length;
                          setSelectedPhoto((index) => (index + count + (distance < 0 ? 1 : -1)) % count);
                        }}
                      />
                      {readyDetailImage !== visibleImages[selectedImage].images[selectedPhoto].url && (
                        <span className="private-gallery-detail-loading" role="status">
                          <span className="private-gallery-loading-spinner" aria-hidden="true" />
                          <span>{text.loadingPhoto}</span>
                        </span>
                      )}
                      <nav className="private-gallery-thumbnails" aria-label={text.galleryHeading}>
                        {visibleImages[selectedImage].images.map((photo, index) => (
                          <button key={`${visibleImages[selectedImage].title}-${photo.url}-${index}`} type="button" className={index === selectedPhoto ? "is-active" : ""} aria-label={`${visibleImages[selectedImage].title} — ${index + 1}`} aria-current={index === selectedPhoto ? "true" : undefined} onClick={() => setSelectedPhoto(index)}>
                            <Image src={photo.url} alt="" width={84} height={60} unoptimized />
                          </button>
                        ))}
                      </nav>
                    </div>
                    <aside className="private-gallery-lightbox-details">
                      <h2>{visibleImages[selectedImage].title}</h2>
                      <p className="private-gallery-lightbox-category">{visibleImages[selectedImage].category}</p>
                      <hr />
                      {visibleImages[selectedImage].caption && renderFormattedDescription(visibleImages[selectedImage].caption)}
                    </aside>
                  </div>
                </div>,
                document.body
              )}
            </>
          )}
        </section>
      )}
    </main>
  );
}
