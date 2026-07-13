import Link from "next/link";

import { DeleteContentButton } from "@/components/admin/delete-content-button";
import { ThirukkuralCsvImportForm } from "@/components/admin/thirukkural-csv-import-form";
import { requireAdminUser } from "@/lib/auth";
import { getAdminThirukkuralLessons } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

const PAGE_SIZE = 24;

export default async function AdminThirukkuralPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { q = "", page = "1" } = await searchParams;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const lessons = await getAdminThirukkuralLessons();
  const normalizedQuery = q.trim().toLocaleLowerCase(locale);
  const filteredLessons = normalizedQuery
    ? lessons.filter((lesson) =>
        [String(lesson.number), lesson.title, lesson.section, lesson.chapter]
          .join(" ")
          .toLocaleLowerCase(locale)
          .includes(normalizedQuery),
      )
    : lessons;
  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / PAGE_SIZE));
  const requestedPage = Number.parseInt(page, 10);
  const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages);
  const visibleLessons = filteredLessons.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl px-2 py-6 sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-tight text-[#180d2b]">
          Thirukkural Admin
        </h1>
        <p className="rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] px-4 py-2 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b]">
          {lessons.length} / 1330 kurals
        </p>
      </div>

      <ThirukkuralCsvImportForm locale={locale} />

      <form className="mt-8 flex flex-col gap-3 sm:flex-row" action={`/${locale}/admin/thirukkural`}>
        <label className="flex min-w-0 flex-1 items-center rounded-full border-[3px] border-[#180d2b] bg-white px-5 shadow-[3px_4px_0_#180d2b]">
          <span className="sr-only">Rechercher un kural</span>
          <input
            name="q"
            defaultValue={q}
            placeholder="Numéro, titre, section ou chapitre..."
            className="min-w-0 flex-1 bg-transparent py-3 text-sm font-bold text-[#180d2b] outline-none placeholder:text-[#a58cb4]"
          />
        </label>
        <button className="rounded-full border-[3px] border-[#180d2b] bg-[#7c3aed] px-6 py-3 text-sm font-black text-white shadow-[3px_4px_0_#180d2b]">
          Rechercher
        </button>
      </form>

      <div className="mt-5 flex items-center justify-between gap-3 text-sm font-black text-[#765f86]">
        <p>{filteredLessons.length} résultat{filteredLessons.length > 1 ? "s" : ""}</p>
        <p>Page {currentPage} / {totalPages}</p>
      </div>

      <div className="mt-6 grid gap-4">
        {visibleLessons.map((lesson) => (
          <article key={lesson.id} className="rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">Kural {lesson.number}</p>
                <h2 className="mt-1 truncate font-tamil text-2xl font-black leading-tight text-[#180d2b]">{lesson.title}</h2>
                <p className="mt-1 text-sm font-semibold text-[#8a6a9c]">
                  Exercices automatiques · {lesson.difficulty}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}/admin/thirukkural/${lesson.id}/edit`}
                  className="rounded-full border-[3px] border-[#180d2b] bg-white px-5 py-2.5 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5"
                >
                  Edit
                </Link>
                <DeleteContentButton
                  locale={locale}
                  id={lesson.id}
                  kind="thirukkural"
                  className="rounded-full border-[3px] border-[#ff3b6f] bg-white px-5 py-2.5 text-sm font-black text-[#ff3b6f] shadow-[3px_4px_0_#ff3b6f] transition hover:-translate-y-0.5"
                />
              </div>
            </div>
          </article>
        ))}

        {visibleLessons.length === 0 ? (
          <div className="rounded-[1.25rem] border-[3px] border-dashed border-[#180d2b] bg-white p-8 text-center">
            <p className="font-display text-xl font-black text-[#180d2b]">Aucun kural trouvé</p>
            <p className="mt-2 text-sm font-semibold text-[#765f86]">Modifie la recherche ou importe ton fichier CSV.</p>
          </div>
        ) : null}
      </div>

      {totalPages > 1 ? (
        <nav className="mt-7 flex items-center justify-center gap-3" aria-label="Pagination des kurals">
          <Link
            href={{ pathname: `/${locale}/admin/thirukkural`, query: { ...(q ? { q } : {}), page: Math.max(1, currentPage - 1) } }}
            aria-disabled={currentPage === 1}
            className={`rounded-full border-[3px] border-[#180d2b] px-5 py-2.5 text-sm font-black shadow-[3px_4px_0_#180d2b] ${
              currentPage === 1 ? "pointer-events-none bg-[#eee8dd] text-[#aa9f92]" : "bg-white text-[#180d2b]"
            }`}
          >
            Précédent
          </Link>
          <Link
            href={{ pathname: `/${locale}/admin/thirukkural`, query: { ...(q ? { q } : {}), page: Math.min(totalPages, currentPage + 1) } }}
            aria-disabled={currentPage === totalPages}
            className={`rounded-full border-[3px] border-[#180d2b] px-5 py-2.5 text-sm font-black shadow-[3px_4px_0_#180d2b] ${
              currentPage === totalPages ? "pointer-events-none bg-[#eee8dd] text-[#aa9f92]" : "bg-[#ffc43d] text-[#180d2b]"
            }`}
          >
            Suivant
          </Link>
        </nav>
      ) : null}
    </div>
  );
}
