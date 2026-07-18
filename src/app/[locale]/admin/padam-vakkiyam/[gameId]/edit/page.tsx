import { notFound } from "next/navigation";

import { PictureSentenceAdminForm } from "@/components/admin/picture-sentence-admin-form";
import { requireAdminUser } from "@/lib/auth";
import { getAdminPictureSentenceGame } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function EditPictureSentencePage({ params }: { params: Promise<{ locale: string; gameId: string }> }) {
  const { locale: rawLocale, gameId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const game = await getAdminPictureSentenceGame(gameId);

  if (!game) notFound();

  return (
    <div className="mx-auto max-w-[92rem] px-3 py-6 sm:px-5 lg:py-10">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c3aed]">Oviyam · Admin</p>
      <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.4rem)] font-black leading-none text-[#180d2b]">Modifier {game.title}</h1>
      <PictureSentenceAdminForm locale={locale} initial={game} />
    </div>
  );
}
