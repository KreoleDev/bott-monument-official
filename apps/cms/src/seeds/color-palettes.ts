import type { Core } from "@strapi/strapi";

// Explicit, idempotent setup; never overwrites editorial palettes or an existing selection.
export async function seedColorPalettes(strapi: Core.Strapi) {
  const palettes = strapi.documents("api::color-palette.color-palette");
  const primary = {
    header: { backgroundColor: "#24303D", backgroundEndColor: "#111820", gradientAngle: 160 },
    hero: { backgroundColor: "#0A0A0A" },
    marquee: { backgroundColor: "#24303D", backgroundEndColor: "#111820", gradientAngle: 160 },
    founder: {
      backgroundColor: "#F6F1E7",
      backgroundMiddleColor: "#E7D3A6",
      backgroundEndColor: "#F6F1E7",
      gradientAngle: 120,
    },
    news: { backgroundColor: "#2C3A46" },
    featuredIn: { backgroundColor: "#F7F3ED" },
    gallery: { backgroundColor: "#2C3A46" },
    showroom: {},
    testimonials: { backgroundColor: "#E5DBCB" },
    contact: { backgroundColor: "#2C3A46" },
    footer: { backgroundColor: "#1E1208" },
  };
  const secondary = {
    ...primary,
    header: { backgroundColor: "#0A0A0A" },
    founder: { backgroundColor: "#FFFFFF" },
    news: { backgroundColor: "#24303D", backgroundEndColor: "#111820", gradientAngle: 160 },
    gallery: { backgroundColor: "#0A0A0A" },
    showroom: {
      overlayColor: "#1F2B39",
      textColor: "#F4EBDD",
      mutedTextColor: "#F2E8D9",
      accentColor: "#D0A13A",
      buttonColor: "#C49A3A",
      buttonTextColor: "#18222D",
    },
  };
  let selected = await palettes.findFirst({ filters: { name: "Primary" } });
  if (!selected)
    selected = await palettes.create({
      status: "published",
      data: {
        name: "Primary",
        description:
          "Original local Primary design. Blank detail colors retain its exact typography, accents, borders and surfaces.",
        ...primary,
      },
    });
  if (!(await palettes.findFirst({ filters: { name: "Secondary" } })))
    await palettes.create({
      status: "published",
      data: {
        name: "Secondary",
        description:
          "Colors from the local Secondary design: white founder, navy news and showroom, dark header. Keeps the current site layout and interactions.",
        ...secondary,
      },
    });
  const settings = strapi.documents("api::site-setting.site-setting");
  const current = await settings.findFirst({ populate: ["activePalette"] });
  if (current && !current.activePalette)
    await settings.update({
      documentId: current.documentId,
      status: "published",
      data: { activePalette: selected.documentId },
    });
}
