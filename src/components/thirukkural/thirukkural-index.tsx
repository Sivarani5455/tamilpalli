import Link from "next/link";

import { ThirukkuralLearningPanel } from "@/components/thirukkural/thirukkural-learning-panel";
import { ThirukkuralPractice } from "@/components/thirukkural/thirukkural-practice";
import { ThirukkuralSearchControls } from "@/components/thirukkural/thirukkural-search-controls";
import type { ThirukkuralPracticeSet } from "@/lib/thirukkural-practice";
import type { Locale, ThirukkuralLesson } from "@/types";

type Filters = {
  q: string;
  section: string;
  kural: string;
  page: number;
  mode: "read" | "quiz" | "blanks" | "reconstruct";
};

const copy = {
  en: {
    all: "All sections",
    search: "Search in Tamil or Latin (e.g. aram)...",
    results: "kurals",
    selected: "Selected kural",
    previous: "Previous",
    next: "Next",
    empty: "No kural matches this search.",
    quiz: "Quick quiz",
    blanks: "Fill in the kural",
    reconstruct: "Rebuild the kural",
    training: "20 questions from the complete kural library",
  },
  fr: {
    all: "Toutes les sections",
    search: "Rechercher en tamoul ou en lettres latines (aram)...",
    results: "kurals",
    selected: "Kural sélectionné",
    previous: "Précédent",
    next: "Suivant",
    empty: "Aucun kural ne correspond à cette recherche.",
    quiz: "Quiz",
    blanks: "Compléter le kural",
    reconstruct: "Reconstituer le kural",
    training: "20 questions tirées de toute la bibliothèque",
  },
  ta: {
    all: "அனைத்தும்",
    search: "தமிழில் அல்லது aram எனத் தேடுக...",
    results: "குறள்கள்",
    selected: "தேர்ந்தெடுத்த குறள்",
    previous: "முந்தையது",
    next: "அடுத்தது",
    empty: "இந்தத் தேடலுக்கான குறள் கிடைக்கவில்லை.",
    quiz: "வினாடி வினா",
    blanks: "குறளை நிரப்புக",
    reconstruct: "குறளை வரிசைப்படுத்துக",
    training: "அனைத்துக் குறள்களிலிருந்தும் 20 கேள்விகள்",
  },
} satisfies Record<Locale, Record<string, string>>;

const sectionOptions = ["அறத்துப்பால்", "பொருட்பால்", "காமத்துப்பால்"];

function QuizIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-3.5 w-3.5" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 16v-1M12 8a2.5 2.5 0 1 1 2 4c-.6.4-1 1-1 1.5" />
    </svg>
  );
}

function FillIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M4 6h16M4 12h10M4 18h6" />
    </svg>
  );
}

function ReconstructIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-3.5 w-3.5" aria-hidden="true">
      <path d="M3 12a9 9 0 1 1 3 6.7M3 16v-4h4" />
    </svg>
  );
}

function createIndexHref(locale: Locale, filters: Filters, patch: Partial<Filters>) {
  const nextFilters = { ...filters, ...patch };
  const params = new URLSearchParams();

  if (nextFilters.q) params.set("q", nextFilters.q);
  if (nextFilters.section) params.set("section", nextFilters.section);
  if (nextFilters.kural) params.set("kural", nextFilters.kural);
  if (nextFilters.page > 1) params.set("page", String(nextFilters.page));
  if (nextFilters.mode !== "read") params.set("mode", nextFilters.mode);

  const query = params.toString();
  return `/${locale}/thirukkural${query ? `?${query}` : ""}`;
}

