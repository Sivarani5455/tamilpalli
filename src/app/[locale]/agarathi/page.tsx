import { DictionaryIndex } from "@/components/dictionary/dictionary-index";
import { getDictionaryEntries } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function AgarathiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "agarathi");
  const entries = await getDictionaryEntries();

  return <DictionaryIndex entries={entries} locale={locale} initialSelectedSlug={null} mode="explorer-only" />;
}
