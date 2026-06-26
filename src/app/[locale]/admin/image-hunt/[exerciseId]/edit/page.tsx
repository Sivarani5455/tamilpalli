import { requireAdminUser } from "@/lib/auth";
import { ImageHuntAdminForm } from "@/components/admin/content-forms";
import { getAdminImageHuntExercise } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";
import { notFound } from "next/navigation";

export default async function AdminImageHuntEditPage({
  params,
}: {
  params: Promise<{ locale: string; exerciseId: string }>;
}) {
  const { locale: rawLocale, exerciseId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const exercise = await getAdminImageHuntExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl text-slate-950">Edit Image Hunt Exercise</h1>
      <ImageHuntAdminForm locale={locale} initial={exercise} />
    </div>
  );
}
