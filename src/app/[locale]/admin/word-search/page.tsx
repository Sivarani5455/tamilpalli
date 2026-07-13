import Link from "next/link";

import { DeleteContentButton } from "@/components/admin/delete-content-button";
import { PublicationStatus } from "@/components/admin/publication-status";
import { requireAdminUser } from "@/lib/auth";
import { getAdminWordSearchGrids } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

function GridBadge() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#18b66f] text-white shadow-[3px_4px_0_#180d2b]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="5" width="5" height="5" rx="1" />
        <rect x="14" y="5" width="5" height="5" rx="1" />
        <rect x="5" y="14" width="5" height="5" rx="1" />
        <rect x="14" y="14" width="5" height="5" rx="1" />
      </svg>
    </span>
  );
}

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
    <div className="mx-auto max-w-5xl px-2 py-6 sm:px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-tight text-[#180d2b]">
          Word Search Admin
        </h1>
        <Link
          href={`/${locale}/admin/word-search/new`}
          className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-[#180d2b] px-5 py-3 text-sm font-black text-white shadow-[4px_5px_0_#ffc43d] transition hover:-translate-y-0.5"
        >
          <span className="text-[#ffc43d]">+</span>
          New grid
        </Link>
      </div>
      <div className="mt-6 grid gap-4">
        {wordSearchGrids.map((grid) => (
          <article
            key={grid.id}
            className="rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <GridBadge />
                <div className="min-w-0">
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <h2 className="truncate font-display text-2xl font-black leading-tight text-[#180d2b]">{grid.title}</h2>
                </div>
                <p className="mt-1 line-clamp-2 text-sm font-semibold text-[#8a6a9c]">{grid.description}</p>
                <PublicationStatus publishDate={grid.publishDate} isActive={grid.isActive} locale={locale} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}/admin/word-search/${grid.id}/edit`}
                  className="rounded-full border-[3px] border-[#180d2b] bg-white px-5 py-2.5 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5"
                >
                  Edit
                </Link>
                <DeleteContentButton
                  locale={locale}
                  id={grid.id}
                  kind="word-search"
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
