"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const syncHeaderState = () => {
      setIsScrolled(window.scrollY > 80);
    };

    syncHeaderState();
    window.addEventListener("scroll", syncHeaderState, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncHeaderState);
    };
  }, []);

  return (
    <nav id="navbar" className={`site-nav${isScrolled ? " scrolled" : ""}`}>
      <a className="nav-logo" href="#" aria-label="Bott Monument home">
        <span className="sr-only">Bott Monument</span>
        <Image
          src="/bott-logo.png"
          alt="Bott Monument"
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
      <ul className="nav-links">
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
  );
}
