import { requireAdminUser } from "@/lib/auth";
import { ImageHuntAdminForm } from "@/components/admin/content-forms";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminImageHuntNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl text-slate-950">Create Image Hunt Exercise</h1>
      <ImageHuntAdminForm locale={locale} />
    </div>
  );
}
