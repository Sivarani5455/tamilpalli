import { KathaigalAdminForm } from "@/components/admin/content-forms";
import { requireAdminUser } from "@/lib/auth";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminKathaigalNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);

  return (
    <div className="mx-auto max-w-7xl px-2 py-6 sm:px-4">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7c3aed]">Admin</p>
      <h1 className="mt-1 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-tight text-[#180d2b]">
        Create Kathaigal
      </h1>
      <KathaigalAdminForm locale={locale} />
    </div>
  );
}
