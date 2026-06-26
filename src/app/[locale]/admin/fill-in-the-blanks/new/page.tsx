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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl text-slate-950">Create Fill in the Blanks Exercise</h1>
      <FillBlankAdminForm locale={locale} />
    </div>
  );
}
