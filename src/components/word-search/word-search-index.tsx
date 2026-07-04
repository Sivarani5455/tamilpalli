"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Difficulty, Locale, WordSearchGrid } from "@/types";

type LevelFilter = "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type DifficultyFilter = "ALL" | "EASY" | "MEDIUM" | "HARD";
type StatusFilter = "ALL" | "PLAYED" | "UNPLAYED";
type SortOption = "date_desc" | "date_asc" | "title_asc" | "score_desc";
type IconName = "calendar" | "chevron-down" | "clock" | "grid" | "layers" | "search" | "sliders" | "trophy" | "x";

const difficultyToLevel: Record<Difficulty, Exclude<LevelFilter, "ALL">> = {
  beginner: "BEGINNER",
  intermediate: "INTERMEDIATE",
  advanced: "ADVANCED",
};

const difficultyToTone: Record<Difficulty, Exclude<DifficultyFilter, "ALL">> = {
  beginner: "EASY",
  intermediate: "MEDIUM",
  advanced: "HARD",
};

const levelConfig: Record<
  Exclude<LevelFilter, "ALL">,
  { accent: string; badge: string; label: Record<Locale, string> }
> = {
  BEGINNER: {
    accent: "#20bf73",
    badge: "border-[#20bf73] bg-[#dcfce7] text-[#047857]",
    label: { en: "Beginner", fr: "Débutant", ta: "தொடக்கநிலை" },
  },
  INTERMEDIATE: {
    accent: "#7c3aed",
    badge: "border-[#7c3aed] bg-[#f6f0ff] text-[#7c3aed]",
    label: { en: "Intermediate", fr: "Intermédiaire", ta: "இடைநிலை" },
  },
  ADVANCED: {
    accent: "#ff3b6f",
    badge: "border-[#ff3b6f] bg-[#ffe4ee] text-[#be123c]",
    label: { en: "Advanced", fr: "Avancé", ta: "மேம்பட்டது" },
  },
};

