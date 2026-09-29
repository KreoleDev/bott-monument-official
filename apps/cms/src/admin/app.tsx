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
          <InputRenderer {...child} />
        )
      }
    </ComponentInput>
  );

  const details = useRef<HTMLDetailsElement>(null);
  const { error } = useField(String(props.name));
  useEffect(() => {
    if (error && details.current) details.current.open = true;
  }, [error]);
  if (
    model !== "api::page.page" ||
    !["header", "hero", "footer", "seo"].includes(String(props.name))
  )
    return input;
  return (
    <FixedCard ref={details} className="bott-fixed-page-field">
      <summary>
        {props.name === "seo" ? "SEO" : String(props.label)}{" "}
        {props.name !== "seo" && <span>Fixed position</span>}
      </summary>
      <div className="bott-fixed-page-field-content">{input}</div>
    </FixedCard>
  );
}

export default {
  register(app: StrapiApp) {
    app.addFields({ type: "component", Component: FixedPageField });
    app.registerHook(
      "Admin/CM/pages/EditView/mutate-edit-view-layout",
      (context: { layout: EditLayout }) => {
        const fields = context.layout.layout.flat(2);
        if (
          !fields.some(
            (field) =>
              field.name === "hero" &&
              field.attribute.type === "component" &&
              field.attribute.component === "pages.hero",
          )
        )
          return context;
        const ordered = ["header", "hero", "content", "footer"];
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
                label: name === "content" ? "Sections" : name[0].toUpperCase() + name.slice(1),
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
  },
};
