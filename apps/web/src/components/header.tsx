import Image from "next/image";

export function Header() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-black/70 px-6 py-4 text-white backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between">
        <a className="flex items-center" href="#home" aria-label="Bott Monument home">
          <Image
            src="/bott-logo.png"
            alt="Bott Monument"
            width={637}
            height={211}
            priority
            className="h-[max(55px,3.6vw)] w-auto brightness-125 contrast-105 max-md:h-12"
          />
        </a>
        <div className="hidden items-center gap-8 text-sm uppercase tracking-[0.25em] text-white/70 md:flex">
          <a href="#news">MASTERPIECES</a>
          <a href="#gallery">GALLERY</a>
          <a href="#contact">INQUIRE</a>
          <a href="#about">ABOUT</a>
        </div>
      </nav>
    </header>
  );
}
