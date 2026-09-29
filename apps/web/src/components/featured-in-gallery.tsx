"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";
import type { SectionContent } from "@/lib/strapi";
import type { Feature } from "@/lib/features";
import "./featured-in.css";

type Cover = Feature & { src: string };

export function FeaturedInGallery({
  section,
  covers,
}: {
  section: SectionContent;
  covers: Cover[];
}) {
  const initial = covers.find((cover) => cover.featured) ?? covers[0];
  const [selectedId, setSelectedId] = useState(initial.documentId);
  const selected = covers.find((cover) => cover.documentId === selectedId) ?? initial;
  const sides = covers.filter((cover) => cover.documentId !== initial.documentId);
  const middle = Math.ceil(sides.length / 2);
  const thumbnail = (cover: Cover, index: number) => (
    <button
      key={cover.documentId}
      type="button"
      className={`ptw-cover${selected.documentId === cover.documentId ? " ptw-active" : ""}`}
      style={{ "--rot": `${[-4, -3, -2, -3, -4, -5][index % 6]}deg` } as CSSProperties}
      aria-label={`View ${cover.title}`}
      aria-pressed={selected.documentId === cover.documentId}
      onClick={() => setSelectedId(cover.documentId)}
    >
      <Image
        src={cover.src}
        alt={cover.image?.alternativeText || cover.title}
        width={165}
        height={220}
      />
    </button>
  );

  return (
    <section
      id="press-clippings"
      aria-labelledby="featured-in-title"
      style={
        {
          "--section-press-background": section.backgroundColor || undefined,
          "--section-press-text": section.textColor || undefined,
        } as CSSProperties
      }
    >
      <div className="press-clippings-inner">
        <div className="press-clippings-header">
          <p className="press-clippings-eyebrow">{section.eyebrow}</p>
          <h2 id="featured-in-title" className="press-clippings-title">
            {section.title === "As Featured In" ? (
              <>
                As <em>Featured</em> In
              </>
            ) : (
              section.title
            )}
          </h2>
          <div className="press-clippings-rule" aria-hidden="true" />
        </div>
        <div className="ptw-wrap">
          <div className="ptw-side ptw-left">{sides.slice(0, middle).map(thumbnail)}</div>
          <a
            className="ptw-center-frame"
            href={selected.src}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open full image: ${selected.title}`}
          >
            <Image
              key={selected.documentId}
              src={selected.src}
              alt={selected.image?.alternativeText || selected.title}
              width={600}
              height={800}
            />
          </a>
          <div className="ptw-caption" aria-live="polite" aria-atomic="true">
            <p className="ptw-kicker">{section.eyebrow}</p>
            <h3 className="ptw-headline">{selected.title}</h3>
            <p className="ptw-meta">{selected.publication}</p>
            <p className="ptw-sub">{selected.detail}</p>
            {selected.documentId !== initial.documentId && (
              <button
                className="ptw-reset"
                type="button"
                onClick={() => setSelectedId(initial.documentId)}
              >
                Back to featured cover
              </button>
            )}
          </div>
          <div className="ptw-side ptw-right">
            {sides.slice(middle).map((cover, index) => thumbnail(cover, middle + index))}
          </div>
        </div>
      </div>
    </section>
  );
}
