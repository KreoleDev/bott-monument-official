"use client";

import Image from "next/image";
import { ImageLightbox } from "./image-lightbox";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { HomepageSection } from "@/lib/strapi";
import type { GalleryItem } from "@/lib/gallery";
import { startGalleryMotion } from "./gallery-motion";
import "./gallery.css";

export function GalleryCarousel({
  section,
  items,
}: {
  section: HomepageSection;
  items: (GalleryItem & { src: string })[];
}) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const savedOverflow = useRef<string | null>(null);
  const access = section.galleryAccess;

  useEffect(() => {
    if (!viewport.current) return;
    return startGalleryMotion(viewport.current);
  }, [items]);

  useEffect(
    () => () => {
      if (savedOverflow.current !== null) document.body.style.overflow = savedOverflow.current;
    },
    [],
  );

  function openAccess() {
    if (!dialog.current || dialog.current.open) return;
    savedOverflow.current = document.body.style.overflow;
    dialog.current.showModal();
    document.body.style.overflow = "hidden";
  }
  function restoreScroll() {
    if (savedOverflow.current !== null) {
      document.body.style.overflow = savedOverflow.current;
      savedOverflow.current = null;
    }
  }
  function closeAccess() {
    dialog.current?.close();
    restoreScroll();
  }
  const requestHref =
    access?.requestHref && /^(#[\w-]+|\/(?!\/))/.test(access.requestHref)
      ? access.requestHref
      : "#contact";

  return (
    <section
      id="magazine"
      aria-labelledby="gallery-title"
      style={
        {
          "--gallery-background": section.backgroundColor || undefined,
          "--gallery-text": section.textColor || undefined,
        } as CSSProperties
      }
    >
      <div className="gallery-variant" id="magCircularVariant">
        <div className="cg-header-shell">
          <div className="cg-header">
            <h2 className="cg-title" id="gallery-title">
              {section.title === "A Gallery of Lasting Tributes" ? (
                <>
                  A Gallery of Lasting<em>Tributes</em>
                </>
              ) : (
                section.title
              )}
            </h2>
          </div>
          {access && (
            <button
              className="mag-access-trigger cg-access-trigger"
              type="button"
              aria-haspopup="dialog"
              aria-controls="magAccessModal"
              onClick={openAccess}
            >
              <span className="mag-access-trigger-text">{section.buttonLabel}</span>
            </button>
          )}
        </div>
        <p id="gallery-instructions" className="sr-only">
          Drag left or right to rotate. Hover over a card to pause and enlarge it. With the gallery
          focused, use the arrow keys to rotate and Space to pause or resume.
        </p>
        <div
          ref={viewport}
          className="cg-viewport"
          role="region"
          aria-roledescription="carousel"
          aria-label="Rotating memorial gallery"
          aria-describedby="gallery-instructions"
          tabIndex={0}
        >
          <div className="cg-ring">
            {items.map((item, index) => (
              <div
                key={item.documentId}
                className="cg-item"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${items.length}: ${item.title}`}
                style={{
                  transform: `rotateY(${(index * 360) / items.length}deg) translateZ(560px)`,
                }}
              >
                <div className="cg-card">
                  <button
                    type="button"
                    className="cg-view-image"
                    aria-label={`View ${item.title}`}
                    onPointerDown={(event) => event.stopPropagation()}
                    onClick={() => setLightbox(index)}
                  >
                    ↗
                  </button>
                  <Image
                    src={item.src}
                    alt={item.image?.alternativeText || item.title}
                    width={560}
                    height={720}
                    draggable={false}
                    style={{ objectPosition: item.imagePosition || "center center" }}
                  />
                  <div className="cg-caption">
                    <h3>{item.title}</h3>
                    {item.subtitle && <em>{item.subtitle}</em>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {lightbox !== null && (
        <ImageLightbox
          images={items.map((item) => ({
            src: item.src,
            title: item.title,
            alt: item.image?.alternativeText || item.title,
          }))}
          index={lightbox}
          onChange={setLightbox}
          onClose={() => setLightbox(null)}
        />
      )}
      {access && (
        <dialog
          ref={dialog}
          id="magAccessModal"
          className="mag-access-modal"
          aria-labelledby="magAccessTitle"
          aria-describedby="magAccessCopy"
          onClose={restoreScroll}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeAccess();
          }}
        >
          <div className="mag-access-card">
            <button
              className="mag-access-close"
              type="button"
              aria-label="Close"
              onClick={closeAccess}
            >
              ✕
            </button>
            <p className="mag-access-kicker">{access.eyebrow}</p>
            <h3 className="mag-access-title" id="magAccessTitle">
              {access.title} <em>{access.emphasis}</em>
            </h3>
            <p className="mag-access-copy" id="magAccessCopy">
              {access.description}
            </p>
            <div className="mag-access-actions">
              <a className="mag-access-primary" href={requestHref} onClick={closeAccess}>
                {access.requestLabel}
              </a>
              <button className="mag-access-secondary" type="button" onClick={closeAccess}>
                {access.dismissLabel}
              </button>
            </div>
          </div>
        </dialog>
      )}
    </section>
  );
}
