'use client';
import {useEffect} from 'react';
export function ScrollReveal() {
 useEffect(()=>{
  if(matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
  const elements=Array.from(document.querySelectorAll('main section h2, .section-eyebrow, .commission-sub, .test-header'));
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.remove('scroll-reveal-pending');observer.unobserve(entry.target);}}),{threshold:.1});
  elements.forEach(element=>{if(element.getBoundingClientRect().top>innerHeight){element.classList.add('scroll-reveal-pending');observer.observe(element);}});
  return()=>{observer.disconnect();elements.forEach(element=>element.classList.remove('scroll-reveal-pending'));};
 },[]);
 return null;
}
