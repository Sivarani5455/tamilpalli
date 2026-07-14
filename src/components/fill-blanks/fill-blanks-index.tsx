"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { CatalogShuffleButton } from "@/components/ui/catalog-shuffle-button";
import type { Difficulty, FillBlankExercise, Locale } from "@/types";

type IconName = "clock" | "grid" | "layers" | "search" | "sliders" | "trophy";
type DifficultyFilter = "ALL" | Difficulty;

const iconPaths: Record<IconName, React.ReactNode> = {
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  grid: (
    <>
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </>
  ),
  sliders: (
    <>
      <path d="M21 4h-7" />
      <path d="M10 4H3" />
      <path d="M21 12h-9" />
      <path d="M8 12H3" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="10" cy="12" r="2" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
    </>
  ),
};

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    >
      {iconPaths[name]}
    </svg>
  );
}

const difficultyCopy: Record<Difficulty, { label: Record<Locale, string>; tone: string; level: string }> = {
  beginner: {
    label: { en: "Beginner", fr: "Débutant", ta: "தொடக்கநிலை" },
    level: "Easy",
    tone: "bg-[#eaf7d6] text-[#397013]",
  },
  intermediate: {
    label: { en: "Intermediate", fr: "Intermédiaire", ta: "இடைநிலை" },
    level: "Medium",
    tone: "bg-[#eee8ff] text-[#5f42b5]",
  },
  advanced: {
    label: { en: "Advanced", fr: "Avancé", ta: "மேம்பட்டது" },
    level: "Hard",
    tone: "bg-[#fde4eb] text-[#a43d5b]",
  },
};

