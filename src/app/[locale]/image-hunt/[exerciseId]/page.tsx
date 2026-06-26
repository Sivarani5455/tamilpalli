import { notFound } from "next/navigation";

import { ImageHuntGame } from "@/components/image-hunt/image-hunt-game";
import { getImageHuntExercise } from "@/lib/content";
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <ImageHuntGame exercise={exercise} locale={locale} />
    </div>
  );
}