const iconPaths: Record<IconName, React.ReactNode> = {
  calendar: (
    <>
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <rect width="18" height="18" x="3" y="4" rx="2" />
      <path d="M3 10h18" />
    </>
  ),
  "chevron-down": <path d="m6 9 6 6 6-6" />,
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
      <path d="m3 18 9 5 9-5" />
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
      <path d="M21 20h-5" />
      <path d="M12 20H3" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="10" cy="12" r="2" />
      <circle cx="14" cy="20" r="2" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M5 5H3v3a4 4 0 0 0 4 4" />
      <path d="M19 5h2v3a4 4 0 0 1-4 4" />
    </>
  ),
  x: (
    <>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
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

function parseCreatedAt(value: string | undefined) {
  if (!value) {
    return null;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function dateLocale(locale: Locale) {
  return locale === "ta" ? "ta-IN" : locale === "fr" ? "fr-FR" : "en-US";
}

function formatDate(value: string | undefined, locale: Locale) {
  const date = parseCreatedAt(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(dateLocale(locale), {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function monthLabel(value: string, locale: Locale) {
  const [year, month] = value.split("-");

  return new Date(Number(year), Number(month) - 1).toLocaleDateString(dateLocale(locale), {
    month: "long",
    year: "numeric",
  });
}

export function WordSearchIndex({
  grids,
  locale,
  userScores,
}: {
  grids: WordSearchGrid[];
  locale: Locale;
  userScores: Record<string, number>;
}) {
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("ALL");
  const [difficultyFilter, setDifficultyFilter] = useState<DifficultyFilter>("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState<SortOption>("date_desc");

  const copy =
    locale === "ta"
      ? {
          search: "தேடுக...",
          filters: "வடிகட்டிகள்",
          level: "நிலை",
          difficulty: "சிரமம்",
          status: "நிலைமை",
          dateAdded: "சேர்த்த தேதி",
          sortBy: "வரிசைப்படுத்து",
          reset: "மீட்டமை",
          all: "அனைத்தும்",
          easy: "எளிது",
          medium: "நடுத்தரம்",
          hard: "கடினம்",
          played: "விளையாடியது",
          unplayed: "விளையாடாதது",
          allDates: "எல்லா தேதிகளும்",
          newest: "புதியது",
          oldest: "பழையது",
          titleAsc: "தலைப்பு A-Z",
          bestScore: "சிறந்த மதிப்பெண்",
          result: "முடிவு",
          results: "முடிவுகள்",
          empty: "பொருந்தும் புதிர் இல்லை.",
          words: "சொற்கள்",
          notPlayed: "இன்னும் விளையாடவில்லை",
          open: "திற",
          points: "புள்ளிகள்",
        }
      : locale === "fr"
        ? {
            search: "Rechercher...",
            filters: "Filtres",
            level: "Niveau",
            difficulty: "Difficulté",
            status: "Statut",
            dateAdded: "Date d'ajout",
            sortBy: "Trier par",
            reset: "Réinitialiser",
            all: "Tous",
            easy: "Facile",
            medium: "Moyen",
            hard: "Difficile",
            played: "Joué",
            unplayed: "Non joué",
            allDates: "Toutes les dates",
            newest: "Plus récent",
            oldest: "Plus ancien",
            titleAsc: "Titre A-Z",
            bestScore: "Meilleur score",
            result: "résultat",
            results: "résultats",
            empty: "Aucun puzzle trouvé.",
            words: "mots",
            notPlayed: "Non joué",
            open: "Ouvrir",
            points: "pts",
          }
        : {
            search: "Search...",
            filters: "Filters",
            level: "Level",
            difficulty: "Difficulty",
            status: "Status",
            dateAdded: "Date added",
            sortBy: "Sort by",
            reset: "Reset",
            all: "All",
            easy: "Easy",
            medium: "Medium",
            hard: "Hard",
            played: "Played",
            unplayed: "Unplayed",
            allDates: "All dates",
            newest: "Newest",
            oldest: "Oldest",
            titleAsc: "Title A-Z",
            bestScore: "Best score",
            result: "result",
            results: "results",
            empty: "No puzzle found.",
            words: "words",
            notPlayed: "Not played",
            open: "Open",
            points: "pts",
          };

  const months = useMemo(() => {
    const seen = new Set<string>();

    grids.forEach((grid) => {
      const date = parseCreatedAt(grid.createdAt);

      if (date) {
        seen.add(monthKey(date));
      }
    });

    return Array.from(seen).sort().reverse();
  }, [grids]);

  const activeFilterCount = [
    levelFilter !== "ALL",
    difficultyFilter !== "ALL",
    statusFilter !== "ALL",
    dateFilter !== "ALL",
    sortBy !== "date_desc",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setLevelFilter("ALL");
    setDifficultyFilter("ALL");
    setStatusFilter("ALL");
    setDateFilter("ALL");
    setSortBy("date_desc");
  };

  const filteredGrids = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return grids
      .filter((grid) => {
        const level = difficultyToLevel[grid.difficulty];
        const tone = difficultyToTone[grid.difficulty];
        const score = userScores[grid.id];
        const played = typeof score === "number";
        const date = parseCreatedAt(grid.createdAt);
        const matchesQuery = `${grid.title} ${grid.description}`.toLowerCase().includes(normalizedQuery);
        const matchesLevel = levelFilter === "ALL" || levelFilter === level;
        const matchesDifficulty = difficultyFilter === "ALL" || difficultyFilter === tone;
        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "PLAYED" && played) ||
          (statusFilter === "UNPLAYED" && !played);
        const matchesDate = dateFilter === "ALL" || (date ? monthKey(date) === dateFilter : false);

        return matchesQuery && matchesLevel && matchesDifficulty && matchesStatus && matchesDate;
      })
      .sort((a, b) => {
        if (sortBy === "title_asc") {
          return a.title.localeCompare(b.title);
        }

        if (sortBy === "score_desc") {
          return (userScores[b.id] ?? -1) - (userScores[a.id] ?? -1);
        }

        const timeA = parseCreatedAt(a.createdAt)?.getTime() ?? 0;
        const timeB = parseCreatedAt(b.createdAt)?.getTime() ?? 0;

        return sortBy === "date_asc" ? timeA - timeB : timeB - timeA;
      });
  }, [dateFilter, difficultyFilter, grids, levelFilter, query, sortBy, statusFilter, userScores]);

  return (
    <div className="min-h-screen px-5 py-6 text-[#180d2b]">
      <main className="mx-auto max-w-[46rem]">
        <div className="mb-3 flex gap-3">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8a6a9c]"
            />
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
            className={`relative flex flex-shrink-0 items-center gap-2 rounded-full border-[3px] px-4 py-2.5 text-sm font-black shadow-[4px_5px_0_#180d2b] transition-all hover:-translate-y-0.5 ${
              showFilters || activeFilterCount > 0
                ? "border-[#180d2b] bg-[#7c3aed] text-white"
                : "border-[#180d2b] bg-[#7c3aed] text-white"
            }`}
          >
            <Icon name="sliders" className="h-3.5 w-3.5" />
            {copy.filters}
            {activeFilterCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border-[2px] border-[#180d2b] bg-[#c6ff2e] text-[10px] font-black text-[#180d2b]">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {showFilters ? (
          <div className="mb-6 space-y-5 rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[5px_6px_0_#180d2b]">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8a6a9c]">{copy.level}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setLevelFilter(filter)}
                      className={`rounded-full border-[2px] border-[#180d2b] px-3 py-1 text-[10px] font-black uppercase tracking-wide shadow-[2px_3px_0_#180d2b] transition-all hover:-translate-y-0.5 ${
                        levelFilter === filter ? "bg-[#7c3aed] text-white" : "bg-[#fff7ed] text-[#180d2b]"
                      }`}
                    >
                      {filter === "ALL" ? copy.all : levelConfig[filter].label[locale]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8a6a9c]">{copy.difficulty}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setDifficultyFilter(filter)}
                      className={`rounded-full border-[2px] border-[#180d2b] px-3 py-1 text-[10px] font-black uppercase tracking-wide shadow-[2px_3px_0_#180d2b] transition-all hover:-translate-y-0.5 ${
                        difficultyFilter === filter
                          ? "bg-[#7c3aed] text-white"
                          : "bg-[#fff7ed] text-[#180d2b]"
                      }`}
                    >
                      {filter === "ALL"
                        ? copy.all
                        : filter === "EASY"
                          ? copy.easy
                          : filter === "MEDIUM"
                            ? copy.medium
                            : copy.hard}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8a6a9c]">{copy.status}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["ALL", "PLAYED", "UNPLAYED"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`rounded-full border-[2px] border-[#180d2b] px-3 py-1 text-[10px] font-black uppercase tracking-wide shadow-[2px_3px_0_#180d2b] transition-all hover:-translate-y-0.5 ${
                        statusFilter === filter ? "bg-[#7c3aed] text-white" : "bg-[#fff7ed] text-[#180d2b]"
                      }`}
                    >
                      {filter === "ALL" ? copy.all : filter === "PLAYED" ? copy.played : copy.unplayed}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8a6a9c]">{copy.dateAdded}</p>
                <div className="relative">
                  <Icon
                    name="calendar"
                    className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-[#8a6a9c]"
                  />
                  <select
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-full border-[2px] border-[#180d2b] bg-[#fff7ed] py-2 pl-8 pr-7 text-[11px] font-black text-[#180d2b] outline-none"
                  >
                    <option value="ALL" className="bg-[#fff7ea]">
                      {copy.allDates}
                    </option>
                    {months.map((month) => (
                      <option key={month} value={month} className="bg-[#fff7ea]">
                        {monthLabel(month, locale)}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="chevron-down"
                    className="pointer-events-none absolute right-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-[#8a6a9c]"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t-[2px] border-[#180d2b] pt-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8a6a9c]">{copy.sortBy}</p>
                <div className="flex flex-wrap gap-1.5">
                  {([
                    { value: "date_desc", label: copy.newest },
                    { value: "date_asc", label: copy.oldest },
                    { value: "title_asc", label: copy.titleAsc },
                    { value: "score_desc", label: copy.bestScore },
                  ] as const).map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSortBy(value)}
                      className={`rounded-full border-[2px] border-[#180d2b] px-3 py-1 text-[10px] font-black tracking-wide shadow-[2px_3px_0_#180d2b] transition-all hover:-translate-y-0.5 ${
                        sortBy === value ? "bg-[#7c3aed] text-white" : "bg-[#fff7ed] text-[#180d2b]"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {activeFilterCount > 0 ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="flex flex-shrink-0 items-center gap-1.5 text-[11px] font-black text-[#ff3b6f] transition-colors hover:text-[#be123c]"
                >
                  <Icon name="x" className="h-3 w-3" />
                  {copy.reset}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <p className="mb-5 text-[11px] font-black uppercase tracking-[0.22em] text-[#8a6a9c]">
          {filteredGrids.length} {filteredGrids.length === 1 ? copy.result : copy.results}
        </p>

        <div className="space-y-3.5">
          {filteredGrids.length === 0 ? (
            <div className="py-24 text-center text-sm font-semibold text-[#8a6a9c]">{copy.empty}</div>
          ) : null}

          {filteredGrids.map((grid) => {
            const level = difficultyToLevel[grid.difficulty];
            const tone = difficultyToTone[grid.difficulty];
            const levelMeta = levelConfig[level];
            const score = userScores[grid.id];
            const played = typeof score === "number";

            return (
              <Link
                key={grid.id}
                href={`/${locale}/word-search/${grid.id}`}
                className="group relative block overflow-hidden rounded-[1.15rem] border-[3px] border-[#180d2b] bg-white shadow-[6px_7px_0_#180d2b] transition-all duration-200 hover:-translate-y-0.5"
              >
                <div className="flex items-center gap-5 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border-[2px] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wide ${levelMeta.badge}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: levelMeta.accent }} />
                        {levelMeta.label[locale]}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-wide text-[#8a6a9c]">
                        {tone === "EASY" ? copy.easy : tone === "MEDIUM" ? copy.medium : copy.hard}
                      </span>
                    </div>

                    <h2 className="truncate text-[15px] font-black leading-tight text-[#180d2b]">{grid.title}</h2>
                    {grid.description ? <p className="mt-0.5 text-xs font-semibold text-[#8a6a9c]">{grid.description}</p> : null}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8a6a9c]">
                        <Icon name="clock" className="h-2.5 w-2.5" />
                        {Math.ceil(grid.timeLimitSeconds / 60)} min
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8a6a9c]">
                        <Icon name="layers" className="h-2.5 w-2.5" />
                        {grid.words.length} {copy.words}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-[#8a6a9c]">
                        <Icon name="calendar" className="h-2.5 w-2.5" />
                        {formatDate(grid.createdAt, locale)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 flex-col items-end gap-2.5">
                    {played ? (
                      <div className="flex items-center gap-1.5">
                        <Icon name="trophy" className="h-3 w-3 text-[#ffc43d]" />
                        <span className="text-xs font-black text-[#ffc43d]">
                          + {score} {copy.points}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-semibold italic text-[#b49ac6]">{copy.notPlayed}</span>
                    )}

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
