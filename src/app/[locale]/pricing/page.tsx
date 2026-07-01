import { PricingCard } from "@/components/shared/pricing-card";
import { getLocaleOrThrow } from "@/lib/i18n";
import { getPlans } from "@/lib/subscriptions";
import type { PlanSlug } from "@/types";

const planLabel: Record<PlanSlug, string> = {
  discovery: "Discovery",
  standard: "Standard",
  elite: "Elite",
};

export default async function PricingPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale: rawLocale } = await params;
  const resolvedSearchParams = await searchParams;
  const locale = getLocaleOrThrow(rawLocale);
  const plans = await getPlans();
  const content = typeof resolvedSearchParams.content === "string" ? resolvedSearchParams.content : "";
  const disabled = resolvedSearchParams.disabled === "1";
  const requestedPlans =
    typeof resolvedSearchParams.plans === "string" && resolvedSearchParams.plans.length > 0
      ? (resolvedSearchParams.plans.split(",").filter(Boolean) as PlanSlug[])
      : [];
  const focusPlan =
    typeof resolvedSearchParams.focus === "string" ? (resolvedSearchParams.focus as PlanSlug) : null;
  const visiblePlans = focusPlan ? plans.filter((plan) => plan.slug === focusPlan) : plans;
  const copy =
    locale === "ta"
      ? {
          access: "உள்ளடக்க அணுகல்",
          unavailable: "தற்போது கிடைக்கவில்லை.",
          disabledMessage: "இந்த உள்ளடக்கம் அனைத்து திட்டங்களுக்கும் நிர்வாகியால் முடக்கப்பட்டுள்ளது.",
          availableWith: "இந்த உள்ளடக்கம் கிடைக்கும் திட்டம்",
          unlockMessage: "இந்த உள்ளடக்கத்தைத் திறந்து உங்கள் முன்னேற்றத்தைத் தொடர பொருத்தமான திட்டத்தைத் தேர்வு செய்யுங்கள்.",
          viewPlan: "திட்டத்தை பார்க்க",
        }
      : locale === "fr"
        ? {
            access: "Accès au contenu",
            unavailable: "est actuellement indisponible.",
            disabledMessage: "Ce contenu a été désactivé pour toutes les offres par l'administrateur.",
            availableWith: "est disponible avec l'offre",
            unlockMessage: "Choisissez l'offre adaptée pour débloquer ce contenu et continuer votre progression.",
            viewPlan: "Voir l'offre",
          }
        : {
            access: "Content access",
            unavailable: "is currently unavailable.",
            disabledMessage: "This content has been disabled for all plans by the administrator.",
            availableWith: "is available with the plan",
            unlockMessage: "Choose the right plan to unlock this content and continue your progress.",
            viewPlan: "View plan",
          };

  return (
    <div className="mx-auto max-w-[120rem] px-4 py-10 sm:px-6 xl:px-8">
      <section className="mb-8 rounded-[1.8rem] border border-[rgba(185,121,63,0.22)] bg-[linear-gradient(160deg,rgba(255,222,145,0.18),rgba(255,255,255,0.16)_46%),#fff8ec] p-6 shadow-[0_20px_50px_-38px_rgba(74,51,36,0.34)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#8a5a2e]">Pricing</p>
        <h1 className="mt-3 max-w-4xl font-display text-5xl tracking-[-0.04em] text-[var(--brand-ink)] sm:text-6xl">
          Choose the right Tamil learning plan.
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-[#6f553d]">
          Clear monthly access, cleaner upgrade paths and content-aware guidance across every learning format.
        </p>
      </section>

      {content ? (
        <div className="mb-8 rounded-[1.6rem] border border-[rgba(185,121,63,0.22)] bg-[#fff8ec]/95 p-6 shadow-[0_16px_40px_-30px_rgba(74,51,36,0.32)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#8a6a4c]">{copy.access}</p>
          {disabled ? (
            <div className="mt-4">
              <h2 className="font-display text-3xl text-[var(--brand-ink)]">
                {content} {copy.unavailable}
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#6f553d]">{copy.disabledMessage}</p>
            </div>
          ) : (
            <div className="mt-4">
              <h2 className="font-display text-3xl text-[var(--brand-ink)]">
                {content} {copy.availableWith}{" "}
                <span className="text-[#8a5a2e]">
                  {requestedPlans.map((plan) => planLabel[plan]).join(" / ")}
                </span>
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-7 text-[#6f553d]">{copy.unlockMessage}</p>
              {focusPlan ? (
                <a
                  href={`#plan-${focusPlan}`}
                  className="mt-5 inline-flex rounded-xl bg-[#8a5a2e] px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#fff2dd] transition hover:bg-[#654632]"
                >
                  {copy.viewPlan} {planLabel[focusPlan]}
                </a>
              ) : null}
            </div>
          )}
        </div>
      ) : null}

      <div className={`grid gap-6 ${visiblePlans.length > 1 ? "lg:grid-cols-3" : "max-w-xl"}`}>
        {visiblePlans.map((plan) => (
          <PricingCard key={plan.id} locale={locale} plan={plan} />
        ))}
      </div>
    </div>
  );
}
