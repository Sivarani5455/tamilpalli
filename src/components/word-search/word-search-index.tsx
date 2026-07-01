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
    accent: "#10b981",
    badge: "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
    label: { en: "Beginner", fr: "Débutant", ta: "தொடக்கநிலை" },
  },
  INTERMEDIATE: {
    accent: "#f59e0b",
    badge: "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
    label: { en: "Intermediate", fr: "Intermédiaire", ta: "இடைநிலை" },
  },
  ADVANCED: {
    accent: "#f43f5e",
    badge: "bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30",
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
    <div className="min-h-screen bg-[#0d0f14] px-5 py-10 text-white">
      <main className="mx-auto max-w-3xl">
        <div className="mb-3 flex gap-3">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/25"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              className="w-full rounded-xl border border-white/[0.08] bg-[#1a1d26] py-2.5 pl-9 pr-4 text-sm text-white transition-colors placeholder:text-white/20 focus:border-white/20 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className={`relative flex flex-shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
              showFilters || activeFilterCount > 0
                ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400"
                : "border-white/[0.08] bg-[#1a1d26] text-white/40 hover:text-white/70"
            }`}
          >
            <Icon name="sliders" className="h-3.5 w-3.5" />
            {copy.filters}
            {activeFilterCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {showFilters ? (
          <div className="mb-6 space-y-5 rounded-2xl border border-white/[0.07] bg-[#13161f] p-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">{copy.level}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setLevelFilter(filter)}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all ${
                        levelFilter === filter ? "bg-emerald-500 text-white" : "bg-white/5 text-white/30 hover:text-white/60"
                      }`}
                    >
                      {filter === "ALL" ? copy.all : levelConfig[filter].label[locale]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">{copy.difficulty}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["ALL", "EASY", "MEDIUM", "HARD"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setDifficultyFilter(filter)}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all ${
                        difficultyFilter === filter
                          ? "bg-emerald-500 text-white"
                          : "bg-white/5 text-white/30 hover:text-white/60"
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
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">{copy.status}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["ALL", "PLAYED", "UNPLAYED"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setStatusFilter(filter)}
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide transition-all ${
                        statusFilter === filter ? "bg-emerald-500 text-white" : "bg-white/5 text-white/30 hover:text-white/60"
                      }`}
                    >
                      {filter === "ALL" ? copy.all : filter === "PLAYED" ? copy.played : copy.unplayed}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">{copy.dateAdded}</p>
                <div className="relative">
                  <Icon
                    name="calendar"
                    className="pointer-events-none absolute left-3 top-1/2 h-3 w-3 -translate-y-1/2 text-white/25"
                  />
                  <select
                    value={dateFilter}
                    onChange={(event) => setDateFilter(event.target.value)}
                    className="w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-white/5 py-1.5 pl-8 pr-7 text-[11px] text-white/60 transition-colors focus:border-white/25 focus:outline-none"
                  >
                    <option value="ALL" className="bg-[#13161f]">
                      {copy.allDates}
                    </option>
                    {months.map((month) => (
                      <option key={month} value={month} className="bg-[#13161f]">
                        {monthLabel(month, locale)}
                      </option>
                    ))}
                  </select>
                  <Icon
                    name="chevron-down"
                    className="pointer-events-none absolute right-2.5 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-white/25"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex-1">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-white/25">{copy.sortBy}</p>
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
                      className={`rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wide transition-all ${
                        sortBy === value ? "bg-emerald-500 text-white" : "bg-white/5 text-white/30 hover:text-white/60"
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
                  className="flex flex-shrink-0 items-center gap-1.5 text-[11px] font-semibold text-white/25 transition-colors hover:text-rose-400"
                >
                  <Icon name="x" className="h-3 w-3" />
                  {copy.reset}
                </button>
              ) : null}
            </div>
          </div>
        ) : null}

        <p className="mb-5 text-[11px] uppercase tracking-widest text-white/20">
          {filteredGrids.length} {filteredGrids.length === 1 ? copy.result : copy.results}
        </p>

        <div className="space-y-2.5">
          {filteredGrids.length === 0 ? (
            <div className="py-24 text-center text-sm text-white/15">{copy.empty}</div>
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
                className="group relative block overflow-hidden rounded-2xl border border-white/[0.06] bg-[#13161f] transition-all duration-200 hover:border-white/[0.12]"
              >
                <div className="flex items-center gap-5 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${levelMeta.badge}`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: levelMeta.accent }} />
                        {levelMeta.label[locale]}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-white/20">
                        {tone === "EASY" ? copy.easy : tone === "MEDIUM" ? copy.medium : copy.hard}
                      </span>
                    </div>

                    <h2 className="truncate text-[15px] font-bold leading-tight text-white">{grid.title}</h2>
                    {grid.description ? <p className="mt-0.5 text-xs text-white/30">{grid.description}</p> : null}

                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <span className="flex items-center gap-1 text-[11px] text-white/25">
                        <Icon name="clock" className="h-2.5 w-2.5" />
                        {Math.ceil(grid.timeLimitSeconds / 60)} min
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-white/25">
                        <Icon name="layers" className="h-2.5 w-2.5" />
                        {grid.words.length} {copy.words}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] text-white/25">
                        <Icon name="calendar" className="h-2.5 w-2.5" />
                        {formatDate(grid.createdAt, locale)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-shrink-0 flex-col items-end gap-2.5">
                    {played ? (
                      <div className="flex items-center gap-1.5">
                        <Icon name="trophy" className="h-3 w-3 text-amber-400" />
                        <span className="text-xs font-bold text-amber-400">
                          + {score} {copy.points}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] italic text-white/20">{copy.notPlayed}</span>
                    )}

                    <span className="relative inline-flex items-center gap-1.5 overflow-hidden rounded-xl bg-[linear-gradient(135deg,#3b82f6,#2563eb)] px-4 py-1.5 text-xs font-bold uppercase tracking-wide text-white">
                      <span className="absolute inset-0 bg-white/10 opacity-0 transition-opacity group-hover:opacity-100" />
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
