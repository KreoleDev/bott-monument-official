"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export function Header({
  logo,
  siteName = "Bott Monument",
}: {
  logo?: string | null;
  siteName?: string;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const nav = useRef<HTMLElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const syncHeaderState = () => {
      setIsScrolled(window.scrollY > 80);
    };

    syncHeaderState();
    window.addEventListener("scroll", syncHeaderState, { passive: true });

    return () => window.removeEventListener("scroll", syncHeaderState);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuButton.current?.focus();
      }
    };
    const outside = (event: PointerEvent) => {
      if (!nav.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const resize = () => {
      if (window.innerWidth >= 700) setMenuOpen(false);
    };
    document.addEventListener("keydown", close);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("resize", resize);
    return () => {
      document.removeEventListener("keydown", close);
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("resize", resize);
    };
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <nav
        ref={nav}
        aria-label="Main navigation"
        id="navbar"
        className={`site-nav${isScrolled ? " scrolled" : ""}`}
      >
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
        <button
          ref={menuButton}
          type="button"
          className="nav-menu-toggle"
          aria-expanded={menuOpen}
          aria-controls="main-nav-links"
          onClick={() => setMenuOpen((open) => !open)}
        >
          {menuOpen ? "Close" : "Menu"} <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
        </button>
        <ul
          id="main-nav-links"
          className={`nav-links${menuOpen ? " is-open" : ""}`}
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setMenuOpen(false);
          }}
        >
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
      </nav>
    </>
  );
}
