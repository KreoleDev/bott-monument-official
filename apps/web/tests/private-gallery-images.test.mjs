import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import ts from "typescript";
import { getImageProps } from "next/image.js";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

const exports = {};
vm.runInNewContext(
  ts.transpileModule(
    readFileSync(new URL("../src/lib/private-gallery-images.ts", import.meta.url), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText,
  { exports, URL },
);
const loader = exports.privateGalleryImageLoader;
const src =
  "https://cms.example.com/api/private-gallery/photos/123?email=visitor%40example.com&token=secret";

test("private images use bounded CMS renditions and preserve access credentials", () => {
  for (const [requested, expected] of [
    [84, 160],
    [350, 480],
    [700, 960],
    [1920, 1600],
  ]) {
    const url = new URL(loader({ src, width: requested }));
    assert.equal(url.searchParams.get("width"), String(expected));
    assert.equal(url.searchParams.get("email"), "visitor@example.com");
    assert.equal(url.searchParams.get("token"), "secret");
    assert.equal(url.pathname, "/api/private-gallery/photos/123");
  }
});

test("Next responsive output sends private images directly to the protected CMS route", () => {
  const { props } = getImageProps({
    src,
    loader,
    alt: "Memorial",
    width: 1200,
    height: 900,
    sizes: "25vw",
  });
  assert.equal(props.sizes, "25vw");
  assert.ok(props.srcSet.includes("width=480"));
  assert.ok(props.srcSet.includes("width=960"));
  assert.ok(!props.srcSet.includes("/_next/image"));
  assert.ok(!props.src.includes("/_next/image"));
});

test("opening a detail mounts every photo eagerly while displaying only the selected photo", () => {
  const componentExports = {};
  const require = createRequire(import.meta.url);
  vm.runInNewContext(
    ts.transpileModule(
      readFileSync(
        new URL(
          "../src/app/[locale]/private-gallery/private-gallery-detail-photos.tsx",
          import.meta.url,
        ),
        "utf8",
      ),
      {
        compilerOptions: {
          module: ts.ModuleKind.CommonJS,
          jsx: ts.JsxEmit.ReactJSX,
          esModuleInterop: true,
        },
      },
    ).outputText,
    {
      exports: componentExports,
      require: (id) =>
        id === "@/lib/private-gallery-images" ? { privateGalleryImageLoader: loader } : require(id),
    },
  );
  const photos = [1, 2, 3].map((id) => ({ url: src.replace("/123?", `/${id}?`) }));
  function render(selectedPhoto) {
    return renderToStaticMarkup(
      createElement(componentExports.PrivateGalleryDetailPhotos, {
        photos,
        title: "Memorial",
        selectedPhoto,
        loadingLabel: "Loading photo…",
        onNavigate() {},
      }),
    ).match(/<img\b[^>]*>/g);
  }
  for (const selected of [0, 1, 2]) {
    const images = render(selected);
    assert.equal(images.length, 3);
    images.forEach((image, index) => {
      assert.match(image, /loading="eager"/);
      assert.match(image, new RegExp(`fetchPriority="${index === selected ? "high" : "low"}"`));
      assert.equal(image.includes('hidden=""'), index !== selected);
      assert.ok(image.includes(`/photos/${index + 1}?`));
      assert.ok(image.includes("width=1600"));
    });
  }
});
