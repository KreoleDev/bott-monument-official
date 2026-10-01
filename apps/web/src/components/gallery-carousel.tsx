"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import type { SectionContent } from "@/lib/strapi";
import type { GalleryItem } from "@/lib/gallery";
import { localizedHref } from "@/lib/locale";
import { startGalleryMotion } from "./gallery-motion";
import "./gallery.css";

export function GalleryCarousel({
  section,
  items,
  locale = "en",
}: {
  section: SectionContent;
  items: (GalleryItem & { src: string })[];
  locale?: string;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const savedOverflow = useRef<string | null>(null);
  const [useReducedMobileSet, setUseReducedMobileSet] = useState(false);
  const access = section.galleryAccess;
  const visibleItems = useMemo(
    () =>
      useReducedMobileSet && items.length > 4
        ? items.filter((_, index) => index % 2 === 0)
        : items,
    [items, useReducedMobileSet],
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 699px)");
    const sync = () => setUseReducedMobileSet(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!viewport.current) return;
    return startGalleryMotion(viewport.current);
  }, [visibleItems]);

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
  const requestHref = localizedHref(
    locale,
    access?.requestHref && /^(#[\w-]+|\/(?!\/))/.test(access.requestHref)
      ? access.requestHref
      : "#contact",
  );

  return (
    <section
      id="gallery"
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
            {visibleItems.map((item, index) => (
              <div
                key={item.documentId}
                className="cg-item"
                role="group"
                aria-roledescription="slide"
                aria-label={`${index + 1} of ${visibleItems.length}: ${item.title}`}
                style={{
                  transform: `rotateY(${(index * 360) / visibleItems.length}deg) translateZ(560px)`,
                }}
              >
                <div className="cg-card">
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
