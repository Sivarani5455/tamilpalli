import Link from "next/link";

import { DeleteContentButton } from "@/components/admin/delete-content-button";
import { PublicationStatus } from "@/components/admin/publication-status";
import { requireAdminUser } from "@/lib/auth";
import { getAdminPictureSentenceGames } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminPictureSentencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const games = await getAdminPictureSentenceGames();

  return (
    <div className="mx-auto max-w-6xl px-3 py-6 sm:px-5 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c3aed]">Oviyam · Admin</p>
          <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.4rem)] font-black leading-none text-[#180d2b]">படம் + வாக்கியம்</h1>
          <p className="mt-3 text-sm font-semibold text-[#806793]">Gérez les jeux de 10 images et leurs 100 phrases.</p>
        </div>
        <Link href={`/${locale}/admin/padam-vakkiyam/new`} className="w-fit rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] px-6 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5">
          + Nouveau jeu
        </Link>
      </div>

      <div className="mt-7 grid gap-4 md:grid-cols-2">
        {games.map((game) => (
          <article key={game.id} className="rounded-[1.3rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#7c3aed] text-xl text-white shadow-[3px_4px_0_#180d2b]">◫</span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-display text-2xl font-black text-[#180d2b]">{game.title}</h2>
                <p className="mt-1 text-sm font-bold text-[#806793]">{game.cards.length}/10 images · {game.timePerImageSeconds} s/image</p>
                <PublicationStatus publishDate={game.publishDate} isActive={game.isActive} locale={locale} />
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/${locale}/admin/padam-vakkiyam/${game.id}/edit`} className="rounded-full border-[3px] border-[#180d2b] bg-white px-5 py-2 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b]">Modifier</Link>
              <DeleteContentButton locale={locale} id={game.id} kind="picture-sentence" className="rounded-full border-[3px] border-[#ff3b6f] bg-white px-5 py-2 text-sm font-black text-[#ff3b6f] shadow-[3px_4px_0_#ff3b6f]" />
            </div>
          </article>
        ))}
      </div>

      {games.length === 0 ? (
        <div className="mt-8 rounded-[1.3rem] border-[3px] border-dashed border-[#806793] bg-white/60 p-10 text-center text-sm font-bold text-[#806793]">Aucun jeu créé pour le moment.</div>
      ) : null}
    </div>
  );
}
