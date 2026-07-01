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
      ? "border-[rgba(185,121,63,0.24)] bg-[#fff8ec]/95 shadow-[0_18px_45px_-34px_rgba(74,51,36,0.45)] hover:-translate-y-1 hover:border-[#d3a238] hover:shadow-[0_24px_56px_-34px_rgba(185,121,63,0.35)]"
      : "cursor-not-allowed border-dashed border-[rgba(138,90,46,0.28)] bg-[#ead7bd]/70 text-[#9b8267]",
  );

  const body = (
    <>
      {accessible ? (
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#b9793f] via-[#e8c876] to-[#9c3b2e]" />
      ) : null}
      <div className="relative flex items-center justify-between gap-4">
        <h3 className="font-display text-2xl text-[var(--brand-ink)]">{title}</h3>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em]",
            accessible ? "bg-[#f4dfb6] text-[#8a5a2e]" : "bg-[#d9c3a6] text-[#8a6a4c]",
          )}
        >
          {accessible ? "Accessible" : "Locked"}
        </span>
      </div>
      <p className="relative mt-3 text-sm leading-7 text-[#6f553d]">{description}</p>
      {!accessible ? (
        <div className="relative mt-5 rounded-[1.1rem] border border-[rgba(185,121,63,0.18)] bg-[#fff7ea] p-4">
          {lockedForAll ? (
            <p className="text-sm leading-6 text-[#654632]">
              Ce contenu est actuellement desactive pour toutes les offres.
            </p>
          ) : lockedPlans && lockedPlans.length > 0 ? (
            <>
              <p className="text-sm leading-6 text-[#654632]">
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
                    className="rounded-xl bg-[#8a5a2e] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#fff2dd] transition hover:bg-[#654632]"
                  >
                    Voir l&apos;offre {planLabel[plan]}
                  </Link>
                ))}
              </div>
            </>
          ) : lockedReason ? (
            <p className="text-sm leading-6 text-[#654632]">{lockedReason}</p>
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
