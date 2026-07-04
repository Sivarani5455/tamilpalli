import { ImageHuntIndex } from "@/components/image-hunt/image-hunt-index";
import { getImageHuntExercises } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function ImageHuntIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "image-hunt");
  const imageHuntExercises = await getImageHuntExercises();

  return <ImageHuntIndex exercises={imageHuntExercises} locale={locale} />;
}
