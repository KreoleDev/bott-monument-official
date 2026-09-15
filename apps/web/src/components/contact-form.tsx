'use client';
import { useState, useRef, type FormEvent } from 'react';
import type { ContactDetails } from '@/lib/strapi';

export function ContactForm({ details, buttonLabel }: { details: ContactDetails; buttonLabel: string }) {
  const [pending,setPending]=useState(false);
  const [feedback,setFeedback]=useState('');
  const inFlight=useRef(false);
  const options=(details.inquiryTypes || '').split('\n').map(s=>s.trim()).filter(Boolean);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if(inFlight.current) return;
    inFlight.current=true; setPending(true); setFeedback('');
    const form=event.currentTarget;
    const data=Object.fromEntries(new FormData(form));
    try {
      const response=await fetch('/api/inquiries',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});
      if(!response.ok) throw new Error('Could not save your message. Please try again.');
      form.reset(); setFeedback(details.successMessage || 'Thank you. Your inquiry has been received.');
    } catch { setFeedback('Could not save your message. Please try again.'); }
    finally { inFlight.current=false; setPending(false); }
  }
  return <form className="commission-form" onSubmit={submit}>
    <fieldset disabled={pending}>
      <legend className="cm-label">{details.inquiryLabel}</legend>
      <div className="cm-pills">{options.map((option,i)=><label className="cm-pill" key={option}><input className="sr-only" type="radio" name="inquiryType" value={option} defaultChecked={i===options.length-1} required />{option}</label>)}</div>
      <label className="sr-only" htmlFor="cmName">Your name</label><input name="name" className="cm-input" id="cmName" placeholder={details.namePlaceholder} required maxLength={150} autoComplete="name" />
      <label className="sr-only" htmlFor="cmEmail">Email address</label><input name="email" type="email" className="cm-input" id="cmEmail" placeholder={details.emailPlaceholder} required maxLength={254} autoComplete="email" />
      <label className="sr-only" htmlFor="cmMessage">Your message</label><textarea name="message" className="cm-input" id="cmMessage" placeholder={details.messagePlaceholder} maxLength={5000} />
      <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <button type="submit" className="cm-submit" disabled={pending}>{pending?'Sending…':buttonLabel}</button>
    </fieldset>
    <p className="cm-status" role="status" aria-live="polite">{feedback}</p>
    <p className="cm-note">{details.note}</p>
  </form>;
}
