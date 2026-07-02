import Link from "next/link";

import { requireUser } from "@/lib/auth";
import { getDictionaryProgressSummary } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { getCategoryAccess } from "@/lib/permissions";
import { getPlans, requireActiveSubscription } from "@/lib/subscriptions";
import { daysRemaining } from "@/lib/utils";
import type { PlanSlug } from "@/types";

const planLabel: Record<PlanSlug, string> = {
  discovery: "Discovery",
  standard: "Standard",
  elite: "Elite",
};

const planUpgradeTarget: Record<PlanSlug, PlanSlug | null> = {
  discovery: "standard",
  standard: "elite",
  elite: null,
};

const categoryTheme = {
  "word-search": {
    badge: "Vocabulary",
    tone: "Medium",
    points: 120,
    ribbon: "from-[#b9793f] to-[#d3a238]",
    surface: "from-[#fff8ec] to-[#f4dfb6]",
    border: "border-[rgba(185,121,63,0.24)]",
    accent: "bg-[#f4dfb6] text-[#8a5a2e]",
  },
  "fill-in-the-blanks": {
    badge: "Grammar",
    tone: "Easy",
    points: 80,
    ribbon: "from-[#d3a238] to-[#e8c876]",
    surface: "from-[#fff7ea] to-[#ead7bd]",
    border: "border-[rgba(211,162,56,0.28)]",
    accent: "bg-[#fff2d0] text-[#8a5a2e]",
  },
  "image-hunt": {
    badge: "Visual",
    tone: "Easy",
    points: 90,
    ribbon: "from-[#9c3b2e] to-[#b9793f]",
    surface: "from-[#fff8ec] to-[#f0c7bd]",
    border: "border-[rgba(156,59,46,0.24)]",
    accent: "bg-[#f0c7bd] text-[#7f2f24]",
  },
} as const;

