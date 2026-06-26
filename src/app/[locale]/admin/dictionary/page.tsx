import Link from "next/link";

import { DeleteContentButton } from "@/components/admin/delete-content-button";
import { requireAdminUser } from "@/lib/auth";
import { getAdminDictionaryEntries, getAdminDictionaryInsights } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminDictionaryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const entries = await getAdminDictionaryEntries();
  const insights = await getAdminDictionaryInsights();
  const topLearned = insights.slice(0, 5);
  const leastUsed = [...insights].sort((a, b) => a.viewsTotal - b.viewsTotal).slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl text-slate-950">Dictionary Admin</h1>
          <p className="mt-3 text-sm text-slate-600">
            English, Tamil, French, category fields, type, example and image references in one extensible
            structure.
          </p>
        </div>
        <Link
          href={`/${locale}/admin/dictionary/create`}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
        >
          New entry
        </Link>
      </div>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-slate-950">Most learned words</h2>
              <p className="mt-2 text-sm text-slate-500">Words learners validate most often in Agarathi.</p>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Top 5
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {topLearned.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                No learning data yet.
              </div>
            ) : (
              topLearned.map((item) => (
                <article key={item.entryId} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-950">{item.englishWord}</div>
                      <div className="mt-1 text-base text-slate-600">{item.tamilWord}</div>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {item.learnedTotal} learned
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{item.category ?? "No category"}</span>
                    <span>•</span>
                    <span>{item.viewsTotal} views</span>
                    <span>•</span>
                    <span>{item.learnerCount} learners</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-2xl text-slate-950">Least viewed words</h2>
              <p className="mt-2 text-sm text-slate-500">Useful for spotting entries that need better visibility.</p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
              Review
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {leastUsed.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                No usage data yet.
              </div>
            ) : (
              leastUsed.map((item) => (
                <article key={item.entryId} className="rounded-2xl bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-lg font-semibold text-slate-950">{item.englishWord}</div>
                      <div className="mt-1 text-base text-slate-600">{item.tamilWord}</div>
                    </div>
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      {item.viewsTotal} views
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span>{item.category ?? "No category"}</span>
                    <span>•</span>
                    <span>{item.learnedTotal} learned</span>
                    <span>•</span>
                    <span>{item.learnerCount} learners</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-6">
        {entries.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-500">
            No dictionary entries yet.
          </div>
        ) : null}

        {entries.map((entry) => (
          <article key={entry.id} className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-3xl text-slate-950">
                    {entry.translations.en?.word ?? entry.slug}
                  </h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {entry.slug}
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Category</div>
                    <div className="mt-2 text-base font-semibold text-slate-950">{entry.category ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Subcategory</div>
                    <div className="mt-2 text-base font-semibold text-slate-950">{entry.subcategory ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Type</div>
                    <div className="mt-2 text-base font-semibold text-slate-950">{entry.type ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Example</div>
                    <div className="mt-2 text-base font-semibold text-slate-950">{entry.example ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3 xl:col-span-2">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">Tamil synonyms</div>
                    <div className="mt-2 text-base font-semibold text-slate-950">
                      {entry.tamilSynonyms.length > 0 ? entry.tamilSynonyms.join(", ") : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">EN</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950">{entry.translations.en?.word ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">TA</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950">{entry.translations.ta?.word ?? "—"}</div>
                  </div>
                  <div className="rounded-xl bg-slate-50 px-4 py-3">
                    <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">FR</div>
                    <div className="mt-2 text-lg font-semibold text-slate-950">{entry.translations.fr?.word ?? "—"}</div>
                  </div>
                </div>

                <div className="mt-4 max-w-3xl rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-600">
                  {entry.translations.ta?.description ?? "No Tamil description yet."}
                </div>

                {entry.imageUrl ? (
                  <div className="mt-4 text-xs text-slate-500">
                    Image:{" "}
                    <a
                      href={entry.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      {entry.imageUrl}
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}/admin/dictionary/${entry.id}/edit`}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700"
                >
                  Edit
                </Link>
                <DeleteContentButton locale={locale} id={entry.id} kind="dictionary" />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
