import { notFound } from "next/navigation";

import { DictionaryIndex } from "@/components/dictionary/dictionary-index";
import { getDictionaryEntries } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function AgarathiWordPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "agarathi");
  const entries = await getDictionaryEntries();

  if (!entries.some((entry) => entry.slug === slug)) {
    notFound();
  }

  return <DictionaryIndex entries={entries} locale={locale} initialSelectedSlug={slug} />;
}
