import { KuralVettaiGame, type KuralVettaiRound } from "@/components/kural-vettai/kural-vettai-game";
import { getThirukkuralLessons } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

function selectRandomKurals(rounds: KuralVettaiRound[], count: number) {
  const shuffled = [...rounds];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

export default async function KuralVettaiPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);

  await requireCategoryAccess(locale, "thirukkural");

  const lessons = await getThirukkuralLessons();
  const availableRounds = lessons
    .filter((lesson) => lesson.kuralLines.length >= 2 && lesson.kuralLines.every((line) => line.trim().length > 0))
    .map<KuralVettaiRound>((lesson) => ({
      id: lesson.id,
      number: lesson.number,
      section: lesson.section,
      chapter: lesson.chapter,
      lines: lesson.kuralLines.slice(0, 2),
    }));
  const rounds = selectRandomKurals(availableRounds, 10);

  return <KuralVettaiGame initialRounds={rounds} locale={locale} />;
}
