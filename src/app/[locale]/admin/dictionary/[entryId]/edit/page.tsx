import { notFound } from "next/navigation";

import { DictionaryAdminForm } from "@/components/admin/dictionary-form";
import { requireAdminUser } from "@/lib/auth";
import { getAdminDictionaryEntry } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminDictionaryEditPage({
  params,
}: {
  params: Promise<{ locale: string; entryId: string }>;
}) {
  const { locale: rawLocale, entryId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const entry = await getAdminDictionaryEntry(entryId);

  if (!entry) {
    notFound();
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 xl:px-10 2xl:px-14">
      <DictionaryAdminForm locale={locale} initial={entry} />
    </div>
  );
}
