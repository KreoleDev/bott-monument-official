import Image from "next/image";
import Link from "next/link";
import { Fragment, type CSSProperties } from "react";
import { pressDate, pressImageUrl, type PressItem } from "@/lib/news";
import type { HomepageSection } from "@/lib/strapi";
import "./news.css";

type NewsProps = {
  items: PressItem[];
  section?: HomepageSection | null;
  all?: boolean;
};

export function News({ items, section, all = false }: NewsProps) {
  if (!items.length) return null;

  const featured = items.filter(item => item.featured);
  const stories = all ? items : (featured.length ? featured : items).slice(0, 2);

  return (
    <section id="work" className="creations-section" aria-labelledby="news-title"
      style={{ "--section-news-background": section?.backgroundColor || undefined, "--section-news-text": section?.textColor || undefined } as CSSProperties}>
      <div className="creations-header"><div /></div>
      <div className="luxury-creations-layout">
        <div className="creations-left gallery-left">
          <div className="gallery-label-row">
            <span aria-hidden="true" /><p>{section?.eyebrow || "Our Work"}</p><span aria-hidden="true" />
          </div>
          <h2 id="news-title" className="gallery-title">
            {section?.title && section.title !== "Where Art Becomes News." ? section.title : (
              <>Where<br /><em>Art</em><br />Becomes <span><em>News.</em></span></>
            )}
          </h2>
          <div className="gallery-ornament" aria-hidden="true" />
          <div className="gallery-lines">
            {(section?.quote || "Every curve.\nEvery inscription.\nEvery detail.").split("\n").map((line, i) => <p key={i}>{line}</p>)}
          </div>
          <p className="gallery-desc">{section?.description || <>Thoughtfully crafted to become<br />a lasting legacy for generations.</>}</p>
        </div>
        <div className="work-press-panel">
          <div className="wpp-header">
            <div>
              <p className="wpp-eyebrow">— In The Press —</p>
              <h3 className="wpp-title">{all ? "All" : "Featured"} <em>Stories</em></h3>
            </div>
            <span className="wpp-counter" aria-label={`${stories.length} stories`}>{String(stories.length).padStart(2, "0")}</span>
          </div>
          <div className="wpp-rule" />
          {stories.map((story, index) => {
            const image = pressImageUrl(story);
            const date = pressDate(story.date);
            const content = <>
              {image && <div className="wpp-thumb"><Image src={image} alt={story.image?.alternativeText || story.source} width={120} height={120} /></div>}
              <div className="wpp-text">
                <p className="wpp-pub">{story.source}</p>
                <h4 className="wpp-headline">{story.title}</h4>
                <p className="wpp-meta">{date && <time dateTime={story.date!}>{date}</time>}{date && story.category ? " · " : ""}{story.category}</p>
              </div>
            </>;
            return <Fragment key={story.documentId}>
              {index > 0 && <div className="wpp-divider" />}
              {/^https?:\/\//i.test(story.url) ? <a className="wpp-article" href={story.url} target="_blank" rel="noopener noreferrer">{content}</a> : <article className="wpp-article">{content}</article>}
            </Fragment>;
          })}
          <div className="wpp-rule" />
          <Link className="wpp-all-link" href={all ? "/#work" : (section?.buttonHref?.startsWith("/") && !section.buttonHref.startsWith("//") ? section.buttonHref : "/news")}>{all ? "Back to Home" : section?.buttonLabel || "All Press Coverage"} <span aria-hidden="true">→</span></Link>
        </div>
      </div>
    </section>
  );
}
