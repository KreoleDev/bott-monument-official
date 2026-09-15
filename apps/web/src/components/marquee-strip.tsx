import { Fragment } from "react";
import type { HomepageSection } from "@/lib/strapi";

const marqueeItems = [
  "Bespoke Monuments",
  "Memorial Craftsmanship",
  "Eternal Design",
  "Stone Mastery",
  "Legacy in Granite",
  "Timeless Tributes",
];

type MarqueeStripProps = {
  section: HomepageSection | null;
};

function getMarqueeItems(section: HomepageSection | null) {
  const items = section?.title
    ?.split("|")
    .map((item) => item.trim())
    .filter(Boolean);

  return items?.length ? items : marqueeItems;
}

export function MarqueeStrip({ section }: MarqueeStripProps) {
  const items = getMarqueeItems(section);
  const repeatedItems = [...items, ...items];

  return (
    <div
      className="marquee-strip"
      id="marqueeStrip"
      aria-hidden="true"
      style={{
        background: section?.backgroundColor ?? undefined,
        color: section?.textColor ?? undefined,
      }}
    >
      <div className="marquee-track">
        {repeatedItems.map((item, index) => (
          <Fragment key={`${item}-${index}`}>
            <span>{item}</span>
            <span className="dot">✦</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
