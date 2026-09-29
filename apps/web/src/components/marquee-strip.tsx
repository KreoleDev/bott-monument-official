import { Fragment } from "react";
import type { SectionContent } from "@/lib/strapi";

const marqueeItems = [
  "Bespoke Monuments",
  "Memorial Craftsmanship",
  "Eternal Design",
  "Stone Mastery",
  "Legacy in Granite",
  "Timeless Tributes",
];

type MarqueeStripProps = {
  section: SectionContent | null;
};

function getMarqueeItems(section: SectionContent | null) {
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
        background: `var(--palette-marquee-background, ${section?.backgroundColor || "var(--primary-header-gradient)"})`,
        color: `var(--palette-marquee-text-color, ${section?.textColor || "var(--bone)"})`,
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
