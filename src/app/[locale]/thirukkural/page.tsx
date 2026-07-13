import { ThirukkuralIndex } from "@/components/thirukkural/thirukkural-index";
import { getThirukkuralLessons } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";
import { generateThirukkuralPractice } from "@/lib/thirukkural-practice";
import { normalizeTamilSearch } from "@/lib/tamil-search";

export default async function ThirukkuralIndexPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; section?: string; kural?: string; page?: string; mode?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { q = "", section = "", kural = "", page = "1", mode = "read" } = await searchParams;
  const locale = getLocaleOrThrow(rawLocale);
  const practiceMode = mode === "quiz" || mode === "blanks" || mode === "reconstruct" ? mode : "read";

  await requireCategoryAccess(locale, "thirukkural");
  const lessons = await getThirukkuralLessons();
  const normalizedQuery = normalizeTamilSearch(q);
  const filteredLessons = lessons.filter((lesson) => {
    const matchesSection = !section || lesson.section === section;
    const searchableText = normalizeTamilSearch(
      [lesson.title, lesson.section, lesson.chapter, lesson.porul, ...lesson.kuralLines].join(" "),
    );
    const matchesQuery =
      !normalizedQuery ||
      searchableText.includes(normalizedQuery);

    return matchesSection && matchesQuery;
  });
  const pageSize = 30;
  const totalPages = Math.max(1, Math.ceil(filteredLessons.length / pageSize));
  const requestedPage = Number.parseInt(page, 10);
  const currentPage = Math.min(Math.max(Number.isFinite(requestedPage) ? requestedPage : 1, 1), totalPages);
  const visibleLessons = filteredLessons.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const requestedKural = Number.parseInt(kural, 10);
  const activeLesson =
    lessons.find((lesson) => lesson.number === requestedKural) ??
    visibleLessons[0] ??
    filteredLessons[0] ??
    null;
  const practice = generateThirukkuralPractice(lessons, 20);

  return (
    <ThirukkuralIndex
      lessons={visibleLessons}
      activeLesson={activeLesson}
      locale={locale}
      filters={{ q, section, kural, page: currentPage, mode: practiceMode }}
      totalCount={lessons.length}
      filteredCount={filteredLessons.length}
      totalPages={totalPages}
      practice={practice}
      practicePool={lessons}
    />
  );
}
