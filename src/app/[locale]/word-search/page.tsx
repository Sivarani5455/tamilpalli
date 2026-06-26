import { WordSearchIndex } from "@/components/word-search";
import { getWordSearchGrids, getWordSearchGridUserScores } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function WordSearchIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "word-search");
  const [wordSearchGrids, userScores] = await Promise.all([
    getWordSearchGrids(),
    getWordSearchGridUserScores(),
  ]);

  return <WordSearchIndex grids={wordSearchGrids} locale={locale} userScores={userScores} />;
}
