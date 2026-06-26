"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Difficulty, Locale, WordSearchGrid } from "@/types";

const difficultyLabel: Record<Difficulty, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

const difficultyMeta: Record<
  Difficulty,
  {
    accent: string;
    surface: string;
    pillBg: string;
    pillText: string;
    border: string;
    ribbon: string;
    tone: string;
  }
> = {
  beginner: {
    accent: "#0b8b6a",
    surface: "from-teal-50 to-emerald-50",
    pillBg: "#dcfce7",
    pillText: "#166534",
    border: "border-teal-200",
    ribbon: "from-teal-400 to-emerald-500",
    tone: "Easy",
  },
  intermediate: {
    accent: "#c2510a",
    surface: "from-amber-50 to-orange-50",
    pillBg: "#fef3c7",
    pillText: "#92400e",
    border: "border-amber-200",
    ribbon: "from-amber-400 to-orange-500",
    tone: "Medium",
  },
  advanced: {
    accent: "#9d174d",
    surface: "from-rose-50 to-pink-50",
    pillBg: "#ffe4ef",
    pillText: "#9d174d",
    border: "border-rose-200",
    ribbon: "from-rose-400 to-pink-500",
    tone: "Hard",
  },
};

const filterOptions = ["All", "Beginner", "Intermediate", "Advanced"] as const;

const tagPalette = [
  { bg: "#b2eddf", text: "#0b6b52" },
  { bg: "#d0c4ff", text: "#4c1d95" },
  { bg: "#fdd9a0", text: "#9a3e08" },
  { bg: "#bfdbfe", text: "#1e40af" },
];

const toneBadge = {
  Easy: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  Hard: "bg-rose-100 text-rose-700",
};

