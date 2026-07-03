import { notFound } from "next/navigation";

import { NimishamGame } from "@/components/nimisham/nimisham-game";
import { getNimishamExercise } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function NimishamDetailPage({
  params,
}: {
  params: Promise<{ locale: string; exerciseId: string }>;
}) {
  const { locale: rawLocale, exerciseId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "nimisham");
  const exercise = await getNimishamExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 sm:px-5 lg:py-6">
      <NimishamGame exercise={exercise} locale={locale} />
    </div>
  );
}
