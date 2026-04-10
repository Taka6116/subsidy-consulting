import type { MatchedSubsidyPreview } from "@/lib/subsidyCheckMocks";

type Props = {
  item: MatchedSubsidyPreview;
};

export default function SubsidyResultCard({ item }: Props) {
  const d = item.decision;
  const insightTeaser = d?.insightCards?.[0]?.body?.trim();
  const blurb = d?.summary?.trim() || item.description?.trim() || item.summary;

  return (
    <article className="group flex h-full flex-col rounded-xl border border-white/10 bg-white p-6 shadow-[0_8px_32px_rgba(0,0,0,0.25)] transition-shadow hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)]">
      <span className="mb-4 inline-block rounded bg-[rgba(0,198,255,0.1)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#00a0cc]">
        候補
      </span>
      <h3 className="font-heading text-lg font-semibold text-portal-primary-container transition-colors group-hover:text-portal-primary">
        {item.name}
      </h3>
      <p className="mt-4 font-heading text-2xl font-bold text-portal-primary-container md:text-3xl">
        {item.maxAmountLabel}
      </p>
      {insightTeaser ? (
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-portal-on-surface-card-sub">
          {insightTeaser}
        </p>
      ) : blurb ? (
        <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-portal-on-surface-card-sub">
          {blurb}
        </p>
      ) : null}
      {item.detailUrl ? (
        <p className="mt-auto pt-4 text-[11px] leading-relaxed text-portal-on-surface-card-sub">
          <a
            href={item.detailUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-portal-primary underline-offset-2 hover:underline"
          >
            {item.detailUrl}
          </a>
        </p>
      ) : null}
    </article>
  );
}
