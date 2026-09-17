import type { Core } from "@strapi/strapi";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
export async function seedContact(strapi: Core.Strapi) {
  // One-time local setup: a separate create-only token never reaches the browser.
  const envPath = path.resolve(strapi.dirs.app.root, "../web/.env.local");
  const env = await readFile(envPath, "utf8");
  if (!/^STRAPI_INQUIRY_TOKEN=/m.test(env)) {
    const token = await strapi.service("admin::api-token").create({
      name: "Website inquiry submissions",
      description: "Create inquiries only",
      type: "custom",
      lifespan: null,
      permissions: ["api::inquiry.inquiry.create"],
    });
    await writeFile(envPath, env.trimEnd() + "\nSTRAPI_INQUIRY_TOKEN=" + token.accessKey + "\n", {
      mode: 0o600,
    });
  }
  const documents = strapi.documents("api::homepage-section.homepage-section");
  if (!(await documents.findFirst({ filters: { sectionKey: "contact" } })))
    await documents.create({
      status: "published",
      data: {
        sectionKey: "contact",
        eyebrow: "Commission a Piece",
        title: "Tell us who we're",
        description:
          "Not a quote request. A conversation about a life, and how it should be held in stone.",
        buttonLabel: "Begin the conversation",
        sortOrder: 9,
        contact: {
          titleEmphasis: "remembering.",
          counterText: "4 of 6 commissions remaining for 2026",
          totalCommissions: 6,
          remainingCommissions: 4,
          inquiryLabel: "What brings you here",
          inquiryTypes: "A new memorial\nRestoration work\nNot sure yet",
          namePlaceholder: "Your name",
          emailPlaceholder: "name@example.com",
          messagePlaceholder: "Anything you'd like us to know — a name, a date, a feeling.",
          note: "Read personally by Drew. No mailing list, no follow-up calls you didn't ask for.",
          successMessage: "Thank you. Your inquiry has been received.",
          phone: "(307) 000-0000",
          studio: "Wyoming · By Appointment",
          email: "info@bottmonument.com",
        },
      },
    });
  if (!(await documents.findFirst({ filters: { sectionKey: "footer" } })))
    await documents.create({
      status: "published",
      data: {
        sectionKey: "footer",
        sortOrder: 10,
        footer: {
          brand: "Bott® Monument",
          copyright:
            "© 2025 Bott Monument. All rights reserved.\nCrafted with intention. Built for eternity.",
          tagline: "In stone we remember.",
          taglineEmphasis: "In memory we live.",
        },
      },
    });
}
