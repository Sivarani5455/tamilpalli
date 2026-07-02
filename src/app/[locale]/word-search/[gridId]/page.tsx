import { notFound } from "next/navigation";

import { WordSearchGame } from "@/components/word-search/word-search-game";
import { getDictionaryEntries, getWordSearchGrid } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function WordSearchDetailPage({
  params,
}: {
  params: Promise<{ locale: string; gridId: string }>;
}) {
  const { locale: rawLocale, gridId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "word-search");
  const [grid, dictionaryEntries] = await Promise.all([
    getWordSearchGrid(gridId),
    getDictionaryEntries(),
  ]);

  if (!grid) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-none p-0">
      <WordSearchGame grid={grid} locale={locale} dictionaryEntries={dictionaryEntries} />
    </div>
  );
}
