import { notFound } from "next/navigation";

import { WordHuntGame } from "@/components/word-hunt/word-hunt-game";
import { getWordHuntExercise } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function WordHuntDetailPage({
  params,
}: {
  params: Promise<{ locale: string; exerciseId: string }>;
}) {
  const { locale: rawLocale, exerciseId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "word-hunt");
  const exercise = await getWordHuntExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 lg:py-6">
      <WordHuntGame exercise={exercise} locale={locale} />
    </div>
  );
}
