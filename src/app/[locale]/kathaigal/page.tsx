import { KathaigalIndex } from "@/components/kathaigal/kathaigal-index";
import { getKathaigalStories } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function KathaigalIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "kathaigal");
  const stories = await getKathaigalStories();

  return <KathaigalIndex stories={stories} locale={locale} />;
}
