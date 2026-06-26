import { notFound } from "next/navigation";

import { FillBlanksGame } from "@/components/fill-blanks/fill-blanks-game";
import { getFillBlankExercise } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function FillBlanksDetailPage({
  params,
}: {
  params: Promise<{ locale: string; exerciseId: string }>;
}) {
  const { locale: rawLocale, exerciseId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "fill-in-the-blanks");
  const exercise = await getFillBlankExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <FillBlanksGame exercise={exercise} locale={locale} />
    </div>
  );
}
