import { getStrapiMediaUrl, type HomepageSection } from "@/lib/strapi";

type HeroProps = {
  section: HomepageSection | null;
};

export function Hero({ section }: HeroProps) {
  const title = section?.title ?? "Crafted to stand forever.";
  const isDefaultTitle = title.trim().toLowerCase() === "crafted to stand forever.";
  const videoUrl = getStrapiMediaUrl(section?.video);

  return (
    <section
      id="hero"
      style={{
        background: `var(--palette-hero-background, ${section?.backgroundColor || "#0A0A0A"})`,
        color: `var(--palette-hero-text-color, ${section?.textColor || "#F0EDE8"})`,
      }}
    >
      <div className="hero-bg" />
      {videoUrl ? (
        <video
          id="heroVideo"
          aria-hidden="true"
          autoPlay
          className="hero-video"
          loop
          muted
          playsInline
          src={videoUrl}
        />
      ) : null}

      <div className="hero-content">
        {section?.eyebrow ? (
          <p className="hero-eyebrow">
            {section.eyebrow}
          </p>
        ) : null}
        <h1 className="hero-title">
          {isDefaultTitle ? (
            <>
              Crafted to
              <br />
              stand <em>forever.</em>
            </>
          ) : (
            <>
              {title}
            </>
          )}
        </h1>
        {section?.description ? (
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            {section.description}
          </p>
        ) : null}
        {section?.buttonLabel && section.buttonHref ? (
          <a
            className="mt-10 inline-flex rounded-full border border-[#C9A050]/40 bg-[#6b551d]/80 px-8 py-4 text-xs uppercase tracking-[0.35em] text-white"
            href={section.buttonHref}
          >
            {section.buttonLabel}
          </a>
        ) : null}
      </div>
    </section>
  );
}
