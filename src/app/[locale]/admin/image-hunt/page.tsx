import Link from "next/link";

import { DeleteContentButton } from "@/components/admin/delete-content-button";
import { requireAdminUser } from "@/lib/auth";
import { getAdminImageHuntExercises } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminImageHuntPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const imageHuntExercises = await getAdminImageHuntExercises();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-5xl text-slate-950">Image Hunt Admin</h1>
        <Link href={`/${locale}/admin/image-hunt/new`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          New exercise
        </Link>
      </div>
      <div className="mt-8 grid gap-6">
        {imageHuntExercises.map((exercise) => (
          <article key={exercise.id} className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-3xl text-slate-950">{exercise.title}</h2>
                <p className="mt-2 text-sm text-slate-600">{exercise.targets.length} targets</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/${locale}/admin/image-hunt/${exercise.id}/edit`} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700">
                  Edit
                </Link>
                <DeleteContentButton locale={locale} id={exercise.id} kind="image-hunt" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
