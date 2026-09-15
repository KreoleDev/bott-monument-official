import type { SiteSettings } from '@/lib/site-settings';
import type { HomepageSection } from '@/lib/strapi';
import './contact.css';
export function Footer({ section, settings }: { section: HomepageSection | null; settings?: SiteSettings | null }) {
  const details=section?.footer;
  if(!details) return null;
  const [first,...rest]=(details.brand || '').split('®');
  return <footer className="site-footer" id="footer">
    <div className="footer-logo">{first}{rest.length>0 && <><span>®</span>{rest.join('®')}</>}</div>
    <p className="footer-copy">{details.copyright}</p>
    <div><p className="footer-tagline">{details.tagline}<br/><em>{details.taglineEmphasis}</em></p>
    <div className="footer-socials">{[['Facebook',settings?.facebookUrl],['Instagram',settings?.instagramUrl]].map(([label,url])=>url && /^https?:\/\//.test(url)?<a key={label} href={url} target="_blank" rel="noopener noreferrer">{label}</a>:null)}</div></div>
  </footer>;
}