export function FillBlanksIndex({
  exercises,
  locale,
}: {
  exercises: FillBlankExercise[];
  locale: Locale;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("ALL");

  const copy =
    locale === "ta"
      ? {
          search: "தேடுக...",
          shuffle: "சீரற்ற பயிற்சி",
          filters: "வடிகட்டிகள்",
          results: "முடிவுகள்",
          result: "முடிவு",
          questions: "கேள்விகள்",
          open: "திற",
          points: "புள்ளிகள்",
          notPlayed: "இன்னும் விளையாடவில்லை",
          all: "அனைத்தும்",
          empty: "பொருந்தும் பயிற்சி இல்லை.",
        }
      : locale === "fr"
        ? {
            search: "Rechercher...",
            shuffle: "Aléatoire",
            filters: "Filtres",
            results: "résultats",
            result: "résultat",
            questions: "questions",
            open: "Ouvrir",
            points: "pts",
            notPlayed: "Non joué",
            all: "Tous",
            empty: "Aucun exercice trouvé.",
          }
        : {
            search: "Search...",
            shuffle: "Shuffle",
            filters: "Filters",
            results: "results",
            result: "result",
            questions: "questions",
            open: "Open",
            points: "pts",
            notPlayed: "Not played",
            all: "All",
            empty: "No exercise found.",
          };

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const matchesQuery = `${exercise.title} ${exercise.slug}`.toLowerCase().includes(normalizedQuery);
      const matchesDifficulty = difficultyFilter === "ALL" || exercise.difficulty === difficultyFilter;
      return matchesQuery && matchesDifficulty;
    });
  }, [difficultyFilter, exercises, query]);

  const openRandomExercise = () => {
    if (filteredExercises.length === 0) return;
    const exercise = filteredExercises[Math.floor(Math.random() * filteredExercises.length)];
    router.push(`/${locale}/fill-in-the-blanks/${exercise.id}`);
  };

  return (
    <div className="min-h-screen bg-[#fbefd8] px-2 py-2 text-[#211b14] sm:px-5 sm:py-5 lg:px-8 lg:py-7">
      <main className="mx-auto max-w-[90rem]">
        <div className="mb-2 flex gap-2">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a8b73]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              className="h-10 w-full rounded-lg border border-[#d8c7a9] bg-white pl-9 pr-3 text-xs font-medium text-[#211b14] outline-none transition placeholder:text-[#9a8b73] focus:border-[#55409a] focus:ring-2 focus:ring-[#55409a]/10 sm:text-sm"
            />
          </div>
          <CatalogShuffleButton label={copy.shuffle} disabled={filteredExercises.length === 0} onClick={openRandomExercise} />
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="relative flex h-10 flex-shrink-0 items-center gap-1.5 rounded-lg bg-[#55409a] px-3 text-xs font-bold text-white transition-colors hover:bg-[#493584]"
          >
            <Icon name="sliders" className="h-3.5 w-3.5" />
            {copy.filters}
            {difficultyFilter !== "ALL" ? <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ffc43d] text-[10px] font-black text-[#211b14] ring-2 ring-[#fbefd8]">1</span> : null}
          </button>
        </div>

        {showFilters ? (
          <div className="mb-3 rounded-xl border border-[#e0d4bf] bg-white p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              {(["ALL", "beginner", "intermediate", "advanced"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setDifficultyFilter(filter)}
                  className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-colors ${
                    difficultyFilter === filter ? "border-[#55409a] bg-[#55409a] text-white" : "border-[#e0d4bf] bg-[#fffaf0] text-[#544936]"
                  }`}
                >
                  {filter === "ALL" ? copy.all : difficultyCopy[filter].label[locale]}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mb-2 px-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#9a8b73]">
          {filteredExercises.length} {filteredExercises.length === 1 ? copy.result : copy.results}
        </p>

        <div className="space-y-2 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
          {filteredExercises.length === 0 ? (
            <div className="py-24 text-center text-sm font-semibold text-[#8a6a9c]">{copy.empty}</div>
          ) : null}

          {filteredExercises.map((exercise) => {
            const meta = difficultyCopy[exercise.difficulty];
            const estimatedPoints = exercise.questions.length * 100;

            return (
              <Link
                key={exercise.id}
                href={`/${locale}/fill-in-the-blanks/${exercise.id}`}
                className="render-lazy group relative block rounded-xl border border-[#e0d4bf] bg-white px-3 py-2.5 transition duration-200 hover:border-[#c7b694] hover:shadow-[0_8px_22px_-18px_rgba(55,42,23,0.65)] sm:px-4 sm:py-3 lg:min-h-[160px]"
              >
                <div className="flex h-full flex-col">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[9px] font-bold ${meta.tone}`}>
                          {meta.label[locale]}
                        </span>
                        <span className="truncate text-[9px] font-medium text-[#9a8b73]">{meta.level}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-1 text-[#a86600]">
                        <Icon name="trophy" className="h-3 w-3" />
                        <span className="whitespace-nowrap text-[9px] font-bold">+ {estimatedPoints} {copy.points}</span>
                      </div>
                    </div>

                    <h2 className="truncate text-[13px] font-bold leading-tight text-[#211b14] sm:text-sm">{exercise.title}</h2>
                    <p className="mt-0.5 truncate text-[10px] font-medium text-[#76664f] sm:text-xs">{exercise.slug}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-[9px] font-medium text-[#9a8b73]">
                        <Icon name="clock" className="h-2.5 w-2.5 text-[#b3893f]" />
                        {Math.ceil(exercise.timeLimitSeconds / 60)} min
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-medium text-[#9a8b73]">
                        <Icon name="layers" className="h-2.5 w-2.5 text-[#b3893f]" />
                        {exercise.questions.length} {copy.questions}
                      </span>
                    </div>
                  </div>

                  <div className="mt-auto flex items-end pt-3">
                    <span className="inline-flex h-6 items-center gap-1.5 rounded-full bg-[#282418] px-3 text-[9px] font-bold text-white transition group-hover:bg-[#55409a]">
                      <Icon name="grid" className="h-2.5 w-2.5" />
                      <span>{copy.open}</span>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