export function WordSearchIndex({
  grids,
  locale,
  userScores,
}: {
  grids: WordSearchGrid[];
  locale: Locale;
  userScores: Record<string, number>;
}) {
  const [activeFilter, setActiveFilter] =
    useState<(typeof filterOptions)[number]>("All");
  const [query, setQuery] = useState("");
  const copy =
    locale === "ta"
      ? {
          filters: {
            All: "அனைத்தும்",
            Beginner: "தொடக்கநிலை",
            Intermediate: "இடைநிலை",
            Advanced: "மேம்பட்டது",
          },
          puzzles: "புதிர்கள்",
          search: "தேடுக...",
          empty: "உங்கள் தேடலுக்கு பொருந்தும் கிரிட்கள் இல்லை.",
          more: "மேலும்",
          vocabulary: "சொற்கள்",
          words: "சொற்கள்",
          open: "கிரிட் திறக்க",
          notPlayed: "இன்னும் விளையாடப்படவில்லை",
          yourScore: "உங்கள் மதிப்பெண்",
          tone: {
            Easy: "எளிது",
            Medium: "நடுத்தரம்",
            Hard: "கடினம்",
          },
        }
      : locale === "fr"
        ? {
            filters: {
              All: "Tous",
              Beginner: "Débutant",
              Intermediate: "Intermédiaire",
              Advanced: "Avancé",
            },
            puzzles: "grilles",
            search: "Rechercher...",
            empty: "Aucune grille ne correspond à votre recherche.",
            more: "de plus",
            vocabulary: "Vocabulaire",
            words: "mots",
            open: "Ouvrir la grille",
            notPlayed: "Pas encore joué",
            yourScore: "Votre score",
            tone: {
              Easy: "Facile",
              Medium: "Moyen",
              Hard: "Difficile",
            },
          }
        : {
            filters: {
              All: "All",
              Beginner: "Beginner",
              Intermediate: "Intermediate",
              Advanced: "Advanced",
            },
            puzzles: "puzzles",
            search: "Search...",
            empty: "No grids match your search.",
            more: "more",
            vocabulary: "Vocabulary",
            words: "words",
            open: "Open grid",
            notPlayed: "Not played yet",
            yourScore: "Your score",
            tone: {
              Easy: "Easy",
              Medium: "Medium",
              Hard: "Hard",
            },
          };

  const filteredGrids = useMemo(() => {
    return grids.filter((grid) => {
      const level = difficultyLabel[grid.difficulty];
      const matchesLevel = activeFilter === "All" || level === activeFilter;
      const haystack = `${grid.title} ${grid.description}`.toLowerCase();
      const matchesQuery = haystack.includes(query.trim().toLowerCase());

      return matchesLevel && matchesQuery;
    });
  }, [activeFilter, grids, query]);

  return (
    <div className="mx-auto max-w-[120rem] px-4 py-8 sm:px-6 xl:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_24px_60px_-45px_rgba(17,25,53,0.16)]">
        <main className="px-6 py-6">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex flex-wrap gap-2 rounded-[1rem] border border-slate-200 bg-slate-50 p-2">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setActiveFilter(option)}
                  className={`rounded-[0.85rem] px-5 py-3 text-sm font-black uppercase tracking-[0.18em] transition ${
                    activeFilter === option
                      ? "bg-[#4058ff] text-white"
                      : "text-slate-500 hover:bg-white hover:text-slate-800"
                  }`}
                >
                  {copy.filters[option]}
                </button>
              ))}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <span className="text-sm font-semibold text-slate-400">
                {filteredGrids.length} {copy.puzzles}
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  /
                </span>
                <input
                  type="text"
                  placeholder={copy.search}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-5 text-sm text-slate-800 shadow-sm transition placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#dbe3ff] sm:w-64"
                />
              </div>
            </div>
          </div>

          {filteredGrids.length === 0 ? (
            <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <p className="text-lg font-semibold text-slate-500">{copy.empty}</p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {filteredGrids.map((grid) => {
                const meta = difficultyMeta[grid.difficulty];
                const userScore = userScores[grid.id];

                return (
                  <Link
                    key={grid.id}
                    href={`/${locale}/word-search/${grid.id}`}
                    className={`overflow-hidden rounded-[1.5rem] border bg-white shadow-[0_16px_40px_-30px_rgba(17,25,53,0.18)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_-32px_rgba(17,25,53,0.22)] ${meta.border}`}
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${meta.ribbon}`} />
                    <div className={`m-5 rounded-[1.1rem] border bg-gradient-to-br ${meta.surface} ${meta.border} p-5`}>
                      <div className="mb-4 flex items-start justify-between gap-4">
                        <span
                          className="rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]"
                          style={{ backgroundColor: meta.pillBg, color: meta.pillText }}
                        >
                          {difficultyLabel[grid.difficulty]}
                        </span>
                        <span className="rounded-full bg-white/75 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                          {Math.ceil(grid.timeLimitSeconds / 60)} min
                        </span>
                      </div>

                      <h2 className="text-2xl font-black tracking-[-0.03em] text-slate-900">{grid.title}</h2>
                      <p className="mt-2 text-sm leading-6 text-slate-500">{grid.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {grid.words.slice(0, 3).map((word, index) => {
                          const palette = tagPalette[index % tagPalette.length];

                          return (
                            <span
                              key={`${grid.id}-${word.word}`}
                              className="rounded-full px-3 py-1 text-[11px] font-semibold"
                              style={{
                                backgroundColor: palette.bg,
                                color: palette.text,
                              }}
                            >
                              {word.word}
                            </span>
                          );
                        })}
                        {grid.words.length > 3 ? (
                          <span className="rounded-full bg-black/10 px-3 py-1 text-[11px] font-semibold text-stone-600">
                            +{grid.words.length - 3} {copy.more}
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-5 flex items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-slate-700">
                            {copy.vocabulary}
                          </span>
                          <span className={`rounded-lg px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${toneBadge[meta.tone as keyof typeof toneBadge]}`}>
                            {copy.tone[meta.tone as keyof typeof copy.tone]}
                          </span>
                        </div>
                        <span className="text-[11px] font-black uppercase tracking-[0.18em] text-amber-500">
                          {grid.words.length} {copy.words}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between px-5 pb-5">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-400">
                          {userScore ? `${copy.yourScore}: ${userScore}` : copy.notPlayed}
                        </span>
                      </div>
                      <span className="inline-flex rounded-xl bg-[#4058ff] px-4 py-3 text-sm font-black uppercase tracking-[0.16em] text-white">
                        {copy.open}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
