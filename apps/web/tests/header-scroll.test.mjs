import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { loadTs } from "./load-ts.mjs";
const { headerScrollRule } = loadTs("../src/lib/color-palette.ts");

test("scroll settings default legacy palettes and reject unsafe colors and sections", () => {
  assert.equal(headerScrollRule(null).section, "work");
  const rule = headerScrollRule({
    enabled: false,
    section: "body > script",
    backgroundColor: "url(x)",
    textColor: "#123456",
  });
  assert.equal(rule.enabled, false);
  assert.equal(rule.section, "work");
  assert.equal(rule.backgroundColor, "#0A0A0A");
  assert.equal(rule.textColor, "#123456");
});

test("header applies local rules, restores colors, and follows palette updates without fetching", () => {
  const source = readFileSync(new URL("../src/components/header.tsx", import.meta.url), "utf8");
  const effect = source.split("  useEffect(() => {")[1].split("  }, []);")[0];
  const js = ts.transpileModule(`function effect(){${effect}}`, {
    compilerOptions: { target: ts.ScriptTarget.ES2020 },
  }).outputText;
  let colors,
    scrolled,
    updateRule,
    disconnected = false,
    updates = 0;
  const listeners = new Map();
  const window = {
    scrollY: 100,
    innerHeight: 1000,
    addEventListener: (name, fn) => listeners.set(name, fn),
    removeEventListener: (name) => listeners.delete(name),
  };
  let rect = { top: 200, bottom: 800 };
  const document = {
    body: {
      dataset: {
        headerScroll: JSON.stringify({
          section: "work",
          backgroundColor: "#112233",
          textColor: "#FFFFFF",
        }),
      },
    },
    getElementById: (id) => (id === "work" ? { getBoundingClientRect: () => rect } : null),
  };
  const cleanup = vm.runInNewContext(`${js};effect()`, {
    window,
    document,
    headerScrollRule,
    setIsScrolled: (value) => (scrolled = value),
    setScrollColors: (value) => {
      colors = value;
      updates++;
    },
    MutationObserver: class {
      constructor(fn) {
        updateRule = fn;
      }
      observe() {}
      disconnect() {
        disconnected = true;
      }
    },
  });
  assert.equal(colors["--palette-header-background"], "#112233");
  listeners.get("scroll")();
  assert.equal(updates, 1);
  rect = { top: 400, bottom: 800 };
  listeners.get("scroll")();
  assert.equal(colors, undefined);
  rect = { top: 0, bottom: 800 };
  listeners.get("resize")();
  assert.equal(colors["--palette-header-text-color"], "#FFFFFF");
  document.body.dataset.headerScroll = JSON.stringify({ enabled: false });
  updateRule();
  assert.equal(colors, undefined);
  document.body.dataset.headerScroll = JSON.stringify({
    section: "work",
    backgroundColor: "#445566",
  });
  updateRule();
  assert.equal(colors["--palette-header-background"], "#445566");
  document.body.dataset.headerScroll = JSON.stringify({ section: "contact" });
  updateRule();
  assert.equal(colors, undefined);
  window.scrollY = 0;
  listeners.get("scroll")();
  assert.equal(scrolled, false);
  cleanup();
  assert.equal(listeners.size, 0);
  assert.equal(disconnected, true);
});
