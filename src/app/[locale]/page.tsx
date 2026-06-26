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

      <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-8 shadow-[0_24px_60px_-45px_rgba(17,25,53,0.16)] sm:px-8 lg:px-10">
        <div className="flex flex-wrap gap-4">
          <Link
            href={`/${locale}/auth/register`}
            className="rounded-xl bg-[#4058ff] px-7 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-white transition hover:translate-y-[-1px] hover:bg-[#3148e8]"
          >
            {t(messages, "hero.primaryCta", "Start learning")}
          </Link>
          <Link
            href={`/${locale}/pricing`}
            className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-[var(--brand-ink)] transition hover:border-[#4058ff] hover:text-[#4058ff]"
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
