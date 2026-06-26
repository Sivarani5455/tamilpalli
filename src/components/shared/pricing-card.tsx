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
      className="overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-[0_16px_40px_-30px_rgba(17,25,53,0.18)]"
    >
      <div className={`h-1.5 bg-gradient-to-r ${plan.accent}`} />
      <div className="p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">{plan.slug}</p>
        <h3 className="mt-3 font-display text-3xl text-[var(--brand-ink)]">{plan.name}</h3>
        <p className="mt-5 text-4xl font-semibold text-[var(--brand-ink)]">
          {formatCurrency(plan.price, plan.currency)}
        </p>
        <p className="mt-1 text-sm text-slate-500">{monthLabel}</p>

        <p className="mt-6 text-sm leading-7 text-slate-600">{plan.description}</p>
        <ul className="mt-5 space-y-2 text-sm text-slate-700">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1.5 h-2 w-2 rounded-full bg-[var(--brand-teal)]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Link
          href={`/${locale}/auth/register`}
          className="mt-6 inline-flex rounded-xl bg-[#4058ff] px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px] hover:bg-[#3148e8]"
        >
          {buttonLabel}
        </Link>
      </div>
    </article>
  );
}
