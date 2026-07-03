import { notFound } from "next/navigation";

import { ImageHuntGame } from "@/components/image-hunt/image-hunt-game";
import { getImageHuntExercise, getImageHuntProgress } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function ImageHuntDetailPage({
  params,
}: {
  params: Promise<{ locale: string; exerciseId: string }>;
}) {
  const { locale: rawLocale, exerciseId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "image-hunt");
  const exercise = await getImageHuntExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  const progress = await getImageHuntProgress(exercise.id);

  return (
    <div className="mx-auto max-w-[92rem] px-3 py-6 sm:px-5 lg:py-10">
      <ImageHuntGame exercise={exercise} initialProgress={progress} locale={locale} />
    </div>
  );
}
