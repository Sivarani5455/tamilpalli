import { notFound } from "next/navigation";

import { NimishamAdminForm } from "@/components/admin/content-forms";
import { requireAdminUser } from "@/lib/auth";
import { getAdminNimishamExercise } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminNimishamEditPage({
  params,
}: {
  params: Promise<{ locale: string; exerciseId: string }>;
}) {
  const { locale: rawLocale, exerciseId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const exercise = await getAdminNimishamExercise(exerciseId);

  if (!exercise) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl text-slate-950">Edit Nimisham Exercise</h1>
      <NimishamAdminForm locale={locale} initial={exercise} />
    </div>
  );
}
