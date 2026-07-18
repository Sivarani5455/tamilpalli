import { notFound } from "next/navigation";

import { PictureSentenceGame } from "@/components/picture-sentence/picture-sentence-game";
import { getPictureSentenceGame } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function PictureSentenceGamePage({ params }: { params: Promise<{ locale: string; gameId: string }> }) {
  const { locale: rawLocale, gameId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "padam-vakkiyam");
  const game = await getPictureSentenceGame(gameId);
  if (!game || game.cards.length !== 10) notFound();
  return <PictureSentenceGame game={game} locale={locale} />;
}
