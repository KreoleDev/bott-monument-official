import { headerScrollRules } from "./color-palette";
import type { PaletteSnapshot } from "./active-palette";

/** Update colors without remounting the page, clearing a form or moving the gallery. */
export function applyPalette(
  body: Pick<HTMLElement, "style" | "dataset">,
  snapshot: PaletteSnapshot,
) {
  for (const key of Array.from(body.style)) {
    if (key.startsWith("--palette-") && !(key in snapshot.style)) body.style.removeProperty(key);
  }
  for (const [key, value] of Object.entries(snapshot.style)) body.style.setProperty(key, value);
  body.dataset.colorPalette = snapshot.name;
  body.dataset.headerScroll = JSON.stringify(headerScrollRules(snapshot.headerScroll));
}
