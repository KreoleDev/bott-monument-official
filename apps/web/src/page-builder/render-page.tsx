import type { ComponentType } from "react";
import { FRAGMENT_REGISTRY } from "./registry";
import type { MappedFragment } from "./types";

export function RenderPage({ content }: { content: MappedFragment[] }) {
  return (
    <>
      {content.map((item) => {
        const fragment = FRAGMENT_REGISTRY[item.fragmentName];
        if (!fragment || fragment.placement !== "main") return null;
        const Component = fragment.component as ComponentType<Record<string, unknown>>;
        return <Component key={item.fragmentName} {...item.payload} />;
      })}
    </>
  );
}
