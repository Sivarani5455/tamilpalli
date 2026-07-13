import Link from "next/link";

import { DeleteContentButton } from "@/components/admin/delete-content-button";
import { PublicationStatus } from "@/components/admin/publication-status";
import { requireAdminUser } from "@/lib/auth";
import { getAdminImageHuntExercises } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

function SearchBadge() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#7c3aed] text-white shadow-[3px_4px_0_#180d2b]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="6" />
        <path d="m16 16 4 4" />
      </svg>
    </span>
  );
}

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
    <div className="mx-auto max-w-5xl px-2 py-6 sm:px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-tight text-[#180d2b]">
          Image Hunt Admin
        </h1>
        <Link
          href={`/${locale}/admin/image-hunt/new`}
          className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-[#180d2b] px-5 py-3 text-sm font-black text-white shadow-[4px_5px_0_#ffc43d] transition hover:-translate-y-0.5"
        >
          <span className="text-[#ffc43d]">+</span>
          New exercise
        </Link>
      </div>
      <div className="mt-6 grid gap-4">
        {imageHuntExercises.map((exercise) => (
          <article
            key={exercise.id}
            className="rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <SearchBadge />
                <div className="min-w-0">
                  <h2 className="truncate font-display text-2xl font-black leading-tight text-[#180d2b]">{exercise.title}</h2>
                  <p className="mt-1 text-sm font-semibold text-[#8a6a9c]">{exercise.targets.length} targets</p>
                  <PublicationStatus publishDate={exercise.publishDate} isActive={exercise.isActive} locale={locale} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}/admin/image-hunt/${exercise.id}/edit`}
                  className="rounded-full border-[3px] border-[#180d2b] bg-white px-5 py-2.5 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5"
                >
                  Edit
                </Link>
                <DeleteContentButton
                  locale={locale}
                  id={exercise.id}
                  kind="image-hunt"
                  className="rounded-full border-[3px] border-[#ff3b6f] bg-white px-5 py-2.5 text-sm font-black text-[#ff3b6f] shadow-[3px_4px_0_#ff3b6f] transition hover:-translate-y-0.5"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
