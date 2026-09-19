import Image from "next/image";
import { getStrapiMediaUrl, type SectionContent } from "@/lib/strapi";
import "./showroom.css";

function DetailIcon({ kind }: { kind: "location" | "calendar" | "clock" }) {
  return (
    <span className="showroom-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24">
        {kind === "location" ? (
          <>
            <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
            <circle cx="12" cy="10" r="2.5" />
          </>
        ) : kind === "calendar" ? (
          <>
            <rect x="3" y="5" width="18" height="16" rx="1.5" />
            <path d="M7 3v4M17 3v4M3 9h18M7 13h2M11 13h2M15 13h2M7 17h2M11 17h2M15 17h2" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3.5 2" />
          </>
        )}
      </svg>
    </span>
  );
}

export function Showroom({ section }: { section: SectionContent | null }) {
  const image = getStrapiMediaUrl(section?.image);
  if (!section || !section.showroom || !image) return null;
  const details = section.showroom;
  const href =
    section.buttonHref && /^(#[\w-]+|\/(?!\/)|https?:\/\/)/.test(section.buttonHref)
      ? section.buttonHref
      : "#contact";
  return (
    <section id="showroom" aria-labelledby="showroom-title">
      <Image
        className="showroom-bg"
        src={image}
        alt={section.image?.alternativeText || "Bott Monument showroom interior"}
        width={4031}
        height={2249}
      />
      <div className="showroom-content">
        <div className="showroom-panel">
          <div className="showroom-kicker">
            <p>{section.eyebrow}</p>
          </div>
          <h2 id="showroom-title" className="showroom-title">
            {section.title === "Trusted for generations" ? (
              <>
                Trusted for
                <br />
                generations
              </>
            ) : (
              section.title
            )}
          </h2>
          <div className="showroom-divider" aria-hidden="true" />
          <div className="showroom-stats">
            {details.statistics.map((stat) => (
              <div className="showroom-stat" key={stat.id}>
                <p className="showroom-stat-value">{stat.value}</p>
                <p className="showroom-stat-label">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="showroom-divider" aria-hidden="true" />
          <h3 className="showroom-visit-title">{details.visitTitle}</h3>
          <div className="showroom-details">
            <p className="showroom-detail">
              <DetailIcon kind="location" />
              <span>{details.location}</span>
            </p>
            <p className="showroom-detail">
              <DetailIcon kind="calendar" />
              <span>{details.appointment}</span>
            </p>
            <p className="showroom-detail">
              <DetailIcon kind="clock" />
              <span>{details.hours}</span>
            </p>
          </div>
          <a className="showroom-cta" href={href}>
            <span>{section.buttonLabel}</span>
            <span className="showroom-cta-arrow" aria-hidden="true">
              →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
