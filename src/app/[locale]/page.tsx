import Link from "next/link";

import { DictionaryIndex } from "@/components/dictionary/dictionary-index";
import { HomeSplashScreen } from "@/components/layout/home-splash-screen";
import { getDictionaryEntries, getHomeSplashSlides } from "@/lib/content";
import { getMessages, getLocaleOrThrow, t } from "@/lib/i18n";
import { getOptionalCategoryAccess } from "@/lib/permissions";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  const messages = await getMessages(locale);
  const [dictionaryEntries, splashSlides, wordOfDayAccess, dailyQuizAccess] = await Promise.all([
    getDictionaryEntries(),
    getHomeSplashSlides(),
    getOptionalCategoryAccess("home-word-of-the-day"),
    getOptionalCategoryAccess("home-daily-quiz"),
  ]);
  return (
    <div className="mx-auto max-w-[120rem] px-4 py-8 sm:px-6 sm:py-10 xl:px-8">
      <HomeSplashScreen slides={splashSlides} />

      <section className="overflow-hidden rounded-[2rem] border border-[rgba(185,121,63,0.22)] bg-[linear-gradient(160deg,rgba(255,222,145,0.18),rgba(255,255,255,0.16)_46%),#fff8ec] px-6 py-8 shadow-[0_24px_60px_-45px_rgba(74,51,36,0.36)] sm:px-8 lg:px-10">
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/${locale}/auth/register`}
            className="rounded-xl bg-[#8a5a2e] px-7 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-[#fff2dd] transition hover:translate-y-[-1px] hover:bg-[#654632]"
          >
            {t(messages, "hero.primaryCta", "Start learning")}
          </Link>
          <Link
            href={`/${locale}/pricing`}
            className="rounded-xl border border-[rgba(185,121,63,0.24)] bg-[#fff7ea] px-7 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-[var(--brand-ink)] transition hover:border-[#b9793f] hover:text-[#8a5a2e]"
          >
            {t(messages, "hero.secondaryCta", "View pricing")}
          </Link>
        </div>
      </section>

      {wordOfDayAccess.accessible || dailyQuizAccess.accessible ? (
        <section className="mt-8">
          <DictionaryIndex
            entries={dictionaryEntries}
            locale={locale}
            initialSelectedSlug={null}
            mode="home-panels"
            showWordOfDayPanel={wordOfDayAccess.accessible}
            showQuizPanel={dailyQuizAccess.accessible}
          />
        </section>
      ) : null}
    </div>
  );
}
