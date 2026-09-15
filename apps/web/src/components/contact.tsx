import type { HomepageSection } from '@/lib/strapi';
import { ContactForm } from './contact-form';
import './contact.css';

export function Contact({ section }: { section: HomepageSection | null }) {
  const details = section?.contact;
  if (!section || !details) return null;
  const total = Math.min(100, Math.max(0, details.totalCommissions || 0));
  return <section id="contact" aria-labelledby="contact-title"><div className="commission-wrap">
    <p className="section-eyebrow">{section.eyebrow}</p>
    <h2 className="commission-title" id="contact-title">{section.title} <em>{details.titleEmphasis}</em></h2>
    <p className="commission-sub">{section.description}</p>
    {details.counterText && <div className="commission-counter"><span className="counter-dots" aria-hidden="true">{Array.from({length:total},(_,i)=><span key={i} className={`dot${i<details.remainingCommissions?' filled':''}`} />)}</span><span>{details.counterText}</span></div>}
    <ContactForm details={details} buttonLabel={section.buttonLabel || 'Begin the conversation'} />
    <div className="cm-divider" />
    <div className="cm-footer-info">
      <div><span className="cm-fi-label">Call</span><span className="cm-fi-value">{details.phone}</span></div>
      <div><span className="cm-fi-label">Studio</span><span className="cm-fi-value">{details.studio}</span></div>
      <div><span className="cm-fi-label">Email</span><span className="cm-fi-value">{details.email}</span></div>
    </div>
  </div></section>;
}
