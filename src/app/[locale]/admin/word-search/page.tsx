import Link from "next/link";

import { DeleteContentButton } from "@/components/admin/delete-content-button";
import { requireAdminUser } from "@/lib/auth";
import { getAdminWordSearchGrids } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminWordSearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const wordSearchGrids = await getAdminWordSearchGrids();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-5xl text-slate-950">Word Search Admin</h1>
        <Link href={`/${locale}/admin/word-search/new`} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white">
          New grid
        </Link>
      </div>
      <div className="mt-8 grid gap-6">
        {wordSearchGrids.map((grid) => (
          <article key={grid.id} className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="font-display text-3xl text-slate-950">{grid.title}</h2>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      grid.isActive === false
                        ? "bg-amber-100 text-amber-800"
                        : "bg-emerald-100 text-emerald-800"
                    }`}
                  >
                    {grid.isActive === false ? "Inactive" : "Active"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600">{grid.description}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link href={`/${locale}/admin/word-search/${grid.id}/edit`} className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700">
                  Edit
                </Link>
                <DeleteContentButton locale={locale} id={grid.id} kind="word-search" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
