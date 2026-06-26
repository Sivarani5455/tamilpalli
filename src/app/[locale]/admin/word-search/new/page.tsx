import { requireAdminUser } from "@/lib/auth";
import { WordSearchAdminForm } from "@/components/admin/content-forms";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminWordSearchNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);

  return (
    <div className="w-full px-4 py-8 sm:px-6 xl:px-10 2xl:px-14">
      <WordSearchAdminForm locale={locale} />
    </div>
  );
}
