import { NimishamIndex } from "@/components/nimisham/nimisham-index";
import { getNimishamExercises } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function NimishamIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "nimisham");
  const exercises = await getNimishamExercises();

  return <NimishamIndex exercises={exercises} locale={locale} />;
}
