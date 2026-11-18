"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { privateGalleryImageLoader } from "@/lib/private-gallery-images";
import type { StrapiMedia } from "@/lib/strapi";

const detailSizes = "(max-width: 700px) 100vw, (max-width: 1180px) 65vw, 1016px";

export function PrivateGalleryDetailPhotos({
  photos,
  title,
  selectedPhoto,
  loadingLabel,
  onNavigate,
}: {
  photos: StrapiMedia[];
  title: string;
  selectedPhoto: number;
  loadingLabel: string;
  onNavigate: (direction: number) => void;
}) {
  const [settledPhotos, setSettledPhotos] = useState<Set<string>>(() => new Set());
  const touchStartX = useRef<number | null>(null);
  const active = photos[selectedPhoto];

  function settlePhoto(url: string) {
    setSettledPhotos((current) => {
      if (current.has(url)) return current;
      return new Set(current).add(url);
    });
  }

  return (
    <>
      {/* Keep every detail photo mounted so navigation reuses its downloaded image,
          including when private responses cannot use the browser's HTTP cache. */}
      {photos.map((photo, index) => (
        <Image
          key={`${photo.url}-${index}`}
          loader={privateGalleryImageLoader}
          sizes={detailSizes}
          src={photo.url}
          alt={photo.alternativeText || title}
          width={photo.width || 1600}
          height={photo.height || 1200}
          loading="eager"
          fetchPriority={index === selectedPhoto ? "high" : "low"}
          hidden={index !== selectedPhoto}
          className={settledPhotos.has(photo.url) ? "is-loaded" : "is-loading"}
          onLoad={() => settlePhoto(photo.url)}
          onError={() => settlePhoto(photo.url)}
          onTouchStart={(event) => {
            touchStartX.current = event.changedTouches[0]?.clientX ?? null;
          }}
          onTouchEnd={(event) => {
            const startX = touchStartX.current;
            touchStartX.current = null;
            if (startX === null || photos.length < 2) return;
            const endX = event.changedTouches[0]?.clientX;
            if (endX === undefined || Math.abs(endX - startX) < 45) return;
            onNavigate(endX < startX ? 1 : -1);
          }}
        />
      ))}
      {active && !settledPhotos.has(active.url) && (
        <span key={active.url} className="private-gallery-detail-loading" role="status">
          <span className="private-gallery-loading-spinner" aria-hidden="true" />
          <span>{loadingLabel}</span>
        </span>
      )}
    </>
  );
}
