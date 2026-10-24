import type { StrapiApp } from "@strapi/strapi/admin";
import type { EditLayout } from "@strapi/content-manager/strapi-admin";
import { unstable_useContentManagerContext as useContentManagerContext } from "@strapi/content-manager/strapi-admin";
import { ComponentInput } from "@bott/component-input";
import { styled } from "styled-components";
import { InputRenderer } from "@bott/content-input";
import { useField } from "@strapi/strapi/admin";
import { useEffect, useRef } from "react";
import "./page-editor.css";
import { HeaderRuleSection } from "./header-rule-section";

const FixedCard = styled.details`
  color: ${({ theme }) => theme.colors.neutral800};
  background: ${({ theme }) => theme.colors.neutral0};
  border-color: ${({ theme }) => theme.colors.neutral200};
`;

const TITLE_OVERRIDES: Record<string, string> = {
  header: "Header",
  hero: "Hero",
  marquee: "Marquee",
  founder: "Founder",
  news: "News",
  featuredIn: "Featured In",
  gallery: "Gallery",
  showroom: "Showroom",
  testimonials: "Testimonials",
  contact: "Contact",
  footer: "Footer",
  privateGallery: "Gallery Page",
  headerScroll: "Header Scroll",
  seo: "SEO",
};

const GALLERY_PAGE_FIELD_LABELS: Record<string, string> = {
  eyebrow: "Page eyebrow",
  title: "Gallery heading",
  description: "Access instructions",
  accessCheckEyebrow: "Access form eyebrow",
  accessCheckTitle: "Access form heading",
  emailLabel: "Email field label",
  emailPlaceholder: "Email placeholder",
  submitLabel: "Submit button label",
  checkingLabel: "Checking message",
  accessDeniedMessage: "No access message",
  errorMessage: "Verification error message",
  emptyGalleryMessage: "Empty gallery message",
  backgroundColor: "Background color",
  backgroundMiddleColor: "Background gradient middle color",
  backgroundEndColor: "Background gradient end color",
  textColor: "Main text color",
  mutedTextColor: "Secondary text color",
  accentColor: "Accent color",
  surfaceColor: "Access form background color",
  surfaceTextColor: "Access form text color",
  borderColor: "Border color",
  buttonColor: "Button background color",
  buttonTextColor: "Button text color",
};

function fieldTitle(name: unknown, label: unknown) {
  const key = String(name);
  return TITLE_OVERRIDES[key] || String(label || key[0].toUpperCase() + key.slice(1));
}

function FixedPageField(props: Record<string, unknown>) {
  const { model, layout } = useContentManagerContext();
  const attribute = props.attribute as { component: string };
  const input = (
    <ComponentInput {...props} layout={layout.edit.components[attribute.component]?.layout || []}>
      {(child: Record<string, unknown>) =>
        model === "api::color-palette.color-palette" &&
        attribute.component === "theme.header-scroll" &&
        String(child.name).endsWith(".section") ? (
          <HeaderRuleSection {...child} />
        ) : (
          <InputRenderer
            {...child}
            label={
              attribute.component === "pages.private-gallery"
                ? GALLERY_PAGE_FIELD_LABELS[String(child.name).split(".").at(-1) || ""] || child.label
                : child.label
            }
          />
        )
      }
    </ComponentInput>
  );

  const details = useRef<HTMLDetailsElement>(null);
  const { error } = useField(String(props.name));
  useEffect(() => {
    if (error && details.current) details.current.open = true;
  }, [error]);

  const fixedPageField =
    model === "api::page.page" &&
    ["header", "hero", "footer", "seo", "privateGallery"].includes(String(props.name));
  const colorPaletteSection =
    model === "api::color-palette.color-palette" && attribute.component === "theme.section-colors";

  if (!fixedPageField && !colorPaletteSection)
    return input;

  return (
    <FixedCard
      ref={details}
      className={`bott-collapsible-field ${
        colorPaletteSection ? "bott-palette-section-field" : "bott-fixed-page-field"
      }`}
    >
      <summary>
        <span className="bott-collapsible-title">{fieldTitle(props.name, props.label)}</span>
        {fixedPageField && props.name !== "seo" && (
          <span className="bott-collapsible-meta">
            {props.name === "privateGallery" ? "Gallery access page" : "Fixed position"}
          </span>
        )}
        {colorPaletteSection && <span className="bott-collapsible-meta">Color section</span>}
      </summary>
      <div className="bott-collapsible-field-content">{input}</div>
    </FixedCard>
  );
}

