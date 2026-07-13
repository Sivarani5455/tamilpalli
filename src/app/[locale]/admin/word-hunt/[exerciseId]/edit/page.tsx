import { notFound } from "next/navigation";

import { WordHuntAdminForm } from "@/components/admin/content-forms";
import { requireAdminUser } from "@/lib/auth";
import { getAdminWordHuntExercise } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminWordHuntEditPage({
  params,
}: {
  params: Promise<{ locale: string; exerciseId: string }>;
}) {
  const { locale: rawLocale, exerciseId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const exercise = await getAdminWordHuntExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl text-slate-950">Edit Word Hunt Exercise</h1>
      <WordHuntAdminForm locale={locale} initial={exercise} />
    </div>
  );
}
