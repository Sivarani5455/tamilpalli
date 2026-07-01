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

  return (
    <article
      id={`plan-${plan.slug}`}
      className="overflow-hidden rounded-[1.6rem] border border-[rgba(185,121,63,0.24)] bg-[#fff8ec]/95 shadow-[0_18px_45px_-34px_rgba(74,51,36,0.45)]"
    >
      <div className="h-1.5 bg-gradient-to-r from-[#b9793f] via-[#e8c876] to-[#9c3b2e]" />
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a6a4c]">{plan.slug}</p>
        <h3 className="mt-3 font-display text-3xl text-[var(--brand-ink)]">{plan.name}</h3>
        <p className="mt-5 text-4xl font-semibold text-[var(--brand-ink)]">
          {formatCurrency(plan.price, plan.currency)}
        </p>
        <p className="mt-1 text-sm text-[#8a6a4c]">{monthLabel}</p>

        <p className="mt-6 text-sm leading-7 text-[#6f553d]">{plan.description}</p>
        <ul className="mt-5 space-y-2 text-sm text-[#654632]">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-[#d3a238]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/${locale}/auth/register`}
          className="mt-6 inline-flex rounded-xl bg-[#8a5a2e] px-5 py-3 text-sm font-semibold text-[#fff2dd] transition hover:translate-y-[-1px] hover:bg-[#654632]"
        >
          {buttonLabel}
        </Link>
      </div>
    </article>
  );
}
