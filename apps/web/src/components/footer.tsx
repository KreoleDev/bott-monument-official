import type { SectionContent } from "@/lib/strapi";
import "./contact.css";

function SocialIcon({ name }: { name: string }) {
  const path =
    name === "Facebook"
      ? "M18.9 2h-3.6c-4 0-6.6 2.5-6.6 6.4v2.9H5v4.4h3.7V22h4.7v-6.3h4l.7-4.4h-4.7V8.9c0-1.3.4-2.2 2.4-2.2h3.1V2Z"
      : name === "Instagram"
        ? "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4c0 3.2-2.6 5.8-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8C2 4.6 4.6 2 7.8 2Zm0 2A3.8 3.8 0 0 0 4 7.8v8.4A3.8 3.8 0 0 0 7.8 20h8.4a3.8 3.8 0 0 0 3.8-3.8V7.8A3.8 3.8 0 0 0 16.2 4H7.8Zm8.7 2.1a1.4 1.4 0 1 1 0 2.8 1.4 1.4 0 0 1 0-2.8ZM12 7.2a4.8 4.8 0 1 1 0 9.6 4.8 4.8 0 0 1 0-9.6Zm0 2a2.8 2.8 0 1 0 0 5.6 2.8 2.8 0 0 0 0-5.6Z"
        : "M21.6 7.2s-.2-1.5-.8-2.1c-.8-.8-1.7-.8-2.1-.9C15.8 4 12 4 12 4s-3.8 0-6.7.2c-.4.1-1.3.1-2.1.9-.6.6-.8 2.1-.8 2.1S2.2 9 2.2 10.8v1.7c0 1.8.2 3.6.2 3.6s.2 1.5.8 2.1c.8.8 1.9.8 2.4.9 1.7.2 6.4.2 6.4.2s3.8 0 6.7-.2c.4-.1 1.3-.1 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.8.2-3.6v-1.7c0-1.8-.2-3.6-.2-3.6ZM10.1 14.9V8.7l5.8 3.1-5.8 3.1Z";

  return (
    <svg aria-hidden="true" className="footer-social-icon" viewBox="0 0 24 24">
      <path d={path} />
    </svg>
  );
}

export function Footer({ section }: { section: SectionContent | null }) {
  const details = section?.footer;
  if (!details) return null;
  const [first, ...rest] = (details.brand || "").split("®");
  const socialLinks = [
    ["Facebook", details.facebookUrl],
    ["Instagram", details.instagramUrl],
    ["YouTube", details.youtubeUrl],
  ].filter((entry): entry is [string, string] => {
    const url = entry[1];
    return Boolean(url && /^https?:\/\//.test(url));
  });

  return (
    <footer className="site-footer" id="footer">
      <div className="footer-logo">
        {first}
        {rest.length > 0 && (
          <>
            <span>®</span>
            {rest.join("®")}
          </>
        )}
      </div>
      <div className="footer-center">
        <p className="footer-copy">{details.copyright}</p>
        {socialLinks.length > 0 && (
          <div className="footer-socials">
            {socialLinks.map(([label, url]) => (
              <a key={label} href={url} target="_blank" rel="noopener noreferrer" aria-label={label}>
                <SocialIcon name={label} />
                <span>{label}</span>
              </a>
            ))}
          </div>
        )}
      </div>
      <div>
        <p className="footer-tagline">
          {details.tagline}
          <br />
          <em>{details.taglineEmphasis}</em>
        </p>
      </div>
    </footer>
  );
}