export function ThirukkuralIndex({
  lessons,
  activeLesson,
  locale,
  filters,
  totalCount,
  filteredCount,
  totalPages,
  practice,
  practicePool,
}: {
  lessons: ThirukkuralLesson[];
  activeLesson: ThirukkuralLesson | null;
  locale: Locale;
  filters: Filters;
  totalCount: number;
  filteredCount: number;
  totalPages: number;
  practice: ThirukkuralPracticeSet | null;
  practicePool: ThirukkuralLesson[];
}) {
  const labels = copy[locale];
  const hasActiveLibraryFilter = Boolean(filters.q || filters.section);
  const visibleLessonCount = Math.min((filters.page - 1) * 30 + lessons.length, filteredCount);

  return (
    <main className="min-h-screen bg-[#FFF7EC] text-[#1A0B2E]">
      <section id="library" className="scroll-mt-24 px-4 py-7 sm:px-6 sm:py-8 lg:py-4">
        <div className="mx-auto max-w-[1180px]">
          <div className="mb-4 flex flex-col gap-4 lg:mb-3 lg:flex-row lg:items-center lg:justify-between lg:gap-2">
            <nav className="flex flex-wrap gap-2" aria-label="Thirukkural sections">
              <Link
                href={createIndexHref(locale, filters, { section: "", page: 1 })}
                className={`rounded-full border-[2.5px] border-[#1A0B2E] px-4 py-2 font-tamil text-xs font-bold text-[#1A0B2E] shadow-[3px_3px_0_#1A0B2E] transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E] lg:px-3.5 lg:py-1.5 ${
                  !filters.section
                    ? "-rotate-1 bg-[#FFC93C]"
                    : "bg-white"
                }`}
              >
                {labels.all}
              </Link>
              {sectionOptions.map((section) => (
                <Link
                  key={section}
                  href={createIndexHref(locale, filters, { section, page: 1 })}
                  className={`rounded-full border-[2.5px] border-[#1A0B2E] px-4 py-2 font-tamil text-xs font-bold text-[#1A0B2E] shadow-[3px_3px_0_#1A0B2E] transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E] lg:px-3.5 lg:py-1.5 ${
                    filters.section === section
                      ? "-rotate-1 bg-[#FFC93C]"
                      : "bg-white"
                  }`}
                >
                  {section}
                </Link>
              ))}
            </nav>

            <nav className="flex flex-wrap gap-2 lg:justify-end" aria-label="Thirukkural exercises">
              <Link
                href={createIndexHref(locale, filters, { mode: "quiz" })}
                aria-current={filters.mode === "quiz" ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-[#1A0B2E] bg-[#7C3AED] px-4 py-2 font-tamil text-xs font-bold text-white shadow-[3px_3px_0_#1A0B2E] transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E] lg:px-3.5 lg:py-1.5 ${filters.mode === "quiz" ? "-translate-x-0.5 -translate-y-0.5 shadow-[5px_5px_0_#1A0B2E]" : ""}`}
              >
                <QuizIcon />
                {labels.quiz}
              </Link>
              <Link
                href={createIndexHref(locale, filters, { mode: "blanks" })}
                aria-current={filters.mode === "blanks" ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-[#1A0B2E] bg-[#17A6B2] px-4 py-2 font-tamil text-xs font-bold text-white shadow-[3px_3px_0_#1A0B2E] transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E] lg:px-3.5 lg:py-1.5 ${filters.mode === "blanks" ? "-translate-x-0.5 -translate-y-0.5 shadow-[5px_5px_0_#1A0B2E]" : ""}`}
              >
                <FillIcon />
                {labels.blanks}
              </Link>
              <Link
                href={createIndexHref(locale, filters, { mode: "reconstruct" })}
                aria-current={filters.mode === "reconstruct" ? "page" : undefined}
                className={`inline-flex items-center gap-1.5 rounded-full border-[2.5px] border-[#1A0B2E] bg-[#FF3D68] px-4 py-2 font-tamil text-xs font-bold text-white shadow-[3px_3px_0_#1A0B2E] transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E] lg:px-3.5 lg:py-1.5 ${filters.mode === "reconstruct" ? "-translate-x-0.5 -translate-y-0.5 shadow-[5px_5px_0_#1A0B2E]" : ""}`}
              >
                <ReconstructIcon />
                {labels.reconstruct}
              </Link>
            </nav>
          </div>

          <div className="mb-5 flex flex-col items-start gap-3 lg:mb-3 lg:flex-row lg:items-center lg:gap-4">
            <ThirukkuralSearchControls
              locale={locale}
              initialQuery={filters.q}
              section={filters.section}
              mode={filters.mode}
              searchLabel={labels.search}
            />

            {filters.mode === "read" && hasActiveLibraryFilter ? (
              <p className="inline-block rounded-full border-2 border-[#1A0B2E] bg-[#F1E9FE] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#7C3AED]">
                {filteredCount} / {totalCount} {labels.results}
              </p>
            ) : null}
          </div>

          <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-4">
            <aside className="order-2 lg:order-1">
              <div className="flex max-h-[640px] flex-col gap-3 overflow-y-auto p-1 [scrollbar-color:#7C3AED_transparent] [scrollbar-width:thin] lg:max-h-[calc(100vh-205px)] lg:gap-2">
                {lessons.map((lesson) => {
                  const isActive = activeLesson?.id === lesson.id;

                  return (
                    <Link
                      key={lesson.id}
                      href={createIndexHref(locale, filters, { kural: String(lesson.number), mode: "read" })}
                      aria-current={isActive ? "true" : undefined}
                      className={`render-lazy group grid grid-cols-[2.25rem_minmax(0,1fr)] items-start gap-3 rounded-2xl border-[2.5px] border-[#1A0B2E] px-4 py-3.5 shadow-[3px_3px_0_#1A0B2E] transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E] lg:grid-cols-[2rem_minmax(0,1fr)] lg:gap-2 lg:px-3 lg:py-2 ${
                        isActive
                          ? "-translate-x-0.5 -translate-y-0.5 bg-[#FFF3D6] shadow-[5px_5px_0_#1A0B2E]"
                          : "bg-white"
                      }`}
                    >
                      <span className={`flex h-[34px] w-[34px] -rotate-6 items-center justify-center rounded-full border-2 border-[#1A0B2E] text-[9px] font-bold lg:h-[30px] lg:w-[30px] lg:text-[8px] ${isActive ? "bg-[#FFC93C] text-[#1A0B2E]" : "bg-[#7C3AED] text-white"}`}>
                        {String(lesson.number).padStart(4, "0")}
                      </span>
                      <span className="min-w-0">
                        <span className="line-clamp-2 font-tamil text-sm font-bold leading-[1.5] text-[#1A0B2E] lg:text-[12px] lg:leading-[1.4]">
                          {lesson.kuralLines.join(" ") || lesson.title}
                        </span>
                        <span className="mt-1 block truncate font-tamil text-[11px] font-medium text-[#9A8CB0] lg:mt-0.5 lg:text-[9px]">{lesson.chapter}</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
              <p className="mx-auto mt-4 w-fit rounded-full border-2 border-[#1A0B2E] bg-[#F1E9FE] px-4 py-1.5 text-xs font-bold text-[#7C3AED] shadow-[2px_2px_0_#1A0B2E]">
                {visibleLessonCount} / {totalCount}
              </p>
            </aside>

            <div className="order-1 lg:order-2">
              {filters.mode !== "read" && practice ? (
                <section>
                  <ThirukkuralPractice
                    key={filters.mode}
                    initialPractice={practice}
                    practicePool={practicePool}
                    locale={locale}
                    mode={filters.mode}
                  />
                </section>
              ) : activeLesson ? (
                <article className="relative overflow-hidden rounded-[26px] border-[3px] border-[#1A0B2E] bg-gradient-to-br from-white to-[#FFF3D6] p-5 shadow-[9px_9px_0_#1A0B2E] sm:p-8">
                  <span className="pointer-events-none absolute right-5 top-3 select-none text-[5.5rem] font-bold leading-none text-[#1A0B2E]/[0.06] sm:right-8 sm:text-[7rem]" aria-hidden="true">
                    {activeLesson.number}
                  </span>
                  <div className="relative flex flex-wrap items-center gap-2">
                    <span className="rounded-full border-2 border-[#1A0B2E] bg-[#FFC93C] px-3 py-1.5 font-tamil text-[11px] font-bold text-[#1A0B2E]">
                      {activeLesson.section}
                    </span>
                    <span className="rounded-full border-2 border-[#1A0B2E] bg-white px-3 py-1.5 font-tamil text-[11px] font-bold text-[#1A0B2E]">
                      {activeLesson.chapter}
                    </span>
                    <span className="ml-auto px-1 text-xs font-bold text-[#9A8CB0]">
                      {activeLesson.number} / {totalCount}
                    </span>
                  </div>
                  <h2 className="sr-only">{labels.selected}: {activeLesson.title}</h2>

                  {practice ? (
                    <ThirukkuralLearningPanel
                      key={activeLesson.id}
                      lesson={activeLesson}
                      locale={locale}
                    />
                  ) : null}
                </article>
              ) : (
                <div className="rounded-[26px] border-[3px] border-dashed border-[#1A0B2E] bg-white p-10 text-center font-tamil font-bold text-[#7C3AED] shadow-[7px_7px_0_#1A0B2E]">
                  {labels.empty}
                </div>
              )}
            </div>
          </div>

          {totalPages > 1 ? (
            <nav className="mx-auto mt-8 flex items-center justify-center gap-4" aria-label="Thirukkural pagination">
              <Link
                href={createIndexHref(locale, filters, { page: Math.max(1, filters.page - 1) })}
                aria-disabled={filters.page === 1}
                className={`rounded-full border-[2.5px] border-[#1A0B2E] px-5 py-2.5 font-tamil text-sm font-bold shadow-[3px_3px_0_#1A0B2E] transition duration-150 ${
                  filters.page === 1
                    ? "pointer-events-none bg-[#E9E1D8] text-[#9A8CB0] opacity-60"
                    : "bg-white text-[#1A0B2E] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E]"
                }`}
              >
                ← {labels.previous}
              </Link>
              <span className="rounded-full bg-[#F1E9FE] px-3 py-1 text-xs font-bold text-[#7C3AED]">{filters.page} / {totalPages}</span>
              <Link
                href={createIndexHref(locale, filters, { page: Math.min(totalPages, filters.page + 1) })}
                aria-disabled={filters.page === totalPages}
                className={`rounded-full border-[2.5px] border-[#1A0B2E] px-5 py-2.5 font-tamil text-sm font-bold shadow-[3px_3px_0_#1A0B2E] transition duration-150 ${
                  filters.page === totalPages
                    ? "pointer-events-none bg-[#E9E1D8] text-[#9A8CB0] opacity-60"
                    : "bg-white text-[#1A0B2E] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E]"
                }`}
              >
                {labels.next} →
              </Link>
            </nav>
          ) : null}
        </div>
      </section>
    </main>
  );
}