const difficultyTone = {
  Easy: "bg-[#fff2d0] text-[#8a5a2e]",
  Medium: "bg-[#f4dfb6] text-[#7a4725]",
  Hard: "bg-[#f0c7bd] text-[#7f2f24]",
};

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  const user = await requireUser(locale);
  const subscription = await requireActiveSubscription(locale);
  const categoryAccess = await getCategoryAccess(subscription.planSlug);
  const plans = await getPlans();
  const nextPlanSlug = planUpgradeTarget[subscription.planSlug];
  const nextPlan = plans.find((plan) => plan.slug === nextPlanSlug);
  const dictionaryProgress = await getDictionaryProgressSummary();
  const accessibleCount = categoryAccess.filter((category) => category.accessible).length;
  const lockedCount = categoryAccess.length - accessibleCount;
  const totalXp = categoryAccess
    .filter((category) => category.accessible)
    .reduce((sum, category) => {
      const theme = categoryTheme[category.slug as keyof typeof categoryTheme];
      return sum + (theme?.points ?? 60);
    }, 0);
  const isTamil = locale === "ta";
  const copy =
    locale === "ta"
      ? {
          plan: "திட்டம்",
          search: "டாஷ்போர்டை தேடுங்கள்...",
          nav: ["டாஷ்போர்டு", "பயிற்சிகள்", "முன்னேற்றம்", "சந்தா", "அமைப்புகள்"],
          activePlan: "செயலில் உள்ள திட்டம்",
          upgrade: (name: string) => `${name} திட்டத்திற்கு மேம்படுத்தி மேலும் செயல்பாடுகளைத் திறக்கவும்.`,
          maxAccess: "உங்களிடம் ஏற்கனவே முழுமையான அணுகல் உள்ளது.",
          view: "பார்",
          dashboard: "டாஷ்போர்டு",
          greeting: `காலை வணக்கம், ${user.fullName}`,
          daysLeft: "நாட்கள் மீதம்",
          untilRenewal: "புதுப்பிக்கும் நாள் வரை",
          accessible: "அணுகலாம்",
          unlocked: "திறந்த செயல்பாடுகள்",
          xpAvailable: "கிடைக்கும் XP",
          pointsToEarn: "பெறக்கூடிய புள்ளிகள்",
          locked: "பூட்டப்பட்டது",
          anotherPlan: "வேறு திட்டம் தேவை",
          exercises: "கற்றல் செயல்பாடுகள்",
          exerciseHint: "செயல்பாடுகள் நிர்வாகப் பலகையின் அணுகல் விதிகளின்படி நேரடியாகக் காட்டப்படுகின்றன.",
          all: "அனைத்தும்",
          accessibleTab: "அணுகலாம்",
          lockedTab: "பூட்டப்பட்டது",
          open: "திறந்தது",
          lockedState: "பூட்டப்பட்டது",
          start: "தொடங்கு",
          disabledForAll: "அனைத்து திட்டங்களுக்கும் முடக்கப்பட்டது",
          unlockWith: "இதன் மூலம் திறக்க",
          lockedContent: "பூட்டப்பட்ட உள்ளடக்கம்",
          tone: {
            Easy: "எளிது",
            Medium: "நடுத்தரம்",
            Hard: "கடினம்",
          },
        }
      : locale === "fr"
        ? {
            plan: "offre",
            search: "Rechercher dans le tableau...",
            nav: ["Tableau de bord", "Exercices", "Progression", "Abonnement", "Réglages"],
            activePlan: "Offre active",
            upgrade: (name: string) => `Passez à ${name} pour débloquer plus d'activités premium.`,
            maxAccess: "Vous disposez déjà du niveau d'accès le plus complet.",
            view: "Voir",
            dashboard: "Tableau de bord",
            greeting: `Bonjour, ${user.fullName}`,
            daysLeft: "Jours restants",
            untilRenewal: "Avant renouvellement",
            accessible: "Accessible",
            unlocked: "Activités débloquées",
            xpAvailable: "XP disponibles",
            pointsToEarn: "Points à gagner",
            locked: "Verrouillé",
            anotherPlan: "Autre offre requise",
            exercises: "Exercices d'apprentissage",
            exerciseHint: "Les activités s'affichent selon les règles d'accès définies dans l'admin.",
            all: "Tous",
            accessibleTab: "Accessibles",
            lockedTab: "Verrouillés",
            open: "Ouvert",
            lockedState: "Verrouillé",
            start: "Commencer",
            disabledForAll: "Désactivé pour toutes les offres",
            unlockWith: "Débloquer avec",
            lockedContent: "Contenu verrouillé",
            tone: {
              Easy: "Facile",
              Medium: "Moyen",
              Hard: "Difficile",
            },
          }
        : {
            plan: "plan",
            search: "Search dashboard...",
            nav: ["Dashboard", "Exercises", "Progress", "Subscription", "Settings"],
            activePlan: "Active Plan",
            upgrade: (name: string) => `Upgrade to ${name} to unlock more premium activities.`,
            maxAccess: "You already have the most complete access level available.",
            view: "View",
            dashboard: "Dashboard",
            greeting: `Good morning, ${user.fullName}`,
            daysLeft: "Days Remaining",
            untilRenewal: "Until renewal",
            accessible: "Accessible",
            unlocked: "Activities unlocked",
            xpAvailable: "XP Available",
            pointsToEarn: "Points to earn",
            locked: "Locked",
            anotherPlan: "Need another plan",
            exercises: "Learning Exercises",
            exerciseHint: "Activities are displayed with live access rules from the admin panel.",
            all: "All",
            accessibleTab: "Accessible",
            lockedTab: "Locked",
            open: "Open",
            lockedState: "Locked",
            start: "Start exercise",
            disabledForAll: "Disabled for all plans",
            unlockWith: "Unlock with",
            lockedContent: "Locked content",
            tone: {
              Easy: "Easy",
              Medium: "Medium",
              Hard: "Hard",
            },
          };

  const dictionaryCopy =
    locale === "ta"
      ? {
          title: "அகராதி முன்னேற்றம்",
          hint: "பார்த்த, கற்ற மற்றும் முழுமையாக நினைவில் வைத்த சொற்களை இங்கே காணலாம்.",
          viewed: "பார்த்தது",
          learned: "கற்றது",
          mastered: "முழுமை",
          today: "இன்று மறுபார்வை",
          open: "அகராதியைத் திற",
        }
      : locale === "fr"
        ? {
            title: "Progression Agarathi",
            hint: "Retrouvez ici les mots consultés, appris et maîtrisés dans votre dictionnaire.",
            viewed: "Consultés",
            learned: "Appris",
            mastered: "Maîtrisés",
            today: "Révisés aujourd'hui",
            open: "Ouvrir Agarathi",
          }
        : {
            title: "Agarathi progress",
            hint: "Track the words you viewed, learned and mastered inside your picture dictionary.",
            viewed: "Viewed",
            learned: "Learned",
            mastered: "Mastered",
            today: "Reviewed today",
            open: "Open Agarathi",
          };

  return (
    <div className="mx-auto max-w-[120rem] px-4 py-8 sm:px-6 xl:px-8">
      <div
        className={`overflow-hidden rounded-[2rem] border border-[rgba(185,121,63,0.2)] bg-[#fff8ec]/90 shadow-[0_24px_60px_-45px_rgba(74,51,36,0.28)] lg:grid ${
          isTamil ? "lg:grid-cols-[17rem_1fr]" : "lg:grid-cols-[15rem_1fr]"
        }`}
      >
        <aside className="hidden border-r border-[rgba(185,121,63,0.18)] bg-[#f7ead6]/75 lg:flex lg:flex-col">
          <div className="border-b border-[rgba(185,121,63,0.18)] px-5 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#8a5a2e] text-sm font-black text-[#fff2dd]">
                {user.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p
                  className={`tracking-tight text-[var(--brand-ink)] ${
                    isTamil ? "text-[1.02rem] font-semibold" : "text-sm font-black"
                  }`}
                >
                  {user.fullName}
                </p>
                <p
                  className={`text-[#8a6a4c] ${
                    isTamil ? "text-[0.9rem] font-medium tracking-[0.02em]" : "text-xs uppercase tracking-[0.22em]"
                  }`}
                >
                  {planLabel[subscription.planSlug]} {copy.plan}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 pt-4">
            <div className="rounded-xl border border-[rgba(185,121,63,0.2)] bg-[#fff8ec] px-4 py-3 text-xs font-medium text-[#8a6a4c]">
              {copy.search}
            </div>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4">
            {copy.nav.map((item, index) => (
              <div
                key={item}
                className={`rounded-xl px-4 py-3 ${
                  isTamil ? "text-[1rem] font-medium tracking-[0.01em]" : "text-sm font-semibold"
                } ${index === 0 ? "bg-[#f4dfb6] text-[#8a5a2e]" : "text-[#8a6a4c]"}`}
              >
                {item}
              </div>
            ))}
          </nav>

          <div className="border-t border-[rgba(185,121,63,0.18)] px-4 py-4">
            <div className="rounded-[1.2rem] border border-[rgba(185,121,63,0.2)] bg-[#fff8ec] p-4">
              <p
                className={`text-[#8a6a4c] ${
                  isTamil ? "text-[0.9rem] font-medium tracking-[0.02em]" : "text-[11px] font-black uppercase tracking-[0.26em]"
                }`}
              >
                {copy.activePlan}
              </p>
              <h2
                className={`mt-2 text-[var(--brand-ink)] ${
                  isTamil ? "text-[1.8rem] font-semibold leading-tight" : "text-xl font-black"
                }`}
              >
                {planLabel[subscription.planSlug]}
              </h2>
              <p className={`mt-2 text-[#6f553d] ${isTamil ? "text-[0.98rem] leading-7" : "text-sm leading-6"}`}>
                {nextPlan ? copy.upgrade(nextPlan.name) : copy.maxAccess}
              </p>
              {nextPlan ? (
                <Link
                  href={`/${locale}/pricing#plan-${nextPlan.slug}`}
                  className={`mt-4 inline-flex rounded-xl bg-[#8a5a2e] text-[#fff2dd] ${
                    isTamil ? "px-4 py-2.5 text-[0.95rem] font-medium tracking-[0.02em]" : "px-4 py-2 text-xs font-black uppercase tracking-[0.2em]"
                  }`}
                >
                  {copy.view} {nextPlan.name}
                </Link>
              ) : null}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="border-b border-[rgba(185,121,63,0.18)] bg-[#fff8ec]/82 px-6 py-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p
                  className={`text-[#8a5a2e] ${
                    isTamil ? "text-[0.92rem] font-medium tracking-[0.02em]" : "text-[11px] font-black uppercase tracking-[0.28em]"
                  }`}
                >
                  {copy.dashboard}
                </p>
                <h1
                  className={`mt-1 text-[var(--brand-ink)] ${
                    isTamil ? "text-[2.8rem] font-semibold leading-tight tracking-[-0.025em] sm:text-[3.2rem]" : "text-3xl font-black tracking-[-0.04em] sm:text-4xl"
                  }`}
                >
                  {copy.greeting}
                </h1>
              </div>
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-xl border border-[rgba(185,121,63,0.2)] bg-[#fff7ea] px-4 py-3 text-[#6f553d] ${
                    isTamil ? "text-[1rem] font-medium tracking-[0.01em]" : "text-sm font-semibold"
                  }`}
                >
                  {daysRemaining(subscription.expiresAt)} days left
                </div>
              </div>
            </div>
          </header>

          <main className="px-6 py-6">
            <div className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: copy.daysLeft,
                  value: String(daysRemaining(subscription.expiresAt)),
                  sub: copy.untilRenewal,
                  tone: "from-[#fff8ec] to-[#ead7bd]",
                  border: "border-[rgba(185,121,63,0.2)]",
                  icon: "DY",
                  iconTone: "bg-[#ead7bd] text-[#654632]",
                },
                {
                  label: copy.accessible,
                  value: `${accessibleCount}/${categoryAccess.length}`,
                  sub: copy.unlocked,
                  tone: "from-[#fff8ec] to-[#f4dfb6]",
                  border: "border-[rgba(211,162,56,0.28)]",
                  icon: "AC",
                  iconTone: "bg-[#f4dfb6] text-[#8a5a2e]",
                },
                {
                  label: copy.xpAvailable,
                  value: String(totalXp),
                  sub: copy.pointsToEarn,
                  tone: "from-[#fff8eb] to-[#fff2d7]",
                  border: "border-[#f5dfaa]",
                  icon: "XP",
                  iconTone: "bg-[#fff2d0] text-[#8a5a2e]",
                },
                {
                  label: copy.locked,
                  value: String(lockedCount),
                  sub: copy.anotherPlan,
                  tone: "from-[#fff8ec] to-[#f0c7bd]",
                  border: "border-[rgba(156,59,46,0.24)]",
                  icon: "LK",
                  iconTone: "bg-[#f0c7bd] text-[#7f2f24]",
                },
              ].map((item) => (
                <article
                  key={item.label}
                  className={`rounded-[1.2rem] border bg-gradient-to-br ${item.tone} ${item.border} p-5`}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <p
                      className={`text-[#8a6a4c] ${
                        isTamil ? "text-[0.88rem] font-medium tracking-[0.02em]" : "text-xs font-semibold uppercase tracking-[0.24em]"
                      }`}
                    >
                      {item.label}
                    </p>
                    <span
                      className={`rounded-xl px-2.5 py-1 ${
                        isTamil ? "text-[0.8rem] font-medium tracking-[0.02em]" : "text-[10px] font-black uppercase tracking-[0.2em]"
                      } ${item.iconTone}`}
                    >
                      {item.icon}
                    </span>
                  </div>
                  <p
                    className={`text-[var(--brand-ink)] ${
                      isTamil ? "text-[2.2rem] font-semibold tracking-[-0.03em]" : "text-3xl font-black tracking-[-0.04em]"
                    }`}
                  >
                    {item.value}
                  </p>
                  <p className={`mt-1 text-[#6f553d] ${isTamil ? "text-[0.96rem] leading-7" : "text-sm"}`}>{item.sub}</p>
                </article>
              ))}
            </div>

            <section className="mb-7 rounded-[1.5rem] border border-[rgba(185,121,63,0.2)] bg-[#fff8ec]/92 p-5 shadow-[0_16px_40px_-30px_rgba(74,51,36,0.28)]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p
                    className={`text-[#8a5a2e] ${
                      isTamil ? "text-[0.92rem] font-medium tracking-[0.02em]" : "text-[11px] font-black uppercase tracking-[0.28em]"
                    }`}
                  >
                    AGARATHI
                  </p>
                  <h2
                    className={`mt-1 text-[var(--brand-ink)] ${
                      isTamil ? "text-[2rem] font-semibold tracking-[-0.02em]" : "text-xl font-black tracking-[-0.03em]"
                    }`}
                  >
                    {dictionaryCopy.title}
                  </h2>
                  <p className={`mt-1 max-w-3xl text-[#6f553d] ${isTamil ? "text-[0.98rem] leading-7" : "text-sm leading-6"}`}>
                    {dictionaryCopy.hint}
                  </p>
                </div>
                <Link
                  href={`/${locale}/agarathi`}
                  className={`inline-flex rounded-xl bg-[#8a5a2e] text-[#fff2dd] ${
                    isTamil ? "px-4 py-2.5 text-[0.95rem] font-medium tracking-[0.02em]" : "px-4 py-2 text-xs font-black uppercase tracking-[0.2em]"
                  }`}
                >
                  {dictionaryCopy.open}
                </Link>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: dictionaryCopy.viewed,
                    value: String(dictionaryProgress.totalViewed),
                    tone: "from-[#fff8ec] to-[#f4dfb6]",
                    border: "border-[rgba(211,162,56,0.28)]",
                    icon: "VW",
                    iconTone: "bg-[#f4dfb6] text-[#8a5a2e]",
                  },
                  {
                    label: dictionaryCopy.learned,
                    value: String(dictionaryProgress.totalLearned),
                    tone: "from-[#fff8ec] to-[#ead7bd]",
                    border: "border-[rgba(185,121,63,0.2)]",
                    icon: "LR",
                    iconTone: "bg-[#ead7bd] text-[#654632]",
                  },
                  {
                    label: dictionaryCopy.mastered,
                    value: String(dictionaryProgress.totalMastered),
                    tone: "from-[#fff8eb] to-[#fff2d7]",
                    border: "border-[#f5dfaa]",
                    icon: "MS",
                    iconTone: "bg-[#fff2d0] text-[#8a5a2e]",
                  },
                  {
                    label: dictionaryCopy.today,
                    value: String(dictionaryProgress.reviewedToday),
                    tone: "from-[#fff8ec] to-[#f0c7bd]",
                    border: "border-[rgba(156,59,46,0.24)]",
                    icon: "TD",
                    iconTone: "bg-[#f0c7bd] text-[#7f2f24]",
                  },
                ].map((item) => (
                  <article
                    key={item.label}
                    className={`rounded-[1.2rem] border bg-gradient-to-br ${item.tone} ${item.border} p-5`}
                  >
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <p
                        className={`text-[#8a6a4c] ${
                          isTamil ? "text-[0.88rem] font-medium tracking-[0.02em]" : "text-xs font-semibold uppercase tracking-[0.24em]"
                        }`}
                      >
                        {item.label}
                      </p>
                      <span
                        className={`rounded-xl px-2.5 py-1 ${
                          isTamil ? "text-[0.8rem] font-medium tracking-[0.02em]" : "text-[10px] font-black uppercase tracking-[0.2em]"
                        } ${item.iconTone}`}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <p
                      className={`text-[var(--brand-ink)] ${
                        isTamil ? "text-[2.2rem] font-semibold tracking-[-0.03em]" : "text-3xl font-black tracking-[-0.04em]"
                      }`}
                    >
                      {item.value}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2
                  className={`text-[var(--brand-ink)] ${
                    isTamil ? "text-[2rem] font-semibold tracking-[-0.02em]" : "text-xl font-black tracking-[-0.03em]"
                  }`}
                >
                  {copy.exercises}
                </h2>
                <p className={`mt-1 text-[#6f553d] ${isTamil ? "text-[0.98rem] leading-7" : "text-sm"}`}>
                  {copy.exerciseHint}
                </p>
              </div>
              <div className="inline-flex rounded-xl border border-[rgba(185,121,63,0.2)] bg-[#fff8ec] p-1 shadow-sm">
                <span
                  className={`rounded-lg bg-[#8a5a2e] text-[#fff2dd] ${
                    isTamil ? "px-4 py-2.5 text-[0.95rem] font-medium tracking-[0.02em]" : "px-4 py-2 text-xs font-black uppercase tracking-[0.2em]"
                  }`}
                >
                  {copy.all}
                </span>
                <span
                  className={`text-[#8a6a4c] ${
                    isTamil ? "px-4 py-2.5 text-[0.95rem] font-medium tracking-[0.02em]" : "px-4 py-2 text-xs font-black uppercase tracking-[0.2em]"
                  }`}
                >
                  {copy.accessibleTab}
                </span>
                <span
                  className={`text-[#8a6a4c] ${
                    isTamil ? "px-4 py-2.5 text-[0.95rem] font-medium tracking-[0.02em]" : "px-4 py-2 text-xs font-black uppercase tracking-[0.2em]"
                  }`}
                >
                  {copy.lockedTab}
                </span>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {categoryAccess.map((category) => {
                const theme = categoryTheme[category.slug as keyof typeof categoryTheme] ?? {
                  badge: "Learning",
                  tone: "Easy",
                  points: 60,
                  ribbon: "from-[#b9793f] to-[#d3a238]",
                  surface: "from-[#fff8ec] to-[#f4dfb6]",
                  border: "border-[rgba(185,121,63,0.22)]",
                  accent: "bg-[#f4dfb6] text-[#8a5a2e]",
                };

                const lockedPlans = category.enabledPlans ?? [];
                const primaryLockedPlan = lockedPlans[0] ?? null;

                return (
                  <article
                    key={category.id}
                    className={`overflow-hidden rounded-[1.5rem] border bg-[#fff8ec]/92 shadow-[0_16px_40px_-30px_rgba(74,51,36,0.28)] transition ${
                      category.accessible ? "hover:-translate-y-1 hover:shadow-[0_24px_50px_-32px_rgba(74,51,36,0.32)]" : "opacity-95"
                    } ${theme.border}`}
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${theme.ribbon}`} />
                    <div className="bg-gradient-to-br p-5" style={{ backgroundImage: "linear-gradient(135deg, var(--tw-gradient-stops))" }}>
                      <div className={`rounded-[1.1rem] border bg-gradient-to-br ${theme.surface} ${theme.border} p-5`}>
                        <div className="mb-4 flex items-start justify-end gap-4">
                          {category.accessible ? (
                            <span className="rounded-full bg-[#fff2d0] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8a5a2e]">
                              {copy.open}
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#ead7bd] px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-[#8a6a4c]">
                              {copy.lockedState}
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-black tracking-[-0.03em] text-[var(--brand-ink)]">{category.title}</h3>
                        <p className="mt-2 text-sm leading-6 text-[#6f553d]">{category.description}</p>

                        <div className="mt-5 flex items-center justify-between gap-3">
                          <div className="flex flex-wrap gap-2">
                            <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${theme.accent}`}>
                              {theme.badge}
                            </span>
                            <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${difficultyTone[theme.tone as keyof typeof difficultyTone]}`}>
                              {copy.tone[theme.tone as keyof typeof copy.tone]}
                            </span>
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-[#b9793f]">
                            {theme.points} XP
                          </span>
                        </div>

                        {category.accessible ? (
                          <Link
                            href={`/${locale}/${category.slug}`}
                            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#8a5a2e] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#fff2dd]"
                          >
                            {copy.start}
                          </Link>
                        ) : category.accessConfigured && lockedPlans.length === 0 ? (
                          <div className="mt-5 rounded-xl border border-[rgba(185,121,63,0.2)] bg-[#fff7ea] px-4 py-3 text-center text-sm font-semibold text-[#8a6a4c]">
                            {copy.disabledForAll}
                          </div>
                        ) : primaryLockedPlan ? (
                          <Link
                            href={`/${locale}/pricing?content=${encodeURIComponent(category.title)}&plans=${lockedPlans.join(",")}&focus=${primaryLockedPlan}`}
                            className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-[#8a5a2e] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-[#fff2dd]"
                          >
                            {copy.unlockWith} {planLabel[primaryLockedPlan]}
                          </Link>
                        ) : (
                          <div className="mt-5 rounded-xl border border-[rgba(185,121,63,0.2)] bg-[#fff7ea] px-4 py-3 text-center text-sm font-semibold text-[#8a6a4c]">
                            {copy.lockedContent}
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
