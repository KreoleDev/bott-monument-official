import { useField } from "@strapi/strapi/admin";
import { InputRenderer } from "@bott/content-input";
import { styled } from "styled-components";

const SECTION_FIELDS: Record<string, string> = {
  work: "news",
  "press-clippings": "featuredIn",
  marqueeStrip: "marquee",
};
const Hint = styled.div`
  margin-top: 12px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.neutral200};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.neutral100};
  color: ${({ theme }) => theme.colors.neutral800};
  font-size: 12px;
  line-height: 1.6;
`;
const validColor = (value: unknown): value is string =>
  typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);

/** Read live form values so the hint follows unsaved section and palette edits. */
export function HeaderRuleSection(props: Record<string, unknown>) {
  const { value: section } = useField<string>(String(props.name));
  const field = SECTION_FIELDS[section || ""] || section || "header";
  const { value } = useField<Record<string, string | number | null>>(field);
  const colors = value || {};
  const stops = [
    colors.backgroundColor,
    colors.backgroundMiddleColor,
    colors.backgroundEndColor,
  ].filter(validColor);
  const angle =
    typeof colors.gradientAngle === "number" && Number.isFinite(colors.gradientAngle)
      ? Math.min(360, Math.max(0, colors.gradientAngle))
      : 120;
  const background = validColor(colors.backgroundColor)
    ? stops.length > 1
      ? `linear-gradient(${angle}deg, ${stops.join(", ")})`
      : stops[0]
    : undefined;
  const swatch = (color: string) => (
    <span
      aria-hidden="true"
      style={{
        display: "inline-block",
        width: 16,
        height: 16,
        marginRight: 6,
        verticalAlign: "middle",
        border: "1px solid currentColor",
        background: color,
      }}
    />
  );
  return (
    <div>
      <InputRenderer {...props} />
      <Hint aria-live="polite">
        <strong>Selected section: {field === "featuredIn" ? "Featured In" : field}</strong>
        <div>
          Background:{" "}
          {background ? (
            <>
              {swatch(background)}
              {stops.join(" → ")}
            </>
          ) : (
            "Inherited from Home / original design (no palette override)"
          )}
        </div>
        <div>
          Text:{" "}
          {validColor(colors.textColor) ? (
            <>
              {swatch(colors.textColor)}
              {colors.textColor}
            </>
          ) : (
            "Inherited from Home / original design (no palette override)"
          )}
        </div>
        {validColor(colors.overlayColor) && (
          <div>
            Photo overlay: {swatch(colors.overlayColor)}
            {colors.overlayColor}
          </div>
        )}
        <div>
          These are this palette’s section colors. Images and overlays can affect its appearance.
          Set the header colors below.
        </div>
      </Hint>
    </div>
  );
}
