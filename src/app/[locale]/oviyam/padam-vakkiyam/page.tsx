import { PictureSentenceIndex } from "@/components/picture-sentence/picture-sentence-index";
import { getPictureSentenceGames } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function PictureSentenceIndexPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "padam-vakkiyam");
  const games = await getPictureSentenceGames();
  return <PictureSentenceIndex games={games} locale={locale} />;
}
