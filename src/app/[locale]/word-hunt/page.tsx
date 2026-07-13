import { WordHuntIndex } from "@/components/word-hunt/word-hunt-index";
import { getWordHuntExercises } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function WordHuntIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "word-hunt");
  const exercises = await getWordHuntExercises();

  return <WordHuntIndex exercises={exercises} locale={locale} />;
}