export default {
  register(app: StrapiApp) {
    app.addFields({ type: "component", Component: FixedPageField });
    app.registerHook(
      "Admin/CM/pages/EditView/mutate-edit-view-layout",
      (context: { layout: EditLayout; model?: string; uid?: string }) => {
        const fields = context.layout.layout.flat(2);
        const galleryAccessLayout = fields.some((field) => field.name === "accessTokenHash");
        if (galleryAccessLayout) {
          const visibleFields = new Set([
            "name",
            "email",
            "accessActive",
            "accessNotificationSentAt",
            "accessTokenExpiresAt",
          ]);
          const labels: Record<string, string> = {
            accessActive: "Gallery access",
            accessNotificationSentAt: "Access starts",
            accessTokenExpiresAt: "Access ends",
          };
          return {
            ...context,
            layout: {
              ...context.layout,
              layout: context.layout.layout
                .map((panel) =>
                  panel
                    .map((row) =>
                      row
                        .filter((field) => visibleFields.has(field.name))
                        .map((field) => ({ ...field, label: labels[field.name] || field.label })),
                    )
                    .filter((row) => row.length),
                )
                .filter((panel) => panel.length),
            },
          };
        }
        const privateGalleryImageLayout =
          fields.some((field) => field.name === "caption") &&
          fields.some((field) => field.name === "image") &&
          fields.some((field) => field.name === "category") &&
          fields.some((field) => field.name === "sortOrder");
        if (privateGalleryImageLayout) {
          const labels: Record<string, string> = {
            title: "Image title",
            caption: "Image caption",
            image: "Upload image from your computer",
            sortOrder: "Display order",
            category: "Category",
          };
          return {
            ...context,
            layout: {
              ...context.layout,
              layout: context.layout.layout.map((panel) =>
                panel.map((row) =>
                  row.map((field) => ({ ...field, label: labels[field.name] || field.label })),
                ),
              ),
            },
          };
        }
        if (
          !fields.some(
            (field) =>
              field.name === "hero" &&
              field.attribute.type === "component" &&
              field.attribute.component === "pages.hero",
          )
        )
          return context;
        const ordered = ["header", "hero", "privateGallery", "content", "footer"];
        const metadata = context.layout.layout
          .map((panel) =>
            panel
              .map((row) => row.filter((field) => !ordered.includes(field.name)))
              .filter((row) => row.length),
          )
          .filter((panel) => panel.length);
        const sections = ordered.flatMap((name) => {
          const field = fields.find((item) => item.name === name);
          if (!field) return [];
          return [
            [
              {
                ...field,
                size: 12,
                label:
                  name === "content"
                    ? "Sections"
                    : name === "privateGallery"
                      ? "Gallery page"
                      : name[0].toUpperCase() + name.slice(1),
              },
            ],
          ];
        });
        return {
          ...context,
          layout: { ...context.layout, layout: [...metadata, ...sections.map((row) => [row])] },
        };
      },
    );
    app.registerHook(
      "Admin/CM/pages/ListView/inject-column-in-table",
      (context: {
        displayedHeaders: Array<Record<string, unknown> & { name: string }>;
        layout: Record<string, unknown>;
      }) => {
        if (
          !context.displayedHeaders.some((field) => field.name === "accessTokenExpiresAt") ||
          !context.displayedHeaders.some((field) => field.name === "accessActive")
        )
          return context;

        const labels: Record<string, string> = {
          name: "Name",
          email: "Email",
          accessTokenExpiresAt: "Access ends",
          accessActive: "Access status",
        };
        const visibleFields = new Set(Object.keys(labels));
        return {
          ...context,
          displayedHeaders: context.displayedHeaders
            .filter((field) => visibleFields.has(field.name))
            .map((field) => ({
              ...field,
              label: labels[field.name],
              ...(field.name === "accessActive"
                ? {
                    cellFormatter: (document: Record<string, unknown>) =>
                      document.accessActive ? "Active" : "Inactive",
                  }
                : {}),
            })),
        };
      },
    );
  },
};
