import { FillBlanksIndex } from "@/components/fill-blanks/fill-blanks-index";
import { getFillBlankExercises } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function FillBlanksIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "fill-in-the-blanks");
  const fillBlankExercises = await getFillBlankExercises();

  return <FillBlanksIndex exercises={fillBlankExercises} locale={locale} />;
}
