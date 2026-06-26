import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Locale, PlanSlug } from "@/types";

const planLabel: Record<PlanSlug, string> = {
  discovery: "Discovery",
  standard: "Standard",
  elite: "Elite",
};

export function ContentCard({
  locale,
  title,
  description,
  href,
  accessible,
  lockedReason,
  lockedPlans,
  lockedForAll,
}: {
  locale: Locale;
  title: string;
  description: string;
  href: string;
  accessible: boolean;
  lockedReason?: string;
  lockedPlans?: PlanSlug[];
  lockedForAll?: boolean;
}) {
  const className = cn(
    "group relative overflow-hidden rounded-[1.5rem] border p-6 transition duration-300",
    accessible
      ? "border-slate-200 bg-white shadow-[0_16px_40px_-30px_rgba(17,25,53,0.18)] hover:-translate-y-1 hover:border-[#cfd8ff] hover:shadow-[0_22px_48px_-30px_rgba(64,88,255,0.2)]"
      : "cursor-not-allowed border-dashed border-slate-300 bg-slate-50/90 text-slate-400",
  );

  const body = (
    <>
      {accessible ? (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#dce3ff] via-[#eff4ff] to-[#d8faf1]" />
      ) : null}
      <div className="relative flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl text-[var(--brand-ink)]">{title}</h3>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
            accessible ? "bg-[#eef2ff] text-[#4058ff]" : "bg-slate-200 text-slate-500",
          )}
        >
          {accessible ? "Accessible" : "Locked"}
        </span>
      </div>
      <p className="relative mt-3 text-sm leading-7 text-slate-600">{description}</p>
      {!accessible ? (
        <div className="relative mt-5 rounded-[1.1rem] border border-slate-200 bg-white p-4">
          {lockedForAll ? (
            <p className="text-sm leading-6 text-slate-700">
              Ce contenu est actuellement desactive pour toutes les offres.
            </p>
          ) : lockedPlans && lockedPlans.length > 0 ? (
            <>
              <p className="text-sm leading-6 text-slate-700">
                Ce contenu est disponible avec l&apos;offre{" "}
                <span className="font-semibold text-[var(--brand-ink)]">
                  {lockedPlans.map((plan) => planLabel[plan]).join(" / ")}
                </span>
                .
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {lockedPlans.map((plan) => (
                  <Link
                    key={plan}
                    href={`/${locale}/pricing#plan-${plan}`}
                    className="rounded-xl bg-[#4058ff] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-[#3148e8]"
                  >
                    Voir l&apos;offre {planLabel[plan]}
                  </Link>
                ))}
              </div>
            </>
          ) : lockedReason ? (
            <p className="text-sm leading-6 text-slate-700">{lockedReason}</p>
          ) : null}
        </div>
      ) : null}
    </>
  );

  if (accessible) {
    return (
      <Link href={`/${locale}${href}`} className={className}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}
