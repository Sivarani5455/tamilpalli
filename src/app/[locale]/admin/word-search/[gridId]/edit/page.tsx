import { requireAdminUser } from "@/lib/auth";
import { WordSearchAdminForm } from "@/components/admin/content-forms";
import { getAdminWordSearchGrid } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function AdminWordSearchEditPage({
  params,
}: {
  params: Promise<{ locale: string; gridId: string }>;
}) {
  const { locale: rawLocale, gridId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const grid = await getAdminWordSearchGrid(gridId);

  if (!grid) {
    notFound();
  }

  return (
    <div className="w-full px-4 py-8 sm:px-6 xl:px-10 2xl:px-14">
      <WordSearchAdminForm locale={locale} initial={grid} />
    </div>
  );
}
