import { getStrapiMediaUrl, type HomepageSection } from "@/lib/strapi";

type HeroProps = {
  section: HomepageSection | null;
};

export function Hero({ section }: HeroProps) {
  const title = section?.title ?? "Crafted to stand forever.";
  const words = title.split(" ");
  const finalWord = words.pop();
  const titleStart = words.join(" ");
  const videoUrl = getStrapiMediaUrl(section?.video);

  return (
    <section
      id="home"
      className="relative flex min-h-screen items-center overflow-hidden px-6 pt-24"
      style={{
        backgroundColor: section?.backgroundColor ?? "#0A0A0A",
        color: section?.textColor ?? "#F0EDE8",
      }}
    >
      {videoUrl ? (
        <video
          aria-hidden="true"
          autoPlay
          className="absolute inset-0 h-full w-full object-cover"
          loop
          muted
          playsInline
          src={videoUrl}
        />
      ) : null}

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 mx-auto w-full max-w-7xl">
        {section?.eyebrow ? (
          <p className="mb-5 text-sm uppercase tracking-[0.35em] text-[#C9A050]">
            {section.eyebrow}
          </p>
        ) : null}
        <h1 className="max-w-4xl font-serif text-6xl leading-[0.95] md:text-8xl lg:text-9xl">
          {titleStart}
          {finalWord ? (
            <>
              {" "}
              <em className="font-light text-[#C9A050]">{finalWord}</em>
            </>
          ) : null}
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
