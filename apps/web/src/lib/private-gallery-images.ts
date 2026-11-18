const widths = [160, 480, 960, 1600];

// Serve private renditions directly: each request must pass the CMS access check,
// rather than storing credential-bearing photos in Next's shared image cache.
export function privateGalleryImageLoader({ src, width }: { src: string; width: number }): string {
  const url = new URL(src);
  const rendition = widths.find((candidate) => candidate >= width) || widths[widths.length - 1];
  url.searchParams.set("width", String(rendition));
  return url.toString();
}
