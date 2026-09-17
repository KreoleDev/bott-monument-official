import Image from "next/image";
import type { CSSProperties } from "react";
import { getStrapiMediaUrl, type HomepageSection } from "@/lib/strapi";

type FounderProps = {
  section: HomepageSection | null;
};

const defaultTitle = "The Most Trusted Name\nin Memorial Artistry";

function splitTitle(title: string) {
  // Strapi's title is a single-line field; retain the reference's emphasized ending.
  const match = title.trim().match(/^(.*?)\s+(in\s+Memorial Artistry)$/i);
  const lines = title.trim().split(/\r?\n/);
  const firstLine = match?.[1] ?? lines[0];
  const secondLine = match?.[2] ?? lines.slice(1).join(" ");
  const prefix = secondLine?.match(/^in\s+/i)?.[0] ?? "";

  return { firstLine, secondLine: secondLine?.slice(prefix.length), prefix };
}

export function Founder({ section }: FounderProps) {
  const title = section?.title ?? defaultTitle;
  const { firstLine, secondLine, prefix } = splitTitle(title);
  const imageUrl = getStrapiMediaUrl(section?.image) ?? "/profile_2.png";

  return (
    <section id="founder" className="page2-wrap" aria-labelledby="founder-title">
      <div className="page2-variant" id="page2Classic">
        <div
          className="press-page press-page-gold-bg"
          style={
            {
              "--section-founder-background": section?.backgroundColor || undefined,
              "--section-founder-text": section?.textColor || undefined,
            } as CSSProperties
          }
        >
          <div className="press-page-inner">
            <div className="press-founder">
              <div className="press-founder-frame">
                <span className="press-founder-spotlight" />
                <div className="press-founder-img">
                  <Image
                    src={imageUrl}
                    alt={
                      section?.image?.alternativeText ?? "Drew Bott, Founder and Master Craftsman"
                    }
                    width={1024}
                    height={1024}
                    priority={imageUrl.startsWith("http://") || imageUrl.startsWith("https://")}
                  />
                </div>
              </div>
              <p className="press-founder-name">
                <strong>{section?.personName ?? "DREW BOTT"}</strong>
                {section?.personRole ?? "Founder & Master Craftsman"}
              </p>
            </div>

            <div className="press-page-head">
              <p className="press-page-kicker">
                {section?.eyebrow ?? "Founder · Craftsman · Visionary"}
              </p>
              <h2 id="founder-title" className="press-page-title">
                {firstLine}
                {secondLine ? (
                  <>
                    <br />
                    {prefix}
                    <em>{secondLine}</em>
                  </>
                ) : null}
              </h2>
              <div className="press-page-divider" />
              <p className="press-page-story">
                {section?.description ??
                  "Drew Bott's work has earned recognition across North America for exceptional design, craftsmanship, and artistry in stone. His monuments are not only built with precision — they are created with meaning, memory, and dignity."}
              </p>
              <p className="press-page-quote">
                {section?.quote ??
                  '"Every monument should feel as personal as the life it honors."'}
              </p>
              <p className="press-page-signature">{section?.signature ?? "Your signature"}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
