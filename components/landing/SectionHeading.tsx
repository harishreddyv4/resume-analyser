type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";

  return (
    <div className={`max-w-2xl ${alignClass}`}>
      {eyebrow ? (
        <p
          className={
            align === "center"
              ? "mx-auto flex max-w-xl items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800/90"
              : "inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-800/90"
          }
        >
          {align === "center" ? (
            <span
              className="h-px w-8 bg-gradient-to-r from-transparent to-cyan-600/50"
              aria-hidden
            />
          ) : (
            <span
              className="h-px w-8 bg-gradient-to-r from-cyan-600/60 to-transparent"
              aria-hidden
            />
          )}
          {eyebrow}
          {align === "center" ? (
            <span
              className="h-px w-8 bg-gradient-to-l from-transparent to-cyan-600/50"
              aria-hidden
            />
          ) : null}
        </p>
      ) : null}
      <h2 className="mt-4 text-balance text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
          {description}
        </p>
      ) : null}
    </div>
  );
}
