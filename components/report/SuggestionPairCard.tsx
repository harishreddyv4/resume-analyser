import { CopyTextButton } from "./CopyTextButton";

export function SuggestionPairCard({
  original,
  suggestionLabel,
  suggestion,
  detail,
}: {
  original: string;
  suggestionLabel: string;
  suggestion: string;
  detail: string;
}) {
  return (
    <article className="rounded-xl border border-zinc-200 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
        Original
      </p>
      <p className="mt-1 text-sm text-zinc-600">{original}</p>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-zinc-500">
          {suggestionLabel}
        </p>
        <CopyTextButton text={suggestion} />
      </div>
      <p className="mt-1 text-sm font-medium text-zinc-900">{suggestion}</p>
      <p className="mt-2 text-sm text-zinc-600">{detail}</p>
    </article>
  );
}
