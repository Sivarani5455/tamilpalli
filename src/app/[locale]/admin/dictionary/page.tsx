import Link from "next/link";

import { DictionaryCsvImportForm } from "@/components/admin/dictionary-csv-import-form";
import { DeleteContentButton } from "@/components/admin/delete-content-button";
import { requireAdminUser } from "@/lib/auth";
import { getAdminDictionaryEntries, getAdminDictionaryInsights } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

function DictionaryBadge({ label }: { label: string }) {
  const letter = label.trim().charAt(0).toUpperCase() || "D";

  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#22c6d8] font-display text-2xl font-black text-white shadow-[3px_4px_0_#180d2b]">
      {letter}
    </span>
  );
}

function InsightIcon({ tone }: { tone: "top" | "review" }) {
  return (
    <span
      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] text-white shadow-[3px_4px_0_#180d2b] ${
        tone === "top" ? "bg-[#20bf73]" : "bg-[#ffc43d]"
      }`}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.6"
      >
        {tone === "top" ? (
          <>
            <path d="M6 17 12 5l6 12" />
            <path d="M8 14h8" />
          </>
        ) : (
          <>
            <circle cx="12" cy="12" r="7" />
            <path d="M12 8v4l3 2" />
          </>
        )}
      </svg>
    </span>
  );
}

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
    <div className="mx-auto max-w-6xl px-2 py-6 sm:px-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7c3aed]">Admin</p>
          <h1 className="mt-1 font-display text-[clamp(1.9rem,4vw,2.8rem)] font-black leading-tight text-[#180d2b]">
            Dictionary Admin
          </h1>
          <p className="mt-2 max-w-2xl text-sm font-semibold leading-6 text-[#8a6a9c]">
            English, Tamil, French, type, example and image references in one extensible structure.
          </p>
        </div>
        <Link
          href={`/${locale}/admin/dictionary/create`}
          className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-[#180d2b] px-5 py-3 text-sm font-black text-white shadow-[4px_5px_0_#ffc43d] transition hover:-translate-y-0.5"
        >
          <span className="text-[#ffc43d]">+</span>
          New entry
        </Link>
      </div>

      <DictionaryCsvImportForm locale={locale} />

      <div className="mt-8 grid gap-5 xl:grid-cols-2">
        <section className="rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <InsightIcon tone="top" />
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-black text-[#180d2b]">Most learned words</h2>
                <p className="mt-1 text-sm font-semibold text-[#8a6a9c]">
                  Words learners validate most often in Agarathi.
                </p>
              </div>
            </div>
            <span className="rounded-full border-[2px] border-[#180d2b] bg-[#dcfce7] px-3 py-1 text-xs font-black text-[#047857]">
              Top 5
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {topLearned.length === 0 ? (
              <div className="rounded-[1rem] border-[2px] border-dashed border-[#8a6a9c] px-4 py-6 text-sm font-semibold text-[#8a6a9c]">
                No learning data yet.
              </div>
            ) : (
              topLearned.map((item) => (
                <article key={item.entryId} className="rounded-[1rem] border-[2px] border-[#180d2b] bg-[#f6f0ff] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-xl font-black text-[#180d2b]">{item.englishWord}</div>
                      <div className="mt-1 text-base font-bold text-[#6b4a2b]">{item.tamilWord}</div>
                    </div>
                    <span className="rounded-full border-[2px] border-[#14b86a] bg-[#dcfce7] px-3 py-1 text-xs font-black text-[#047857]">
                      {item.learnedTotal} learned
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#8a6a9c]">
                    <span>{item.viewsTotal} views</span>
                    <span>/</span>
                    <span>{item.learnerCount} learners</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-4">
              <InsightIcon tone="review" />
              <div className="min-w-0">
                <h2 className="font-display text-2xl font-black text-[#180d2b]">Least viewed words</h2>
                <p className="mt-1 text-sm font-semibold text-[#8a6a9c]">
                  Useful for spotting entries that need better visibility.
                </p>
              </div>
            </div>
            <span className="rounded-full border-[2px] border-[#180d2b] bg-[#fff7d6] px-3 py-1 text-xs font-black text-[#c2410c]">
              Review
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {leastUsed.length === 0 ? (
              <div className="rounded-[1rem] border-[2px] border-dashed border-[#8a6a9c] px-4 py-6 text-sm font-semibold text-[#8a6a9c]">
                No usage data yet.
              </div>
            ) : (
              leastUsed.map((item) => (
                <article key={item.entryId} className="rounded-[1rem] border-[2px] border-[#180d2b] bg-[#fff7ed] px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-display text-xl font-black text-[#180d2b]">{item.englishWord}</div>
                      <div className="mt-1 text-base font-bold text-[#6b4a2b]">{item.tamilWord}</div>
                    </div>
                    <span className="rounded-full border-[2px] border-[#f59e0b] bg-[#fff7d6] px-3 py-1 text-xs font-black text-[#c2410c]">
                      {item.viewsTotal} views
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#8a6a9c]">
                    <span>{item.learnedTotal} learned</span>
                    <span>/</span>
                    <span>{item.learnerCount} learners</span>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-4">
        {entries.length === 0 ? (
          <div className="rounded-[1.25rem] border-[3px] border-dashed border-[#180d2b] bg-white p-8 text-sm font-semibold text-[#8a6a9c]">
            No dictionary entries yet.
          </div>
        ) : null}

        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <DictionaryBadge label={entry.translations.en?.word ?? entry.slug} />
                  <div className="min-w-0">
                    <h2 className="truncate font-display text-3xl font-black text-[#180d2b]">
                      {entry.translations.en?.word ?? entry.slug}
                    </h2>
                    <span className="mt-1 inline-flex rounded-full border-[2px] border-[#180d2b] bg-[#efe6ff] px-3 py-1 text-xs font-black text-[#7c3aed]">
                      {entry.slug}
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-[#dcfce7] px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#047857]">Type</div>
                    <div className="mt-2 text-base font-black text-[#180d2b]">{entry.type ?? "—"}</div>
                  </div>
                  <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-[#fff7d6] px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#c2410c]">Example</div>
                    <div className="mt-2 text-base font-black text-[#180d2b]">{entry.example ?? "—"}</div>
                  </div>
                  <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-[#ffe4ee] px-4 py-3 xl:col-span-2">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#be123c]">Tamil synonyms</div>
                    <div className="mt-2 text-base font-black text-[#180d2b]">
                      {entry.tamilSynonyms.length > 0 ? entry.tamilSynonyms.join(", ") : "—"}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">EN</div>
                    <div className="mt-2 text-lg font-black text-[#180d2b]">{entry.translations.en?.word ?? "—"}</div>
                  </div>
                  <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">TA</div>
                    <div className="mt-2 text-lg font-black text-[#180d2b]">{entry.translations.ta?.word ?? "—"}</div>
                  </div>
                  <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">FR</div>
                    <div className="mt-2 text-lg font-black text-[#180d2b]">{entry.translations.fr?.word ?? "—"}</div>
                  </div>
                </div>

                <div className="mt-4 max-w-3xl rounded-[1rem] border-[2px] border-[#180d2b] bg-[#fff7ed] px-4 py-3 text-sm font-semibold leading-7 text-[#6b4a2b]">
                  {entry.translations.ta?.description ?? "No Tamil description yet."}
                </div>

                {entry.imageUrl ? (
                  <div className="mt-4 max-w-full overflow-hidden text-xs font-black uppercase tracking-[0.12em] text-[#8a6a9c]">
                    Image:{" "}
                    <a
                      href={entry.imageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="break-all text-[#7c3aed] hover:text-[#180d2b]"
                    >
                      {entry.imageUrl}
                    </a>
                  </div>
                ) : null}
              </div>

              <div className="flex shrink-0 items-center gap-3">
                <Link
                  href={`/${locale}/admin/dictionary/${entry.id}/edit`}
                  className="rounded-full border-[3px] border-[#180d2b] bg-white px-5 py-2.5 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5"
                >
                  Edit
                </Link>
                <DeleteContentButton
                  locale={locale}
                  id={entry.id}
                  kind="dictionary"
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
