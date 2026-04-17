/** Public path for the primary brand mark (SVG). */
export const BRAND_LOGO_SRC = "/resume-analyzer-logo.svg";

const INTRINSIC_W = 256;
const INTRINSIC_H = 300;

type BrandLogoProps = {
  className?: string;
  /** When true, hints the browser to fetch early (e.g. header). */
  priority?: boolean;
};

/**
 * Decorative logo; pair with visible text (e.g. site name) for accessibility.
 */
export function BrandLogo({ className, priority }: BrandLogoProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small local SVG; avoids next/image SVG quirks
    <img
      src={BRAND_LOGO_SRC}
      width={INTRINSIC_W}
      height={INTRINSIC_H}
      alt=""
      aria-hidden
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      className={className}
    />
  );
}
