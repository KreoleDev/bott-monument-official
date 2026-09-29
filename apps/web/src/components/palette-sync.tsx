"use client";

import { useEffect } from "react";
import { applyPalette } from "@/lib/apply-palette";
import type { PaletteSnapshot } from "@/lib/active-palette";

export function PaletteSync({ preview }: { preview: boolean }) {
  useEffect(() => {
    let stopped = false;
    let request: AbortController | null = null;
    async function refresh() {
      if (document.visibilityState === "hidden" || request) return;
      const controller = new AbortController();
      request = controller;
      const timeout = window.setTimeout(() => controller.abort(), 12000);
      try {
        const response = await fetch("/api/color-palette", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return; // A temporary CMS outage must keep the current colors.
        const snapshot: PaletteSnapshot = await response.json();
        if (!stopped) applyPalette(document.body, snapshot);
      } catch {
        // Retain the last rendered palette; retry on focus or the next interval.
      } finally {
        window.clearTimeout(timeout);
        request = null;
      }
    }
    void refresh();
    window.addEventListener("focus", refresh);
    window.addEventListener("pageshow", refresh);
    document.addEventListener("visibilitychange", refresh);
    const timer = window.setInterval(refresh, preview ? 5000 : 30000);
    return () => {
      stopped = true;
      request?.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("pageshow", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [preview]);
  return null;
}
