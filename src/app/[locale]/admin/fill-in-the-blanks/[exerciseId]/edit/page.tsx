import { requireAdminUser } from "@/lib/auth";
import { FillBlankAdminForm } from "@/components/admin/content-forms";
import { getAdminFillBlankExercise } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function AdminFillBlanksEditPage({
  params,
}: {
  params: Promise<{ locale: string; exerciseId: string }>;
}) {
  const { locale: rawLocale, exerciseId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const exercise = await getAdminFillBlankExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#eff2f6] px-4 py-10 sm:px-6">
      <FillBlankAdminForm locale={locale} initial={exercise} />
    </div>
  );
}
