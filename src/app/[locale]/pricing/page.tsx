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
    <div className="relative min-h-screen overflow-hidden bg-[#fbf1e2] px-4 py-8 text-[#180d2b] sm:px-6 xl:px-8">
      <div className="pointer-events-none absolute left-[8%] top-16 h-4 w-4 rotate-12 rounded-[0.25rem] bg-[#c6ff2e]" />
      <div className="pointer-events-none absolute right-[16%] top-24 h-3 w-3 rounded-full bg-[#7c3aed]" />
      <div className="pointer-events-none absolute bottom-20 left-[12%] h-4 w-4 rotate-45 rounded-[0.25rem] bg-[#ffc43d]" />
      <div className="mx-auto max-w-[76rem]">
        <section className="relative mb-8 overflow-hidden rounded-[1.5rem] border-[3px] border-[#180d2b] bg-white p-6 shadow-[7px_8px_0_#180d2b] sm:p-8">
          <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-[#7c3aed]" />
          <p className="inline-flex rounded-full border-2 border-[#180d2b] bg-[#c6ff2e] px-4 py-1 text-xs font-black uppercase tracking-[0.24em] text-[#180d2b] shadow-[2px_3px_0_#180d2b]">
            Pricing
          </p>
          <h1 className="relative mt-5 max-w-4xl font-display text-4xl font-black tracking-[-0.02em] text-[#180d2b] sm:text-5xl lg:text-6xl">
          Choose the right Tamil learning plan.
          </h1>
          <p className="relative mt-4 max-w-3xl text-base font-semibold leading-8 text-[#6f587f] sm:text-lg">
          Clear monthly access, cleaner upgrade paths and content-aware guidance across every learning format.
          </p>
        </section>

        {content ? (
          <div className="mb-8 rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-6 shadow-[6px_7px_0_#180d2b]">
            <p className="text-sm font-black uppercase tracking-[0.28em] text-[#7c3aed]">{copy.access}</p>
          {disabled ? (
            <div className="mt-4">
              <h2 className="font-display text-3xl font-black text-[#180d2b]">
                {content} {copy.unavailable}
              </h2>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#6f587f]">{copy.disabledMessage}</p>
            </div>
          ) : (
            <div className="mt-4">
              <h2 className="font-display text-3xl font-black text-[#180d2b]">
                {content} {copy.availableWith}{" "}
                <span className="text-[#7c3aed]">
                  {requestedPlans.map((plan) => planLabel[plan]).join(" / ")}
                </span>
              </h2>
              <p className="mt-3 max-w-3xl text-base font-semibold leading-7 text-[#6f587f]">{copy.unlockMessage}</p>
              {focusPlan ? (
                <a
                  href={`#plan-${focusPlan}`}
                  className="mt-5 inline-flex rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5"
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
    </div>
  );
}
