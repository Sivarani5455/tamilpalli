import Link from "next/link";

import { formatCurrency } from "@/lib/utils";
import type { Locale, Plan } from "@/types";

export function PricingCard({ locale, plan }: { locale: Locale; plan: Plan }) {
  const monthLabel = locale === "ta" ? "ஒரு மாதத்திற்கு" : locale === "fr" ? "par mois" : "per month";
  const buttonLabel =
    locale === "ta"
      ? `${plan.name} தேர்வு செய்`
      : locale === "fr"
        ? `Choisir ${plan.name}`
        : `Choose ${plan.name}`;
  const palette =
    plan.slug === "elite"
      ? { badge: "#ff3b6f", panel: "#ffe3ec" }
      : plan.slug === "standard"
        ? { badge: "#7c3aed", panel: "#eee5ff" }
        : { badge: "#20bf73", panel: "#e2f8ed" };

  return (
    <article
      id={`plan-${plan.slug}`}
      className="group overflow-hidden rounded-[1.35rem] border-[3px] border-[#180d2b] bg-white shadow-[6px_7px_0_#180d2b] transition hover:-translate-y-1"
    >
      <div className="h-3 border-b-[3px] border-[#180d2b]" style={{ backgroundColor: palette.badge }} />
      <div className="p-6">
        <p
          className="inline-flex rounded-full border-2 border-[#180d2b] px-3 py-1 text-xs font-black uppercase tracking-[0.22em] text-[#180d2b] shadow-[2px_3px_0_#180d2b]"
          style={{ backgroundColor: palette.panel }}
        >
          {plan.slug}
        </p>
        <h3 className="mt-4 font-display text-3xl font-black tracking-[-0.02em] text-[#180d2b]">{plan.name}</h3>
        <div className="mt-5 rounded-[1.1rem] border-[3px] border-[#180d2b] p-4 shadow-[3px_4px_0_#180d2b]" style={{ backgroundColor: palette.panel }}>
          <p className="text-4xl font-black text-[#180d2b]">{formatCurrency(plan.price, plan.currency)}</p>
          <p className="mt-1 text-sm font-bold text-[#6f587f]">{monthLabel}</p>
        </div>

        <p className="mt-6 text-sm font-semibold leading-7 text-[#6f587f]">{plan.description}</p>
        <ul className="mt-5 space-y-2 text-sm font-semibold text-[#180d2b]">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full border-2 border-[#180d2b]" style={{ backgroundColor: palette.badge }} />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/${locale}/auth/register`}
          className="mt-6 inline-flex rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] px-5 py-3 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5"
        >
          {buttonLabel}
        </Link>
      </div>
    </article>
  );
}
