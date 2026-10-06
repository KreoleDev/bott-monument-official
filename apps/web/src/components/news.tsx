"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { pressDate, pressImageUrl, type PressItem } from "@/lib/news-shared";
import type { SectionContent } from "@/lib/strapi";
import "./news.css";
import { localizedHref, localizedPath } from "@/lib/locale";

type NewsProps = {
  items: PressItem[];
  section?: SectionContent | null;
  all?: boolean;
  locale?: string;
};

export function News({ items, section, all = false, locale = "en" }: NewsProps) {
  const [activeStory, setActiveStory] = useState(0);
  const [cardsPerPage, setCardsPerPage] = useState(2);
  const storyTrack = useRef<HTMLDivElement>(null);
  const featured = items.filter((item) => item.featured);
  const stories = all ? items : featured.length ? featured : items;
  const canScrollStories = stories.length > cardsPerPage;
  const lastStoryStart = Math.max(0, stories.length - cardsPerPage);
  const storyPages = Array.from({ length: Math.ceil(stories.length / cardsPerPage) }, (_, index) =>
    Math.min(index * cardsPerPage, lastStoryStart),
  );
  const activeStoryPage = storyPages.reduce((activePage, pageStart, index) => {
    return activeStory >= pageStart ? index : activePage;
  }, 0);
  const allHref = all
    ? `${localizedPath(locale)}#work`
    : section?.buttonHref?.startsWith("/") && !section.buttonHref.startsWith("//")
      ? localizedHref(locale, section.buttonHref)
      : localizedPath(locale, "/news");
  const allLabel = all ? "Back to Home" : section?.buttonLabel || "All Press Coverage";
  const articleClassName =
    "wpp-article shrink-0 grow-0 basis-full min-[1181px]:basis-[calc((100%-var(--wpp-card-gap))/2)]";

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1181px)");
    const syncCardsPerPage = () => {
      setCardsPerPage(desktopQuery.matches ? 2 : 1);
    };

    syncCardsPerPage();
    desktopQuery.addEventListener("change", syncCardsPerPage);
    return () => desktopQuery.removeEventListener("change", syncCardsPerPage);
  }, []);

  useEffect(() => {
    setActiveStory((current) => Math.min(current, lastStoryStart));
  }, [lastStoryStart]);

  if (!items.length) return null;

  function syncActiveStory() {
    const track = storyTrack.current;
    if (!track) return;
    const articles = Array.from(track.querySelectorAll<HTMLElement>(".wpp-article"));
    const trackCenter = track.scrollLeft + track.clientWidth / 2;
    let closestIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    articles.forEach((article, index) => {
      const articleCenter = article.offsetLeft + article.offsetWidth / 2;
      const distance = Math.abs(trackCenter - articleCenter);
      if (distance < closestDistance) {
        closestIndex = index;
        closestDistance = distance;
      }
    });

    setActiveStory(Math.min(closestIndex, lastStoryStart));
  }

  function scrollStoryPage(index: number) {
    const track = storyTrack.current;
    if (!track) return;
    const articles = Array.from(track.querySelectorAll<HTMLElement>(".wpp-article"));
    const nextIndex = storyPages[index] ?? 0;
    const nextArticle = articles[nextIndex];
    if (!nextArticle) return;

    track.scrollTo({
      left: nextArticle.offsetLeft - track.offsetLeft,
      behavior: "smooth",
    });
    setActiveStory(nextIndex);
  }

  function scrollStoryGroup(direction: -1 | 1) {
    scrollStoryPage(Math.max(0, Math.min(storyPages.length - 1, activeStoryPage + direction)));
  }

  return (
    <section
      id="work"
      className="creations-section"
      aria-labelledby="news-title"
      style={
        {
          "--section-news-background": section?.backgroundColor || undefined,
          "--section-news-text": section?.textColor || undefined,
        } as CSSProperties
      }
    >
      <div className="creations-header">
        <div />
      </div>
      <div className="luxury-creations-layout">
        <div className="creations-left gallery-left">
          <div className="gallery-label-row">
            <span aria-hidden="true" />
            <p>{section?.eyebrow || "Our Work"}</p>
            <span aria-hidden="true" />
          </div>
          <h2 id="news-title" className="gallery-title">
            {section?.title && section.title !== "Where Art Becomes News." ? (
              section.title
            ) : (
              <>
                Where
                <br />
                <em>Art</em>
                <br />
                Becomes{" "}
                <span>
                  <em>News.</em>
                </span>
              </>
            )}
          </h2>
          <div className="gallery-ornament" aria-hidden="true" />
          <div className="gallery-lines">
            {(section?.quote || "Every curve.\nEvery inscription.\nEvery detail.")
              .split("\n")
              .map((line, i) => (
                <p key={i}>{line}</p>
              ))}
          </div>
          <p className="gallery-desc">
            {section?.description || (
              <>
                Thoughtfully crafted to become
                <br />a lasting legacy for generations.
              </>
            )}
          </p>
        </div>
        <div className="work-press-panel">
          <div className="wpp-header">
            <div>
              <p className="wpp-eyebrow">— In The Press —</p>
              <h3 className="wpp-title">
                {all ? "All Press" : "Featured"} <em>{all ? "Coverage" : "In"}</em>
              </h3>
            </div>
            <Link className="wpp-mobile-link" href={allHref}>
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="wpp-rule" />
          <div
            ref={storyTrack}
            className="wpp-stories-track"
            aria-label={`${all ? "All" : "Featured"} stories`}
            onScroll={syncActiveStory}
          >
            {stories.map((story) => {
              const image = pressImageUrl(story);
              const date = pressDate(story.date, locale);
              const content = (
                <>
                  {image && (
                    <div className="wpp-thumb">
                      <Image
                        src={image}
                        alt={story.image?.alternativeText || story.source}
                        width={120}
                        height={120}
                        unoptimized
                      />
                    </div>
                  )}
                  <div className="wpp-text">
                    <p className="wpp-pub">{story.source}</p>
                    <h4 className="wpp-headline">
                      {story.title}
                    </h4>
                    <p className="wpp-summary">
                      {date && <time dateTime={story.date!}>{date}</time>}
                      {date && story.category ? " · " : ""}
                      {story.category}
                    </p>
                    {/https?:\/\//i.test(story.url) && (
                      <span className="wpp-card-action">
                        Open story <span aria-hidden="true">→</span>
                      </span>
                    )}
                  </div>
                </>
              );
              return (
                /^https?:\/\//i.test(story.url) ? (
                  <a
                    key={story.documentId}
                    className={articleClassName}
                    href={story.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open story: ${story.title}`}
                  >
                    {content}
                  </a>
                ) : (
                  <article key={story.documentId} className={articleClassName}>
                    {content}
                  </article>
                )
              );
            })}
          </div>
          {canScrollStories && (
            <div className="wpp-carousel-nav">
              <div className="wpp-scroll-dots" aria-label="Press story pages">
                {storyPages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    className={index === activeStoryPage ? "is-active" : undefined}
                    onClick={() => scrollStoryPage(index)}
                    aria-label={`Show press story group ${index + 1}`}
                    aria-current={index === activeStoryPage ? "true" : undefined}
                  />
                ))}
              </div>
              <div className="wpp-scroll-controls" aria-label="Press story controls">
                <button
                  type="button"
                  onClick={() => scrollStoryGroup(-1)}
                  aria-label="Previous press story group"
                  disabled={activeStoryPage === 0}
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scrollStoryGroup(1)}
                  aria-label="Next press story group"
                  disabled={activeStoryPage >= storyPages.length - 1}
                >
                  →
                </button>
              </div>
            </div>
          )}
          {stories.length > 1 && (
            <div className="wpp-swipe-hint" aria-hidden="true">
              {stories.map((story, index) => (
                <span
                  key={story.documentId}
                  className={index === activeStory ? "is-active" : undefined}
                />
              ))}
              <p>Swipe for more →</p>
            </div>
          )}
          <Link className="wpp-all-link" href={allHref}>
            {allLabel}{" "}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
