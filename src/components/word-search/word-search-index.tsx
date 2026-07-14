"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { Difficulty, Locale, WordSearchGrid } from "@/types";

type LevelFilter = "ALL" | "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
type DifficultyFilter = "ALL" | "EASY" | "MEDIUM" | "HARD";
type StatusFilter = "ALL" | "PLAYED" | "UNPLAYED";
type SortOption = "date_desc" | "date_asc" | "title_asc" | "score_desc";
type IconName = "calendar" | "chevron-down" | "clock" | "grid" | "layers" | "search" | "shuffle" | "sliders" | "trophy" | "x";

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
    badge: "bg-[#eaf7d6] text-[#397013]",
    label: { en: "Beginner", fr: "Débutant", ta: "தொடக்கநிலை" },
  },
  INTERMEDIATE: {
    accent: "#7c3aed",
    badge: "bg-[#eee8ff] text-[#5f42b5]",
    label: { en: "Intermediate", fr: "Intermédiaire", ta: "இடைநிலை" },
  },
  ADVANCED: {
    accent: "#ff3b6f",
    badge: "bg-[#fde4eb] text-[#a43d5b]",
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
  shuffle: (
    <>
      <path d="M3 7h3c4 0 5 10 9 10h6" />
      <path d="m18 14 3 3-3 3" />
      <path d="M3 17h3c1.7 0 2.9-1.8 4-3.9" />
      <path d="M14 7h7" />
      <path d="m18 4 3 3-3 3" />
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
  const router = useRouter();
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
          shuffle: "சீரற்ற கட்டம்",
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
            shuffle: "Aléatoire",
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
            shuffle: "Shuffle",
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
      const date = parseCreatedAt(grid.publishDate ?? grid.createdAt);

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
        const date = parseCreatedAt(grid.publishDate ?? grid.createdAt);
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

        const timeA = parseCreatedAt(a.publishDate ?? a.createdAt)?.getTime() ?? 0;
        const timeB = parseCreatedAt(b.publishDate ?? b.createdAt)?.getTime() ?? 0;

        return sortBy === "date_asc" ? timeA - timeB : timeB - timeA;
      });
  }, [dateFilter, difficultyFilter, grids, levelFilter, query, sortBy, statusFilter, userScores]);

  const openRandomGrid = () => {
    if (filteredGrids.length === 0) {
      return;
    }

    const randomGrid = filteredGrids[Math.floor(Math.random() * filteredGrids.length)];
    router.push(`/${locale}/word-search/${randomGrid.id}`);
  };

  return (
    <div className="min-h-screen bg-[#fbefd8] px-2 py-2 text-[#211b14] sm:px-5 sm:py-5 lg:px-8 lg:py-7">
      <main className="mx-auto max-w-[90rem]">
        <div className="mb-2 flex gap-2">
          <div className="relative flex-1">
            <Icon
              name="search"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9a8b73]"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.search}
              className="h-10 w-full rounded-lg border border-[#d8c7a9] bg-white pl-9 pr-3 text-xs font-medium text-[#211b14] outline-none transition placeholder:text-[#9a8b73] focus:border-[#5b3fa3] focus:ring-2 focus:ring-[#5b3fa3]/10 sm:text-sm"
            />
          </div>
          <button
            type="button"
            onClick={openRandomGrid}
            disabled={filteredGrids.length === 0}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-[#d8c7a9] bg-white text-[#55409a] transition-colors hover:border-[#55409a] hover:bg-[#f4efff] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto sm:gap-1.5 sm:px-3"
            aria-label={copy.shuffle}
            title={copy.shuffle}
          >
            <Icon name="shuffle" className="h-3.5 w-3.5" />
            <span className="hidden text-xs font-bold sm:inline">{copy.shuffle}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowFilters((value) => !value)}
            className={`relative flex h-10 flex-shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-bold transition-colors ${
              showFilters || activeFilterCount > 0
                ? "bg-[#55409a] text-white"
                : "bg-[#55409a] text-white hover:bg-[#493584]"
            }`}
          >
            <Icon name="sliders" className="h-3.5 w-3.5" />
            {copy.filters}
            {activeFilterCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#ffc43d] text-[10px] font-black text-[#211b14] ring-2 ring-[#fbefd8]">
                {activeFilterCount}
              </span>
            ) : null}
          </button>
        </div>

        {showFilters ? (
          <div className="mb-3 space-y-4 rounded-xl border border-[#e0d4bf] bg-white p-3 sm:p-4">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-[#8a6a9c]">{copy.level}</p>
                <div className="flex flex-wrap gap-1.5">
                  {(["ALL", "BEGINNER", "INTERMEDIATE", "ADVANCED"] as const).map((filter) => (
                    <button
                      key={filter}
                      type="button"
                      onClick={() => setLevelFilter(filter)}
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-colors ${
                        levelFilter === filter ? "border-[#55409a] bg-[#55409a] text-white" : "border-[#e0d4bf] bg-[#fffaf0] text-[#544936]"
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
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-colors ${
                        difficultyFilter === filter
                          ? "border-[#55409a] bg-[#55409a] text-white"
                          : "border-[#e0d4bf] bg-[#fffaf0] text-[#544936]"
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
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-colors ${
                        statusFilter === filter ? "border-[#55409a] bg-[#55409a] text-white" : "border-[#e0d4bf] bg-[#fffaf0] text-[#544936]"
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
                    className="w-full cursor-pointer appearance-none rounded-lg border border-[#e0d4bf] bg-[#fffaf0] py-2 pl-8 pr-7 text-[11px] font-bold text-[#544936] outline-none"
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

            <div className="flex flex-col gap-4 border-t border-[#e0d4bf] pt-4 sm:flex-row sm:items-end sm:justify-between">
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
                      className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-colors ${
                        sortBy === value ? "border-[#55409a] bg-[#55409a] text-white" : "border-[#e0d4bf] bg-[#fffaf0] text-[#544936]"
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

        <p className="mb-2 px-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#9a8b73]">
          {filteredGrids.length} {filteredGrids.length === 1 ? copy.result : copy.results}
        </p>

        <div className="space-y-2 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
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
                className="render-lazy group relative block rounded-xl border border-[#e0d4bf] bg-white px-3 py-2.5 transition duration-200 hover:border-[#c7b694] hover:shadow-[0_8px_22px_-18px_rgba(55,42,23,0.65)] sm:px-4 sm:py-3 lg:flex lg:min-h-[160px] lg:flex-col"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold ${levelMeta.badge}`}
                      >
                        {levelMeta.label[locale]}
                      </span>
                      <span className="truncate text-[9px] font-medium text-[#9a8b73]">
                        {tone === "EASY" ? copy.easy : tone === "MEDIUM" ? copy.medium : copy.hard}
                      </span>
                  </div>

                  {played ? (
                    <div className="flex shrink-0 items-center gap-1 text-[#a86600]">
                      <Icon name="trophy" className="h-3 w-3" />
                      <span className="text-[9px] font-bold">+ {score} {copy.points}</span>
                    </div>
                  ) : (
                    <span className="shrink-0 text-[9px] font-medium italic text-[#aa9679]">{copy.notPlayed}</span>
                  )}
                </div>

                <h2 className="mt-1.5 truncate text-[13px] font-bold leading-tight text-[#211b14] sm:text-sm">{grid.title}</h2>
                {grid.description ? <p className="mt-0.5 truncate text-[10px] font-medium text-[#76664f] sm:text-xs">{grid.description}</p> : null}

                <div className="mt-2 flex items-end justify-between gap-2 lg:mt-auto lg:pt-3">
                  <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="flex items-center gap-1 text-[9px] font-medium text-[#9a8b73]">
                        <Icon name="clock" className="h-2.5 w-2.5 text-[#b3893f]" />
                        {Math.ceil(grid.timeLimitSeconds / 60)} min
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-medium text-[#9a8b73]">
                        <Icon name="layers" className="h-2.5 w-2.5 text-[#b3893f]" />
                        {grid.words.length} {copy.words}
                      </span>
                      <span className="flex items-center gap-1 text-[9px] font-medium text-[#9a8b73]">
                        <Icon name="calendar" className="h-2.5 w-2.5 text-[#b3893f]" />
                        {formatDate(grid.publishDate ?? grid.createdAt, locale)}
                      </span>
                  </div>

                  <span className="inline-flex h-6 shrink-0 items-center gap-1.5 rounded-full bg-[#282418] px-3 text-[9px] font-bold text-white transition group-hover:bg-[#55409a]">
                    <Icon name="grid" className="h-2.5 w-2.5" />
                    {copy.open}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
