import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
const source = ts.transpileModule(
  fs.readFileSync(new URL("../src/components/gallery-motion.ts", import.meta.url), "utf8"),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

function setup({ width = 1440, reduced = false, portrait = false, landscape = false } = {}) {
  class Target {
    events = new Map();
    style = {
      setProperty(k, v) {
        this[k] = v;
      },
    };
    classes = new Set();
    captured = new Set();
    classList = { add: (c) => this.classes.add(c), remove: (c) => this.classes.delete(c) };
    addEventListener(k, fn) {
      if (!this.events.has(k)) this.events.set(k, new Set());
      this.events.get(k).add(fn);
    }
    removeEventListener(k, fn) {
      this.events.get(k)?.delete(fn);
    }
    emit(k, overrides = {}) {
      const event = {
        pointerId: 1,
        pointerType: "mouse",
        button: 0,
        clientX: 0,
        clientY: 0,
        cancelable: true,
        preventDefault() {
          this.prevented = true;
        },
        ...overrides,
      };
      for (const fn of this.events.get(k) || []) fn(event);
      return event;
    }
    setPointerCapture(id) {
      this.captured.add(id);
    }
    hasPointerCapture(id) {
      return this.captured.has(id);
    }
    releasePointerCapture(id) {
      this.captured.delete(id);
      this.emit("lostpointercapture", { pointerId: id });
    }
  }
  const viewport = new Target(),
    ring = new Target(),
    items = Array.from({ length: 13 }, () => new Target()),
    win = new Target();
  viewport.clientWidth = width;
  viewport.querySelector = () => ring;
  viewport.closest = () => ({ querySelector: () => null });
  ring.querySelectorAll = () => items;
  win.innerWidth = width;
  win.matchMedia = (q) => ({
    matches: q.includes("reduced-motion") ? reduced : q.includes("portrait") ? portrait : landscape,
  });
  const frames = new Map();
  let id = 0;
  const context = {
    exports: {},
    window: win,
    document: { hidden: false },
    requestAnimationFrame: (fn) => {
      frames.set(++id, fn);
      return id;
    },
    cancelAnimationFrame: (i) => frames.delete(i),
  };
  vm.runInNewContext(source, context);
  const cleanup = context.exports.startGalleryMotion(viewport);
  const tick = (time) => {
    const [id, fn] = frames.entries().next().value;
    frames.delete(id);
    fn(time);
  };
  return {
    viewport,
    ring,
    items,
    win,
    cleanup,
    tick,
    frames,
    angle: () => Number(ring.style.transform.match(/rotateY\(([^d]+)/)[1]),
  };
}

test("auto rotation pauses on hover and resumes on leave", () => {
  const s = setup();
  s.tick(16);
  const before = s.angle();
  assert.ok(before > 0);
  s.items[0].emit("mouseenter");
  s.tick(32);
  assert.equal(s.angle(), before);
  s.items[0].emit("mouseleave");
  s.tick(48);
  assert.ok(s.angle() > before);
  s.cleanup();
});

test("mouse drag follows direction, pauses auto motion, and releases pointer capture", () => {
  const s = setup();
  s.viewport.emit("pointerdown", { clientX: 100 });
  s.viewport.emit("pointermove", { clientX: 180 });
  assert.equal(s.angle(), 20);
  s.tick(16);
  assert.equal(s.angle(), 20);
  s.win.emit("pointerup");
  assert.equal(s.viewport.captured.size, 0);
  assert.ok(!s.viewport.classes.has("is-dragging"));
  s.tick(32);
  assert.ok(s.angle() > 20);
  s.cleanup();
});

test("vertical touch scroll is not captured; horizontal swipes rotate", () => {
  const s = setup();
  s.viewport.emit("pointerdown", { pointerType: "touch" });
  const vertical = s.viewport.emit("pointermove", {
    pointerType: "touch",
    clientX: 2,
    clientY: 20,
  });
  assert.equal(vertical.prevented, undefined);
  assert.equal(s.angle(), 0);
  assert.equal(s.viewport.captured.size, 0);
  s.viewport.emit("pointerdown", { pointerType: "touch" });
  s.viewport.emit("pointermove", { pointerType: "touch", clientX: -40, clientY: 2 });
  assert.equal(s.angle(), -10);
  s.win.emit("pointercancel");
  assert.equal(s.viewport.captured.size, 0);
  s.cleanup();
});

test("keyboard rotates and reduced-motion disables automatic movement", () => {
  const s = setup({ reduced: true });
  s.tick(16);
  assert.equal(s.angle(), 0);
  s.viewport.emit("keydown", { key: "ArrowRight" });
  assert.equal(s.angle(), -360 / 13);
  s.viewport.emit("keydown", { key: "ArrowLeft" });
  assert.equal(s.angle(), 0);
  s.cleanup();
});

test("layout preserves mobile and tablet dimensions and cleans up listeners", () => {
  for (const [config, expected] of [
    [{ width: 390 }, "160px"],
    [{ width: 820, portrait: true }, "160px"],
    [{ width: 1180, landscape: true }, "205px"],
    [{ width: 1800 }, "280px"],
  ]) {
    const s = setup(config);
    assert.equal(s.viewport.style["--cg-card-w"], expected);
    s.cleanup();
    assert.equal(s.frames.size, 0);
    for (const target of [s.viewport, s.win, ...s.items])
      for (const listeners of target.events.values()) assert.equal(listeners.size, 0);
  }
});
