import { ThirukkuralAdminForm } from "@/components/admin/thirukkural-form";
import { requireAdminUser } from "@/lib/auth";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminThirukkuralNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);

  return (
    <div className="mx-auto max-w-6xl px-2 py-6 sm:px-4">
      <h1 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black text-[#180d2b]">
        Create Thirukkural
      </h1>
      <ThirukkuralAdminForm locale={locale} />
    </div>
  );
}
