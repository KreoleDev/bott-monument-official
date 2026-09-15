import type { HomepageSection } from '@/lib/strapi';
import './contact.css';
export function Footer({ section }: { section: HomepageSection | null }) {
  const details=section?.footer;
  if(!details) return null;
  const [first,...rest]=details.brand.split('®');
  return <footer className="site-footer" id="footer">
    <div className="footer-logo">{first}{rest.length>0 && <><span>®</span>{rest.join('®')}</>}</div>
    <p className="footer-copy">{details.copyright}</p>
    <p className="footer-tagline">{details.tagline}<br/><em>{details.taglineEmphasis}</em></p>
  </footer>;
}
