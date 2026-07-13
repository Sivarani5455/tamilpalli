"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Difficulty, KathaigalStory, Locale } from "@/types";

const difficultyMeta: Record<Difficulty, { label: Record<Locale, string>; level: Record<Locale, string>; tone: string }> = {
  beginner: {
    label: { en: "Beginner", fr: "Débutant", ta: "தொடக்கநிலை" },
    level: { en: "Easy", fr: "Facile", ta: "எளிது" },
    tone: "bg-[#eaf7d6] text-[#397013]",
  },
  intermediate: {
    label: { en: "Intermediate", fr: "Intermédiaire", ta: "இடைநிலை" },
    level: { en: "Medium", fr: "Moyen", ta: "நடுத்தரம்" },
    tone: "bg-[#eee8ff] text-[#5f42b5]",
  },
  advanced: {
    label: { en: "Advanced", fr: "Avancé", ta: "மேம்பட்டது" },
    level: { en: "Hard", fr: "Difficile", ta: "கடினம்" },
    tone: "bg-[#fde4eb] text-[#a43d5b]",
  },
};

function SearchIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>;
}

function FilterIcon() {
  return <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 5h-8M9 5H3M21 12h-5M12 12H3M21 19h-9M8 19H3" /><circle cx="11" cy="5" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="10" cy="19" r="2" /></svg>;
}

const copy = {
  en: { search: "Search...", filters: "Filters", results: "results", result: "result", all: "All", open: "Open", paragraphs: "paragraphs", questions: "questions", empty: "No stories are available yet." },
  fr: { search: "Rechercher...", filters: "Filtres", results: "résultats", result: "résultat", all: "Tous", open: "Ouvrir", paragraphs: "paragraphes", questions: "questions", empty: "Aucune histoire n'est disponible pour le moment." },
  ta: { search: "தேடுக...", filters: "வடிகட்டிகள்", results: "முடிவுகள்", result: "முடிவு", all: "அனைத்தும்", open: "திற", paragraphs: "பத்திகள்", questions: "கேள்விகள்", empty: "இப்போது கதைகள் எதுவும் இல்லை." },
} satisfies Record<Locale, Record<string, string>>;

export function KathaigalIndex({ stories, locale }: { stories: KathaigalStory[]; locale: Locale }) {
  const labels = copy[locale];
  const [query, setQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [difficulty, setDifficulty] = useState<"ALL" | Difficulty>("ALL");

  const filteredStories = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase(locale);
    return stories.filter((story) => {
      const matchesText = `${story.title} ${story.description}`.toLocaleLowerCase(locale).includes(normalized);
      return matchesText && (difficulty === "ALL" || story.difficulty === difficulty);
    });
  }, [difficulty, locale, query, stories]);

  return (
    <main className="min-h-screen bg-[#fbefd8] px-2 py-2 text-[#211b14] sm:px-5 sm:py-5 lg:px-8 lg:py-7">
      <section className="mx-auto max-w-[90rem]">
        <div className="mb-2 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9a8b73]"><SearchIcon /></span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={labels.search} className="h-10 w-full rounded-lg border border-[#d8c7a9] bg-white pl-9 pr-3 text-xs font-medium outline-none transition placeholder:text-[#9a8b73] focus:border-[#55409a] focus:ring-2 focus:ring-[#55409a]/10 sm:text-sm" />
          </div>
          <button type="button" onClick={() => setShowFilters((value) => !value)} className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#55409a] px-3 text-xs font-bold text-white transition-colors hover:bg-[#493584]">
            <FilterIcon /> {labels.filters}
          </button>
        </div>

        {showFilters ? (
          <div className="mb-3 rounded-xl border border-[#e0d4bf] bg-white p-3 sm:p-4">
            <div className="flex flex-wrap gap-2">
              {(["ALL", "beginner", "intermediate", "advanced"] as const).map((option) => (
                <button key={option} type="button" onClick={() => setDifficulty(option)} className={`rounded-full border px-3 py-1 text-[10px] font-bold transition-colors ${difficulty === option ? "border-[#55409a] bg-[#55409a] text-white" : "border-[#e0d4bf] bg-[#fffaf0] text-[#544936]"}`}>
                  {option === "ALL" ? labels.all : difficultyMeta[option].label[locale]}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <p className="mb-2 px-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#9a8b73]">{filteredStories.length} {filteredStories.length === 1 ? labels.result : labels.results}</p>

        {filteredStories.length === 0 ? <div className="py-24 text-center text-sm font-medium text-[#9a8b73]">{labels.empty}</div> : null}

        <div className="space-y-2 lg:grid lg:grid-cols-3 lg:gap-3 lg:space-y-0">
          {filteredStories.map((story) => {
            const meta = difficultyMeta[story.difficulty];
            return (
              <Link key={story.id} href={`/${locale}/kathaigal/${story.id}`} className="render-lazy group relative flex min-h-[140px] flex-col rounded-xl border border-[#e0d4bf] bg-white px-3 py-2.5 transition hover:border-[#c7b694] hover:shadow-[0_8px_22px_-18px_rgba(55,42,23,0.65)] sm:px-4 sm:py-3 lg:min-h-[160px]">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${meta.tone}`}>{meta.label[locale]}</span>
                  <span className="text-[9px] font-medium text-[#9a8b73]">{meta.level[locale]}</span>
                </div>
                <h2 className="mt-2 truncate font-tamil text-[14px] font-bold leading-tight text-[#211b14] sm:text-base">{story.title}</h2>
                <p className="mt-1 line-clamp-2 text-[10px] font-medium leading-4 text-[#76664f] sm:text-xs">{story.description}</p>
                <div className="mt-2 flex flex-wrap gap-2 text-[9px] font-medium text-[#9a8b73]">
                  <span>▤ {story.paragraphs.length} {labels.paragraphs}</span>
                  <span>◇ {story.questions.length} {labels.questions}</span>
                </div>
                <span className="mt-auto inline-flex h-6 w-fit items-center gap-1.5 rounded-full bg-[#282418] px-3 text-[9px] font-bold text-white transition group-hover:bg-[#55409a]">▦ {labels.open}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
