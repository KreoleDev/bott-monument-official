"use client";

import { headerScrollRule } from '@/lib/color-palette';
import type { CSSProperties } from 'react';
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function Header({ logo, siteName = "Bott Monument" }: { logo?: string | null; siteName?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollColors, setScrollColors] = useState<CSSProperties>();

  useEffect(() => {
    let rule = headerScrollRule();
    let section: HTMLElement | null = null;
    let lastColors = '';
    const syncHeaderState = () => {
      setIsScrolled(window.scrollY > 80);
      const rect = section?.getBoundingClientRect();
      // Geometry is local; scrolling never requests CMS data.
      const targetLine = window.innerHeight * 0.35;
      const active = rule.enabled && window.scrollY > 80 && rect && rect.top <= targetLine && rect.bottom >= targetLine;
      const colorsKey = active ? `${rule.backgroundColor}/${rule.textColor}` : '';
      if (colorsKey === lastColors) return;
      lastColors = colorsKey;
      setScrollColors(active ? {
        '--palette-header-background': rule.backgroundColor,
        '--palette-header-text-color': rule.textColor,
      } as CSSProperties : undefined);
    };

    const syncRule = () => {
      try { rule = headerScrollRule(JSON.parse(document.body.dataset.headerScroll || 'null')); }
      catch { rule = headerScrollRule(); }
      section = document.getElementById(rule.section);
      syncHeaderState();
    };
    syncRule();
    const observer = new MutationObserver(syncRule);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-header-scroll'] });
    window.addEventListener("scroll", syncHeaderState, { passive: true });
    window.addEventListener("resize", syncHeaderState);

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", syncHeaderState);
      window.removeEventListener("resize", syncHeaderState);
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setMenuOpen(false); menuButton.current?.focus(); }
    };
    const outside = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const resize = () => { if (window.innerWidth >= 700) setMenuOpen(false); };
    document.addEventListener('keydown', close);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('keydown', close);
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', resize);
    };
  }, [menuOpen]);


  return (
    <><a className="skip-link" href="#main-content">Skip to content</a><nav ref={nav} aria-label="Main navigation" id="navbar" style={scrollColors} className={`site-nav${isScrolled ? " scrolled" : ""}`}>
      <a className="nav-logo" href="#" aria-label="Bott Monument home">
        <span className="sr-only">Bott Monument</span>
        <Image
          src={logo || "/bott-logo.png"}
          alt={siteName}
          width={637}
          height={211}
          priority
          style={{
            height: "max(55px, 3.6vw)",
            width: "auto",
            filter: "brightness(1.25) contrast(1.08)",
          }}
        />
      </a>
      <button ref={menuButton} type="button" className="nav-menu-toggle" aria-expanded={menuOpen} aria-controls="main-nav-links" onClick={() => setMenuOpen(open => !open)}>
        {menuOpen ? 'Close' : 'Menu'} <span aria-hidden="true">{menuOpen ? '×' : '☰'}</span>
      </button>
      <ul id="main-nav-links" className={`nav-links${menuOpen ? ' is-open' : ''}`} onClick={event => { if ((event.target as HTMLElement).closest('a')) setMenuOpen(false); }}>
        <li>
          <a href="#work">Masterpieces</a>
        </li>
        <li>
          <a href="#magazine">Gallery</a>
        </li>
        <li>
          <a href="#contact">Inquire</a>
        </li>
        <li>
          <a href="#showroom">About</a>
        </li>
      </ul>
    </nav></>
  );
}
