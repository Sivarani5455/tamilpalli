"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Difficulty, ImageHuntExercise, Locale } from "@/types";

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

const difficultyCopy: Record<Difficulty, { label: Record<Locale, string>; tone: string; level: Record<Locale, string> }> = {
  beginner: {
    label: { en: "Beginner", fr: "Débutant", ta: "தொடக்கநிலை" },
    level: { en: "Easy", fr: "Facile", ta: "எளிது" },
    tone: "border-[#20bf73] bg-[#dcfce7] text-[#047857]",
  },
  intermediate: {
    label: { en: "Intermediate", fr: "Intermédiaire", ta: "இடைநிலை" },
    level: { en: "Medium", fr: "Moyen", ta: "நடுத்தரம்" },
    tone: "border-[#7c3aed] bg-[#f6f0ff] text-[#7c3aed]",
  },
  advanced: {
    label: { en: "Advanced", fr: "Avancé", ta: "மேம்பட்டது" },
    level: { en: "Hard", fr: "Difficile", ta: "கடினம்" },
    tone: "border-[#ff3b6f] bg-[#ffe4ee] text-[#be123c]",
  },
};

export function ImageHuntIndex({
  exercises,
  locale,
}: {
  exercises: ImageHuntExercise[];
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("ALL");

  const copy =
    locale === "ta"
      ? {
          search: "தேடுக...",
          filters: "வடிகட்டிகள்",
          results: "முடிவுகள்",
          result: "முடிவு",
          targets: "இலக்குகள்",
          open: "திற",
          points: "புள்ளிகள்",
          all: "அனைத்தும்",
          empty: "பொருந்தும் பயிற்சி இல்லை.",
        }
      : locale === "fr"
        ? {
            search: "Rechercher...",
            filters: "Filtres",
            results: "résultats",
            result: "résultat",
            targets: "cibles",
            open: "Ouvrir",
            points: "pts",
            all: "Tous",
            empty: "Aucun exercice trouvé.",
          }
        : {
            search: "Search...",
            filters: "Filters",
            results: "results",
            result: "result",
            targets: "targets",
            open: "Open",
            points: "pts",
            all: "All",
            empty: "No exercise found.",
          };

  const filteredExercises = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return exercises.filter((exercise) => {
      const instruction = exercise.instruction[locale] ?? exercise.instruction.en ?? "";
      const matchesQuery = `${exercise.title} ${exercise.slug} ${instruction}`.toLowerCase().includes(normalizedQuery);
      const matchesDifficulty = difficultyFilter === "ALL" || exercise.difficulty === difficultyFilter;
      return matchesQuery && matchesDifficulty;
    });
  }, [difficultyFilter, exercises, locale, query]);

  return (
    <div className="min-h-screen px-5 py-6 text-[#180d2b]">
      <main className="mx-auto max-w-[46rem]">
        <div className="mb-3 flex gap-3">
          <div className="relative flex-1">
            <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a6a9c]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              className="w-full rounded-full border-[3px] border-[#180d2b] bg-white py-3 pl-10 pr-4 text-sm font-semibold text-[#180d2b] shadow-[4px_5px_0_#180d2b] outline-none transition placeholder:text-[#b49ac6] focus:-translate-y-0.5"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className="relative flex flex-shrink-0 items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-[#7c3aed] px-4 py-2.5 text-sm font-black text-white shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5"
          >
            <Icon name="sliders" className="h-3.5 w-3.5" />
            {copy.filters}
          </button>
        </div>

        {showFilters ? (
          <div className="mb-6 rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[5px_6px_0_#180d2b]">
            <div className="flex flex-wrap gap-2">
              {(["ALL", "beginner", "intermediate", "advanced"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setDifficultyFilter(filter)}
                  className={`rounded-full border-[2px] border-[#180d2b] px-3 py-1 text-[10px] font-black uppercase tracking-wide shadow-[2px_3px_0_#180d2b] transition-all hover:-translate-y-0.5 ${
                    difficultyFilter === filter ? "bg-[#7c3aed] text-white" : "bg-[#fff7ed] text-[#180d2b]"
                  }`}
                >
                  {filter === "ALL" ? copy.all : difficultyCopy[filter].label[locale]}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mb-5 text-[11px] font-black uppercase tracking-[0.22em] text-[#8a6a9c]">
          {filteredExercises.length} {filteredExercises.length === 1 ? copy.result : copy.results}
        </p>

        <div className="space-y-3.5">
          {filteredExercises.length === 0 ? (
            <div className="py-24 text-center text-sm font-semibold text-[#8a6a9c]">{copy.empty}</div>
          ) : null}

          {filteredExercises.map((exercise) => {
            const meta = difficultyCopy[exercise.difficulty];
            const estimatedPoints = exercise.targets.length * 100;
            const instruction = exercise.instruction[locale] ?? exercise.instruction.en;

            return (
              <Link
                key={exercise.id}
                href={`/${locale}/image-hunt/${exercise.id}`}
                className="render-lazy group relative block overflow-hidden rounded-[1.15rem] border-[3px] border-[#180d2b] bg-white shadow-[6px_7px_0_#180d2b] transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-5 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full border-[2px] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${meta.tone}`}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {meta.label[locale]}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wide text-[#8a6a9c]">{meta.level[locale]}</span>
                    </div>

                    <h2 className="truncate text-[15px] font-black leading-tight text-[#180d2b]">{exercise.title}</h2>
                    {instruction ? <p className="mt-0.5 truncate text-xs font-semibold text-[#8a6a9c]">{instruction}</p> : null}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8a6a9c]">
                        <Icon name="clock" className="h-2.5 w-2.5" />
                        {Math.ceil(exercise.timeLimitSeconds / 60)} min
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8a6a9c]">
                        <Icon name="layers" className="h-2.5 w-2.5" />
                        {exercise.targets.length} {copy.targets}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 flex-col items-end gap-2.5">
                    <div className="flex items-center gap-1.5">
                      <Icon name="trophy" className="h-3 w-3 text-[#ffc43d]" />
                      <span className="text-xs font-black text-[#ffc43d]">+ {estimatedPoints} {copy.points}</span>
                    </div>

                    <span className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-full border-[2px] border-[#180d2b] bg-[#180d2b] px-4 py-2 text-xs font-black uppercase tracking-wide text-white shadow-[3px_4px_0_#ffc43d]">
                      <Icon name="grid" className="relative h-3 w-3" />
                      <span className="relative">{copy.open}</span>
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
