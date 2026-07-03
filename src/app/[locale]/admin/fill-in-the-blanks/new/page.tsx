import { requireAdminUser } from "@/lib/auth";
import { FillBlankAdminForm } from "@/components/admin/content-forms";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminFillBlanksNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);

  return (
    <div className="min-h-screen bg-[#eff2f6] px-4 py-10 sm:px-6">
      <FillBlankAdminForm locale={locale} />
    </div>
  );
}
