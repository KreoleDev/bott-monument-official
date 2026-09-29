// Circular gallery interaction settings ported from bott-monument-design/index.html.
export function startGalleryMotion(viewport: HTMLElement) {
  const ring = viewport.querySelector<HTMLElement>(".cg-ring");
  if (!ring) return () => {};
  const items = Array.from(ring.querySelectorAll<HTMLElement>(".cg-item"));
  if (!items.length) return () => {};
  const anglePerItem = 360 / items.length;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let rotation = 0;
  let manual = 0;
  let auto = 0;
  let hovered = false;
  let focused = false;
  let dragging = false;
  let pointerId: number | null = null;
  let startX = 0;
  let startY = 0;
  let horizontal = false;
  let startRotation = 0;
  let frame = 0;
  let previousTime = 0;
  let manuallyPaused = false;

  function applyRotation() {
    rotation = manual + auto;
    ring!.style.transform = `rotateY(${rotation}deg)`;
    items.forEach((item, i) => {
      const relative = (((i * anglePerItem + rotation) % 360) + 360) % 360;
      const normalized = relative > 180 ? 360 - relative : relative;
      item.style.opacity = String(Math.max(0.28, 1 - normalized / 180));
    });
  }

  function layoutSizes() {
    const w = window.innerWidth;
    const width = viewport.clientWidth || w;
    const portrait = window.matchMedia(
      "(min-width: 700px) and (max-width: 1180px) and (orientation: portrait)",
    ).matches;
    const landscape = window.matchMedia(
      "(min-width: 901px) and (max-width: 1366px) and (orientation: landscape)",
    ).matches;
    let radius, cardW, cardH;
    if (portrait) {
      cardW = 160;
      cardH = 210;
      radius = Math.min(380, Math.max(330, (width - cardW) * 0.44));
    } else if (landscape) {
      cardW = 205;
      cardH = 270;
      radius = Math.min(505, Math.max(455, (width - cardW) * 0.46));
    } else if (w <= 600) {
      radius = 240;
      cardW = 160;
      cardH = 210;
    } else if (w <= 900) {
      radius = 340;
      cardW = 210;
      cardH = 270;
    } else if (w <= 1300) {
      radius = 460;
      cardW = 240;
      cardH = 310;
    } else if (w <= 1700) {
      radius = 560;
      cardW = 260;
      cardH = 340;
    } else {
      radius = 640;
      cardW = 280;
      cardH = 360;
    }
    viewport.style.setProperty("--cg-card-w", `${cardW}px`);
    viewport.style.setProperty("--cg-card-h", `${cardH}px`);
    items.forEach((item, i) => {
      item.style.transform = `rotateY(${i * anglePerItem}deg) translateZ(${radius}px)`;
    });
  }

  function tick(time: number) {
    const elapsed = previousTime ? Math.min(time - previousTime, 50) : 1000 / 60;
    previousTime = time;
    if (
      !dragging &&
      !hovered &&
      !focused &&
      !manuallyPaused &&
      !reducedMotion.matches &&
      !document.hidden &&
      !viewport.closest("section")?.querySelector("dialog[open]")
    ) {
      auto += (0.045 * elapsed) / (1000 / 60);
      applyRotation();
    }
    frame = requestAnimationFrame(tick);
  }

  function end(e?: PointerEvent) {
    if (!dragging || (e && e.pointerId !== pointerId)) return;
    const releasedPointer = pointerId;
    dragging = false;
    pointerId = null;
    horizontal = false;
    if (releasedPointer !== null && viewport.hasPointerCapture(releasedPointer))
      viewport.releasePointerCapture(releasedPointer);
    viewport.classList.remove("is-dragging");
    ring!.classList.remove("is-dragging");
  }
  function down(e: PointerEvent) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    focused = false;
    dragging = true;
    pointerId = e.pointerId;
    startX = e.clientX;
    startY = e.clientY;
    horizontal = false;
    startRotation = rotation;
    viewport.classList.add("is-dragging");
    ring!.classList.add("is-dragging");
    try {
      viewport.setPointerCapture(e.pointerId);
    } catch {
      /* Pointer may have been cancelled. */
    }
  }
  function move(e: PointerEvent) {
    if (!dragging || e.pointerId !== pointerId) return;
    const dx = e.clientX - startX,
      dy = e.clientY - startY;
    if (e.pointerType !== "mouse" && !horizontal) {
      if (Math.abs(dy) > 8 && Math.abs(dy) > Math.abs(dx)) {
        end(e);
        return;
      }
      if (Math.abs(dx) < 10) return;
      horizontal = true;
    }
    manual = startRotation + dx * 0.25 - auto;
    applyRotation();
    if (e.cancelable) e.preventDefault();
  }
  const enter = () => {
    hovered = true;
  };
  const leave = () => {
    hovered = false;
  };
  const focus = () => {
    focused = true;
  };
  const blur = () => {
    focused = false;
  };
  function key(e: KeyboardEvent) {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      manual += e.key === "ArrowLeft" ? anglePerItem : -anglePerItem;
      applyRotation();
    } else if (e.key === " ") {
      e.preventDefault();
      manuallyPaused = !manuallyPaused;
    }
  }
  layoutSizes();
  applyRotation();
  frame = requestAnimationFrame(tick);
  window.addEventListener("resize", layoutSizes);
  viewport.addEventListener("pointerdown", down);
  viewport.addEventListener("pointermove", move);
  viewport.addEventListener("lostpointercapture", end);
  window.addEventListener("pointerup", end);
  window.addEventListener("pointercancel", end);
  viewport.addEventListener("focus", focus);
  viewport.addEventListener("blur", blur);
  viewport.addEventListener("keydown", key);
  items.forEach((item) => {
    item.addEventListener("mouseenter", enter);
    item.addEventListener("mouseleave", leave);
  });
  return () => {
    end();
    cancelAnimationFrame(frame);
    window.removeEventListener("resize", layoutSizes);
    viewport.removeEventListener("pointerdown", down);
    viewport.removeEventListener("pointermove", move);
    viewport.removeEventListener("lostpointercapture", end);
    window.removeEventListener("pointerup", end);
    window.removeEventListener("pointercancel", end);
    viewport.removeEventListener("focus", focus);
    viewport.removeEventListener("blur", blur);
    viewport.removeEventListener("keydown", key);
    items.forEach((item) => {
      item.removeEventListener("mouseenter", enter);
      item.removeEventListener("mouseleave", leave);
    });
  };
}
