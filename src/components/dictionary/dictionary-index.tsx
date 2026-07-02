"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { DictionaryEntry, Locale } from "@/types";

type ProgressSnapshot = Record<
  string,
  {
    views: number;
    learned: number;
    lastSeenDay: number | null;
    lastLearnedDay: number | null;
  }
>;

const copy = {
  en: {
    title: "Agarathi",
    subtitle: "A colorful Tamil picture dictionary for everyday learning.",
    wordOfDay: "Word of the day",
    searchPlaceholder: "Search a word or Tamil term...",
    allLetters: "All",
    browseHint: "Tap a card to open the full word page.",
    translation: "Tamil translation",
    description: "Description",
    type: "Type",
    example: "Example",
    synonyms: "Synonyms",
    empty: "No dictionary entries are available yet.",
    emptyFiltered: "No words match the current filters.",
    back: "Back",
    previous: "Previous",
    next: "Next",
    copyLink: "Copy link",
    copied: "Copied",
    open: "Open",
    words: "Words",
    letters: "Letters",
    statusNew: "New",
    statusSeen: "Seen",
    statusMastered: "Mastered",
    quizTitle: "Daily quiz",
    quizPrompt: "Match the word with the right Tamil answer.",
    quizPromptTa: "Read the clue and choose the right Tamil word.",
    quizProgress: "Question",
    quizCorrect: "Correct answer",
    quizWrong: "Try again",
    quizNext: "Next question",
    quizFinish: "Finish quiz",
    quizRestart: "Restart quiz",
    quizDone: "Quiz completed",
    quizScore: "Score",
    results: "Results",
    shown: "Shown",
    loadMore: "Load more",
  },
  fr: {
    title: "Agarathi",
    subtitle: "Un dictionnaire visuel tamoul coloré pour apprendre chaque jour.",
    wordOfDay: "Mot du jour",
    searchPlaceholder: "Rechercher un mot ou un terme tamoul...",
    allLetters: "Tout",
    browseHint: "Touchez une carte pour ouvrir la fiche complète.",
    translation: "Traduction tamoule",
    description: "Description",
    type: "Type",
    example: "Exemple",
    synonyms: "Synonymes",
    empty: "Aucune entrée du dictionnaire n'est disponible pour le moment.",
    emptyFiltered: "Aucun mot ne correspond aux filtres actuels.",
    back: "Retour",
    previous: "Précédent",
    next: "Suivant",
    copyLink: "Copier le lien",
    copied: "Copié",
    open: "Ouvrir",
    words: "Mots",
    letters: "Lettres",
    statusNew: "Nouveau",
    statusSeen: "Déjà vu",
    statusMastered: "Maîtrisé",
    quizTitle: "Quiz du jour",
    quizPrompt: "Associez le mot à la bonne réponse tamoule.",
    quizPromptTa: "Lisez l'indice et choisissez le bon mot tamoul.",
    quizProgress: "Question",
    quizCorrect: "Bonne réponse",
    quizWrong: "Essayez encore",
    quizNext: "Question suivante",
    quizFinish: "Terminer le quiz",
    quizRestart: "Recommencer le quiz",
    quizDone: "Quiz terminé",
    quizScore: "Score",
    results: "Résultats",
    shown: "Affichés",
    loadMore: "Afficher plus",
  },
  ta: {
    title: "அகராதி",
    subtitle: "தினசரி கற்றலுக்கான வண்ணமயமான தமிழ் பட அகராதி.",
    wordOfDay: "இன்றைய சொல்",
    searchPlaceholder: "சொல் அல்லது தமிழ் பதிவைத் தேடுங்கள்...",
    allLetters: "அனைத்தும்",
    browseHint: "முழு சொல்லைப் பார்க்க ஒரு அட்டையைத் திறக்கவும்.",
    translation: "தமிழ் சொல்",
    description: "விளக்கம்",
    type: "சொல் வகை",
    example: "உதாரணம்",
    synonyms: "இணைச்சொற்கள்",
    empty: "இப்போது அகராதியில் சொற்கள் எதுவும் இல்லை.",
    emptyFiltered: "தற்போதைய வடிகட்டலுக்கு பொருந்தும் சொற்கள் இல்லை.",
    back: "திரும்பு",
    previous: "முந்தையது",
    next: "அடுத்தது",
    copyLink: "இணைப்பை நகலெடு",
    copied: "நகலெடுக்கப்பட்டது",
    open: "திற",
    words: "சொற்கள்",
    letters: "எழுத்துகள்",
    statusNew: "புதியது",
    statusSeen: "பார்த்தது",
    statusMastered: "முழுமையாக கற்றது",
    quizTitle: "இன்றைய வினாடி வினா",
    quizPrompt: "சரியான தமிழ் பதிலைத் தேர்ந்தெடுக்கவும்.",
    quizPromptTa: "குறிப்பைப் படித்து சரியான தமிழ் சொல்லைத் தேர்வு செய்யவும்.",
    quizProgress: "கேள்வி",
    quizCorrect: "சரியான பதில்",
    quizWrong: "மீண்டும் முயற்சி செய்யவும்",
    quizNext: "அடுத்த கேள்வி",
    quizFinish: "வினாவை முடிக்கவும்",
    quizRestart: "மீண்டும் தொடங்கவும்",
    quizDone: "வினாடி வினா முடிந்தது",
    quizScore: "மதிப்பெண்",
    results: "முடிவுகள்",
    shown: "காண்பிக்கப்பட்டவை",
    loadMore: "மேலும் காட்டு",
  },
} satisfies Record<
  Locale,
  {
    title: string;
    subtitle: string;
    wordOfDay: string;
    searchPlaceholder: string;
    allLetters: string;
    browseHint: string;
    translation: string;
    description: string;
    type: string;
    example: string;
    synonyms: string;
    empty: string;
    emptyFiltered: string;
    back: string;
    previous: string;
    next: string;
    copyLink: string;
    copied: string;
    open: string;
    words: string;
    letters: string;
    statusNew: string;
    statusSeen: string;
    statusMastered: string;
    quizTitle: string;
    quizPrompt: string;
    quizPromptTa: string;
    quizProgress: string;
    quizCorrect: string;
    quizWrong: string;
    quizNext: string;
    quizFinish: string;
    quizRestart: string;
    quizDone: string;
    quizScore: string;
    results: string;
    shown: string;
    loadMore: string;
  }
>;

const accents = [
  { solid: "#ff6b6b", soft: "#fff0f0", border: "#ffd7d7", glow: "rgba(255,107,107,0.24)" },
  { solid: "#ff9f1c", soft: "#fff5dd", border: "#ffe6b4", glow: "rgba(255,159,28,0.24)" },
  { solid: "#14b8a6", soft: "#ebfffb", border: "#b5f0e8", glow: "rgba(20,184,166,0.24)" },
  { solid: "#4361ee", soft: "#eef2ff", border: "#d6ddff", glow: "rgba(67,97,238,0.24)" },
  { solid: "#8b5cf6", soft: "#f3ebff", border: "#e4d4ff", glow: "rgba(139,92,246,0.24)" },
];

function getPrimaryWord(entry: DictionaryEntry, locale: Locale) {
  if (locale === "ta") {
    return entry.translations.ta?.word ?? "";
  }

  return entry.translations[locale]?.word ?? "";
}

function getTamilWord(entry: DictionaryEntry) {
  return entry.translations.ta?.word ?? "";
}

function getTamilSynonyms(entry: DictionaryEntry) {
  return entry.tamilSynonyms ?? [];
}

function getTamilDescription(entry: DictionaryEntry) {
  return entry.translations.ta?.description ?? "";
}

function getExample(entry: DictionaryEntry) {
  return entry.example ?? "";
}

function getLetter(entry: DictionaryEntry, locale: Locale) {
  const word = getPrimaryWord(entry, locale) || getTamilWord(entry);
  return word.trim().charAt(0).toUpperCase();
}

function getAccent(entry: DictionaryEntry) {
  const seed = `${entry.slug}-${entry.type ?? ""}`;
  const score = Array.from(seed).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return accents[score % accents.length];
}

function buildDictionaryHref(locale: Locale, slug: string) {
  return `/${locale}/agarathi/${slug}`;
}

function buildSeededOrder(items: string[], seed: number) {
  const pool = [...items];
  const result: string[] = [];
  let state = seed || 1;

  while (pool.length > 0) {
    state = (state * 1664525 + 1013904223) % 4294967296;
    const index = state % pool.length;
    result.push(pool.splice(index, 1)[0]);
  }

  return result;
}

function readProgressSnapshot() {
  if (typeof window === "undefined") {
    return {} as ProgressSnapshot;
  }

  const stored = window.localStorage.getItem("agarathi-progress");

  if (!stored) {
    return {} as ProgressSnapshot;
  }

  try {
    const parsed = JSON.parse(stored);
    return parsed && typeof parsed === "object" ? (parsed as ProgressSnapshot) : ({} as ProgressSnapshot);
  } catch {
    return {} as ProgressSnapshot;
  }
}

function persistProgressSnapshot(progress: ProgressSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("agarathi-progress", JSON.stringify(progress));
}

function Shapes() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -left-16 top-20 h-56 w-56 rounded-full bg-[#ffb703]/14 blur-3xl" />
      <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-[#4f46e5]/10 blur-3xl" />
      <div className="absolute bottom-24 left-6 h-36 w-36 rounded-[2rem] bg-[#14b8a6]/12 blur-2xl" />
      <div className="absolute -bottom-16 right-10 h-60 w-60 rounded-full bg-[#ff6b6b]/10 blur-3xl" />
    </div>
  );
}

function WordThumbnail({
  entry,
  locale,
  accent,
  className,
}: {
  entry: DictionaryEntry;
  locale: Locale;
  accent: (typeof accents)[number];
  className?: string;
}) {
  const label = getPrimaryWord(entry, locale) || getTamilWord(entry);

  return (
    <div
      className={`flex items-center justify-center overflow-hidden rounded-[1.75rem] ${className ?? ""}`}
      style={{ backgroundColor: accent.soft }}
    >
      {entry.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={entry.imageUrl} alt={label} className="h-full w-full object-cover" />
      ) : (
        <span className="text-4xl font-medium" style={{ color: accent.solid }}>
          {getLetter(entry, locale)}
        </span>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent: (typeof accents)[number];
}) {
  return (
    <div
      className="rounded-[1.35rem] border p-3 shadow-[0_20px_42px_-34px_rgba(15,23,42,0.28)]"
      style={{ borderColor: accent.border, backgroundColor: "#fff" }}
    >
      <p className="text-[0.7rem] font-medium uppercase tracking-[0.24em]" style={{ color: accent.solid }}>
        {label}
      </p>
      <p className="mt-2 text-[2.1rem] font-semibold leading-none tracking-[-0.04em] text-slate-900">{value}</p>
    </div>
  );
}

function DailyQuiz({
  dailyBatch,
  locale,
  dayNumber,
  labels,
  onLearn,
}: {
  dailyBatch: DictionaryEntry[];
  locale: Locale;
  dayNumber: number;
  labels: (typeof copy)[Locale];
  onLearn: (slug: string) => void;
}) {
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState<string | null>(null);
  const [quizAnswered, setQuizAnswered] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const dailyTamilOptions = useMemo(
    () => Array.from(new Set(dailyBatch.map((entry) => getTamilWord(entry)).filter(Boolean))),
    [dailyBatch],
  );
  const quizQuestions = useMemo(
    () =>
      dailyBatch.map((entry, index) => {
        const answer = getTamilWord(entry);
        const distractors = dailyTamilOptions.filter((value) => value !== answer);
        const seed = dayNumber + index * 17 + answer.length;
        const prompt =
          locale === "ta"
            ? getTamilDescription(entry) || getTamilWord(entry)
            : getPrimaryWord(entry, locale) || getTamilWord(entry);

        return {
          slug: entry.slug,
          prompt,
          answer,
          clue: locale === "ta" ? getExample(entry) : getTamilDescription(entry),
          options: buildSeededOrder([answer, ...buildSeededOrder(distractors, seed).slice(0, 3)], seed + 9),
        };
      }),
    [dailyBatch, dailyTamilOptions, dayNumber, locale],
  );

  const activeQuizQuestion = quizQuestions[quizIndex] ?? null;
  const quizIsDone = quizQuestions.length > 0 && quizIndex >= quizQuestions.length;

  function handleQuizAnswer(option: string) {
    if (!activeQuizQuestion || quizAnswered) {
      return;
    }

    const isCorrect = option === activeQuizQuestion.answer;
    setQuizSelected(option);
    setQuizAnswered(true);

    if (isCorrect) {
      setQuizScore((current) => current + 1);
      onLearn(activeQuizQuestion.slug);
    }
  }

  function goNextQuizQuestion() {
    setQuizIndex((current) => current + 1);
    setQuizSelected(null);
    setQuizAnswered(false);
  }

  function resetQuiz() {
    setQuizIndex(0);
    setQuizSelected(null);
    setQuizAnswered(false);
    setQuizScore(0);
  }

  if (quizQuestions.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-[2rem] border border-[#d8e6ff] bg-white shadow-[0_24px_56px_-38px_rgba(15,23,42,0.22)] lg:mt-0 lg:h-full">
      <div className="border-b border-[#edf2ff] bg-[linear-gradient(135deg,#eef8ff_0%,#f8f4ff_100%)] px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[0.74rem] font-medium uppercase tracking-[0.3em] text-[#5f769a]">{labels.quizTitle}</p>
            <p className="mt-2 text-sm text-slate-600">{locale === "ta" ? labels.quizPromptTa : labels.quizPrompt}</p>
          </div>
          <div className="rounded-[1.2rem] bg-white px-4 py-3 text-right shadow-[0_18px_34px_-28px_rgba(15,23,42,0.28)]">
            <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em] text-[#5f769a]">{labels.quizScore}</p>
            <p className="mt-1 text-2xl font-semibold tracking-[-0.05em] text-slate-900">
              {quizScore}/{quizQuestions.length}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {quizIsDone ? (
          <div className="rounded-[1.6rem] bg-[linear-gradient(135deg,#fff4dd_0%,#eefbff_100%)] p-5">
            <p className="text-[0.74rem] font-medium uppercase tracking-[0.28em] text-[#5f769a]">{labels.quizDone}</p>
            <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-900">
              {quizScore}/{quizQuestions.length}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {locale === "ta"
                ? "இந்த தினசரி தொகுப்பை மீண்டும் செய்து நினைவில் பதியச்செய்யலாம்."
                : locale === "fr"
                  ? "Vous pouvez rejouer cette sélection du jour pour mieux mémoriser."
                  : "You can replay today's selection to strengthen retention."}
            </p>
            <button
              type="button"
              onClick={resetQuiz}
              className="mt-4 rounded-[1.15rem] bg-[#4361ee] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#3651df]"
            >
              {labels.quizRestart}
            </button>
          </div>
        ) : activeQuizQuestion ? (
          <div>
            <div className="flex items-center justify-between gap-4">
              <p className="text-[0.74rem] font-medium uppercase tracking-[0.26em] text-[#5f769a]">
                {labels.quizProgress} {quizIndex + 1}/{quizQuestions.length}
              </p>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#14b8a6_0%,#4361ee_100%)] transition-[width]"
                  style={{ width: `${((quizIndex + (quizAnswered ? 1 : 0)) / quizQuestions.length) * 100}%` }}
                />
              </div>
            </div>

            <div className="mt-4 rounded-[1.7rem] border border-[#e8efff] bg-[linear-gradient(135deg,#fbfcff_0%,#f7fbff_100%)] p-5 shadow-[0_18px_32px_-28px_rgba(67,97,238,0.22)]">
              <p className="text-2xl font-semibold tracking-[-0.05em] text-slate-900">{activeQuizQuestion.prompt}</p>
              {activeQuizQuestion.clue ? (
                <p className="mt-3 text-sm leading-6 text-slate-500">{activeQuizQuestion.clue}</p>
              ) : null}
            </div>

            <div className="mt-4 grid gap-3">
              {activeQuizQuestion.options.map((option) => {
                const isCorrect = option === activeQuizQuestion.answer;
                const isSelected = option === quizSelected;
                const answeredWrong = quizAnswered && isSelected && !isCorrect;
                const answeredRight = quizAnswered && isCorrect;

                return (
                  <button
                    key={`${activeQuizQuestion.slug}-${option}`}
                    type="button"
                    onClick={() => handleQuizAnswer(option)}
                    disabled={quizAnswered}
                    className="rounded-[1.35rem] border px-4 py-4 text-left font-tamil text-xl font-normal shadow-[0_16px_28px_-26px_rgba(15,23,42,0.18)] transition hover:-translate-y-0.5 disabled:cursor-default"
                    style={{
                      borderColor: answeredRight ? "#86efac" : answeredWrong ? "#fca5a5" : "#dbe4ff",
                      backgroundColor: answeredRight ? "#f0fdf4" : answeredWrong ? "#fff1f2" : "#ffffff",
                      color: "#172554",
                    }}
                  >
                    <span className="flex items-center justify-between gap-3">
                      <span>{option}</span>
                      {quizAnswered ? (
                        <span className="font-sans text-sm font-medium" style={{ color: isCorrect ? "#15803d" : isSelected ? "#dc2626" : "#64748b" }}>
                          {isCorrect ? "✓" : isSelected ? "✕" : ""}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>

            {quizAnswered ? (
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div
                  className="rounded-[1.2rem] px-4 py-3 text-sm font-medium"
                  style={{
                    backgroundColor: quizSelected === activeQuizQuestion.answer ? "#f0fdf4" : "#fff1f2",
                    color: quizSelected === activeQuizQuestion.answer ? "#15803d" : "#dc2626",
                  }}
                >
                  {quizSelected === activeQuizQuestion.answer ? labels.quizCorrect : labels.quizWrong}
                </div>
                <button
                  type="button"
                  onClick={goNextQuizQuestion}
                  className="rounded-[1.15rem] bg-[#111827] px-4 py-3 text-sm font-medium text-white transition hover:bg-[#0f172a]"
                >
                  {quizIndex === quizQuestions.length - 1 ? labels.quizFinish : labels.quizNext}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function DictionaryIndex({
  entries,
  locale,
  initialSelectedSlug,
  mode = "full",
  showWordOfDayPanel,
  showQuizPanel,
  showExplorerPanel,
}: {
  entries: DictionaryEntry[];
  locale: Locale;
  initialSelectedSlug?: string | null;
  mode?: "full" | "home-panels" | "explorer-only";
  showWordOfDayPanel?: boolean;
  showQuizPanel?: boolean;
  showExplorerPanel?: boolean;
}) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const labels = copy[locale];
  const [query, setQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState("all");
  const [copied, setCopied] = useState(false);
  const [dailyIndex, setDailyIndex] = useState(0);
  const [visibleEntriesCount, setVisibleEntriesCount] = useState(18);
  const [dayNumber] = useState(() => Math.floor(Date.now() / 86_400_000));
  const [progress, setProgress] = useState<ProgressSnapshot>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [learnedToday, setLearnedToday] = useState<string[]>([]);
  const [didLoadLocalState, setDidLoadLocalState] = useState(false);
  const mobilePanelsRef = useRef<HTMLDivElement | null>(null);
  const [mobilePanelIndex, setMobilePanelIndex] = useState(0);
  const showWordOfDay = showWordOfDayPanel ?? mode !== "explorer-only";
  const showQuiz = showQuizPanel ?? mode !== "explorer-only";
  const showExplorer = showExplorerPanel ?? mode !== "home-panels";
  const panelCount = [showWordOfDay, showQuiz, showExplorer].filter(Boolean).length;
  const desktopGridClass =
    panelCount <= 1
      ? "lg:grid-cols-1"
      : !showExplorer
        ? "lg:grid-cols-[minmax(0,1.06fr)_minmax(0,0.94fr)]"
        : !showWordOfDay || !showQuiz
          ? "lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.9fr)]"
          : "lg:grid-cols-[minmax(0,1.04fr)_minmax(0,0.92fr)_minmax(22rem,0.9fr)]";

  const entryIdBySlug = useMemo(
    () => Object.fromEntries(entries.map((entry) => [entry.slug, entry.id])),
    [entries],
  );

  const letters = useMemo(
    () => Array.from(new Set(entries.map((entry) => getLetter(entry, locale)).filter(Boolean))).sort(),
    [entries, locale],
  );

  const filteredEntries = useMemo(() => {
    const q = query.trim().toLocaleLowerCase();

    return entries.filter((entry) => {
      const primary = getPrimaryWord(entry, locale);
      const tamil = getTamilWord(entry);
      const matchQuery =
        q.length === 0 ||
        primary.toLocaleLowerCase().includes(q) ||
        tamil.toLocaleLowerCase().includes(q) ||
        getTamilSynonyms(entry).some((synonym) => synonym.toLocaleLowerCase().includes(q)) ||
        (entry.type ?? "").toLocaleLowerCase().includes(q) ||
        (entry.example ?? "").toLocaleLowerCase().includes(q);

      const matchLetter = selectedLetter === "all" || getLetter(entry, locale) === selectedLetter;

      return matchQuery && matchLetter;
    });
  }, [entries, locale, query, selectedLetter]);

  const currentEntry = useMemo(() => {
    if (initialSelectedSlug) {
      return entries.find((entry) => entry.slug === initialSelectedSlug) ?? null;
    }

    return filteredEntries[0] ?? null;
  }, [entries, filteredEntries, initialSelectedSlug]);

  const currentIndex = useMemo(
    () => (currentEntry ? entries.findIndex((entry) => entry.slug === currentEntry.slug) : -1),
    [currentEntry, entries],
  );

  const dailyBatch = useMemo(() => {
    if (entries.length === 0) {
      return [];
    }

    const batchSize = 10;
    const batchCount = Math.max(1, Math.ceil(entries.length / batchSize));
    const batchIndex = dayNumber % batchCount;
    const start = batchIndex * batchSize;

    return entries.slice(start, start + batchSize);
  }, [dayNumber, entries]);
  const normalizedDailyIndex = dailyBatch.length === 0 ? 0 : dailyIndex % dailyBatch.length;
  const activeDailyEntry = dailyBatch[normalizedDailyIndex] ?? dailyBatch[0] ?? null;
  const isFiltered = query.trim().length > 0 || selectedLetter !== "all";
  const visibleEntries = filteredEntries.slice(0, visibleEntriesCount);

  useEffect(() => {
    const stored = window.localStorage.getItem(`agarathi-learned-${dayNumber}`);
    const nextProgress = readProgressSnapshot();
    let nextLearnedToday: string[] = [];

    if (!stored) {
      const frameId = window.requestAnimationFrame(() => {
        setProgress(nextProgress);
        setLearnedToday([]);
        setDidLoadLocalState(true);
      });

      return () => window.cancelAnimationFrame(frameId);
    }

    try {
      const parsed = JSON.parse(stored);
      nextLearnedToday = Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : [];
    } catch {
      nextLearnedToday = [];
    }

    const frameId = window.requestAnimationFrame(() => {
      setProgress(nextProgress);
      setLearnedToday(nextLearnedToday);
      setDidLoadLocalState(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [dayNumber]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeout = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  useEffect(() => {
    if (!didLoadLocalState) {
      return;
    }

    persistProgressSnapshot(progress);
  }, [didLoadLocalState, progress]);

  useEffect(() => {
    const client = supabase;

    if (!client) {
      return;
    }

    let isActive = true;

    async function loadRemoteProgress() {
      const {
        data: { user },
      } = await client!.auth.getUser();

      if (!isActive || !user) {
        return;
      }

      setUserId(user.id);

      const { data } = await client!
        .from("dictionary_progress")
        .select("views_count, learned_count, last_seen_day, last_learned_day, dictionary_entries!inner(slug)")
        .eq("user_id", user.id);

      if (!isActive) {
        return;
      }

      const remoteProgress = (data ?? []).reduce<ProgressSnapshot>((accumulator, row) => {
        const relation = Array.isArray(row.dictionary_entries) ? row.dictionary_entries[0] : row.dictionary_entries;
        const slug = relation?.slug;

        if (!slug) {
          return accumulator;
        }

        accumulator[slug] = {
          views: Number(row.views_count ?? 0),
          learned: Number(row.learned_count ?? 0),
          lastSeenDay: row.last_seen_day === null ? null : Number(row.last_seen_day),
          lastLearnedDay: row.last_learned_day === null ? null : Number(row.last_learned_day),
        };

        return accumulator;
      }, {});

      const localProgress = readProgressSnapshot();
      const merged = { ...remoteProgress } as ProgressSnapshot;

      Object.entries(localProgress).forEach(([slug, snapshot]) => {
        const current = merged[slug];

        if (!current) {
          merged[slug] = snapshot;
          return;
        }

        merged[slug] = {
          views: Math.max(current.views, snapshot.views),
          learned: Math.max(current.learned, snapshot.learned),
          lastSeenDay: Math.max(current.lastSeenDay ?? 0, snapshot.lastSeenDay ?? 0) || null,
          lastLearnedDay: Math.max(current.lastLearnedDay ?? 0, snapshot.lastLearnedDay ?? 0) || null,
        };
      });

      setProgress(merged);
      setLearnedToday(
        Object.entries(merged)
          .filter(([, snapshot]) => snapshot.lastLearnedDay === dayNumber)
          .map(([slug]) => slug),
      );

      const payload = Object.entries(merged)
        .map(([slug, snapshot]) => {
          const entryId = entryIdBySlug[slug];

          if (!entryId) {
            return null;
          }

          return {
            user_id: user.id,
            entry_id: entryId,
            views_count: snapshot.views,
            learned_count: snapshot.learned,
            last_seen_day: snapshot.lastSeenDay,
            last_learned_day: snapshot.lastLearnedDay,
            last_seen_at: snapshot.lastSeenDay === null ? null : new Date().toISOString(),
          };
        })
        .filter((value): value is NonNullable<typeof value> => Boolean(value));

      if (payload.length > 0) {
        await client!.from("dictionary_progress").upsert(payload, {
          onConflict: "user_id,entry_id",
        });
      }
    }

    void loadRemoteProgress();

    return () => {
      isActive = false;
    };
  }, [dayNumber, entryIdBySlug, supabase]);

  async function syncProgressToSupabase(slug: string, snapshot: ProgressSnapshot[string]) {
    const client = supabase;

    if (!client || !userId) {
      return;
    }

    const entryId = entryIdBySlug[slug];

    if (!entryId) {
      return;
    }

    await client!.from("dictionary_progress").upsert(
      {
        user_id: userId,
        entry_id: entryId,
        views_count: snapshot.views,
        learned_count: snapshot.learned,
        last_seen_day: snapshot.lastSeenDay,
        last_learned_day: snapshot.lastLearnedDay,
        last_seen_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id,entry_id",
      },
    );
  }

  function openEntry(slug: string) {
    let nextSnapshot: ProgressSnapshot[string] | null = null;

    setProgress((current) => {
      const currentEntry = current[slug] ?? { views: 0, learned: 0, lastSeenDay: null, lastLearnedDay: null };
      nextSnapshot = {
        views: currentEntry.views + 1,
        learned: currentEntry.learned,
        lastSeenDay: dayNumber,
        lastLearnedDay: currentEntry.lastLearnedDay,
      };

      return {
        ...current,
        [slug]: nextSnapshot,
      };
    });

    if (nextSnapshot) {
      void syncProgressToSupabase(slug, nextSnapshot);
    }

    router.push(buildDictionaryHref(locale, slug));
  }

  function goBack() {
    router.push(`/${locale}/agarathi`);
  }

  async function handleCopyLink() {
    if (!currentEntry || typeof window === "undefined") {
      return;
    }

    await navigator.clipboard.writeText(`${window.location.origin}${buildDictionaryHref(locale, currentEntry.slug)}`);
    setCopied(true);
  }

  function goPrev() {
    if (currentIndex > 0) {
      openEntry(entries[currentIndex - 1].slug);
    }
  }

  function goNext() {
    if (currentIndex >= 0 && currentIndex < entries.length - 1) {
      openEntry(entries[currentIndex + 1].slug);
    }
  }

  function goPrevDaily() {
    setDailyIndex((current) => {
      if (dailyBatch.length === 0) {
        return 0;
      }

      return current === 0 ? dailyBatch.length - 1 : current - 1;
    });
  }

  function goNextDaily() {
    setDailyIndex((current) => {
      if (dailyBatch.length === 0) {
        return 0;
      }

      return current === dailyBatch.length - 1 ? 0 : current + 1;
    });
  }

  function markWordAsLearned(slug: string) {
    if (typeof window === "undefined") {
      return;
    }

    setLearnedToday((current) => {
      const next = current.includes(slug) ? current : [...current, slug];
      window.localStorage.setItem(`agarathi-learned-${dayNumber}`, JSON.stringify(next));
      return next;
    });

    let nextSnapshot: ProgressSnapshot[string] | null = null;

    setProgress((current) => {
      const currentEntry = current[slug] ?? {
        views: 0,
        learned: 0,
        lastSeenDay: null,
        lastLearnedDay: null,
      };
      nextSnapshot = {
        views: Math.max(1, currentEntry.views),
        learned: currentEntry.learned + (learnedToday.includes(slug) ? 0 : 1),
        lastSeenDay: dayNumber,
        lastLearnedDay: dayNumber,
      };

      return {
        ...current,
        [slug]: nextSnapshot,
      };
    });

    if (nextSnapshot) {
      void syncProgressToSupabase(slug, nextSnapshot);
    }
  }

  function markCurrentWordAsLearned() {
    if (!activeDailyEntry) {
      return;
    }

    markWordAsLearned(activeDailyEntry.slug);
  }

  function scrollToMobilePanel(index: number) {
    const container = mobilePanelsRef.current;

    if (!container) {
      return;
    }

    const panel = container.children[index] as HTMLElement | undefined;

    if (!panel) {
      return;
    }

    setMobilePanelIndex(index);
    container.scrollTo({
      left: panel.offsetLeft - container.offsetLeft,
      behavior: "smooth",
    });
  }

  function handleMobilePanelsScroll() {
    const container = mobilePanelsRef.current;

    if (!container) {
      return;
    }

    const panelWidth = container.clientWidth * 0.86 + 16;
    const nextIndex = Math.max(0, Math.min(2, Math.round(container.scrollLeft / Math.max(panelWidth, 1))));
    setMobilePanelIndex(nextIndex);
  }

  function getLearningStatus(entry: DictionaryEntry) {
    const snapshot = progress[entry.slug];

    if (!snapshot) {
      return {
        label: labels.statusNew,
        accent: "bg-slate-100 text-slate-500",
      };
    }

    if (snapshot.learned >= 3) {
      return {
        label: labels.statusMastered,
        accent: "bg-emerald-100 text-emerald-700",
      };
    }

    return {
      label: labels.statusSeen,
      accent: "bg-sky-100 text-sky-700",
    };
  }

  if (initialSelectedSlug && currentEntry) {
    const accent = getAccent(currentEntry);
    const primaryWord = getPrimaryWord(currentEntry, locale) || getTamilWord(currentEntry);
    const tamilWord = getTamilWord(currentEntry);
    const tamilDescription = getTamilDescription(currentEntry);

    return (
      <div className="agarathi-theme relative min-h-screen overflow-hidden pb-16">
        <Shapes />
        <div className="relative z-10 mx-auto max-w-[31rem] px-4 pt-6">
          <div className="rounded-[2.25rem] border border-white/70 bg-white/90 p-3 shadow-[0_28px_70px_-38px_rgba(15,23,42,0.28)] backdrop-blur">
            <div className="mb-3 flex items-center justify-between gap-3 rounded-[1.5rem] px-1">
              <button
                type="button"
                onClick={goBack}
                className="inline-flex h-12 w-12 items-center justify-center rounded-[1.15rem] border bg-white text-xl font-medium transition"
                style={{ borderColor: accent.border, color: accent.solid }}
              >
                ←
              </button>
              <div className="min-w-0 flex-1 px-2">
                <p className="text-[0.74rem] font-medium uppercase tracking-[0.32em] text-slate-400">{labels.title}</p>
                <p className="truncate text-2xl font-semibold tracking-[-0.04em] text-slate-900">{primaryWord}</p>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="rounded-[1rem] px-3 py-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] transition"
                style={{ backgroundColor: accent.soft, color: accent.solid }}
              >
                {copied ? labels.copied : labels.copyLink}
              </button>
            </div>

            <div className="overflow-hidden rounded-[2rem] border bg-white" style={{ borderColor: accent.border, boxShadow: `0 34px 64px -42px ${accent.glow}` }}>
              <div className="relative" style={{ backgroundColor: accent.soft }}>
                {currentEntry.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={currentEntry.imageUrl} alt={primaryWord} className="h-[17rem] w-full object-cover" />
                ) : (
                  <div className="flex h-[17rem] items-center justify-center text-8xl font-medium" style={{ color: accent.solid }}>
                    {getLetter(currentEntry, locale)}
                  </div>
                )}

                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white via-white/65 to-transparent" />

                <div
                  className="absolute bottom-4 right-4 flex h-16 w-16 items-center justify-center rounded-[1.35rem] border-4 border-white text-2xl font-semibold text-white"
                  style={{ backgroundColor: accent.solid }}
                >
                  {getLetter(currentEntry, locale)}
                </div>
              </div>

              <div className="space-y-5 px-5 pb-6 pt-3">
                <div>
                  <p className="text-[0.72rem] font-medium uppercase tracking-[0.3em]" style={{ color: accent.solid }}>
                    {labels.wordOfDay}
                  </p>
                  <h1 className="mt-2 text-[clamp(2.9rem,10vw,4.25rem)] font-semibold leading-[0.92] tracking-[-0.065em] text-slate-900">
                    {primaryWord}
                  </h1>
                  {locale !== "ta" && tamilWord ? (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="font-tamil text-[1.9rem] font-normal leading-none text-slate-800">{tamilWord}</span>
                      <span
                        className="rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.2em]"
                        style={{ backgroundColor: accent.soft, color: accent.solid }}
                      >
                        {labels.translation}
                      </span>
                    </div>
                  ) : null}
                  {getTamilSynonyms(currentEntry).length > 0 ? (
                    <div className="mt-3">
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em]" style={{ color: accent.solid }}>
                        {labels.synonyms}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {getTamilSynonyms(currentEntry).map((synonym) => (
                          <span
                            key={synonym}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 font-tamil text-[0.95rem] font-normal text-slate-700"
                          >
                            {synonym}
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="rounded-[1.7rem] p-5" style={{ backgroundColor: accent.soft }}>
                  <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em]" style={{ color: accent.solid }}>
                    {labels.description}
                  </p>
                  <p className="mt-3 font-tamil text-[1.08rem] font-normal leading-8 text-slate-700">{tamilDescription || "—"}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentEntry.type ? (
                    <span className="rounded-full border border-slate-200 px-4 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-slate-500">
                      {labels.type}: {currentEntry.type}
                    </span>
                  ) : null}
                </div>

                {getExample(currentEntry) ? (
                  <div className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4 text-sm text-slate-600">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.22em]" style={{ color: accent.solid }}>
                      {labels.example}
                    </p>
                    <p className="mt-2 leading-7">{getExample(currentEntry)}</p>
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={goPrev}
                    disabled={currentIndex <= 0}
                    className="rounded-[1.35rem] border border-slate-200 px-4 py-4 text-sm font-medium text-slate-500 transition disabled:opacity-40"
                  >
                    ← {labels.previous}
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={currentIndex >= entries.length - 1}
                    className="rounded-[1.35rem] px-4 py-4 text-sm font-medium text-white transition disabled:opacity-40"
                    style={{ backgroundColor: accent.solid }}
                  >
                    {labels.next} →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="agarathi-theme relative min-h-screen overflow-hidden pb-20">
      <Shapes />
      <div className="relative z-10 mx-auto max-w-[96rem] px-4 pt-6 lg:px-6">
        <div className="rounded-[2.3rem] border border-white/70 bg-white/90 p-4 shadow-[0_30px_80px_-42px_rgba(15,23,42,0.26)] backdrop-blur lg:p-5">
          {panelCount > 1 ? (
            <div className="mb-3 flex items-center justify-between px-1 text-[0.68rem] uppercase tracking-[0.22em] text-slate-400 lg:hidden">
              {showWordOfDay ? <span>◉ {labels.wordOfDay}</span> : null}
              {showQuiz ? <span>✦ {labels.quizTitle}</span> : null}
              {showExplorer ? <span>⌕ {labels.words}</span> : null}
            </div>
          ) : null}
          <div
            ref={mobilePanelsRef}
            onScroll={handleMobilePanelsScroll}
            className={`-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:min-h-[52rem] lg:grid lg:items-stretch lg:overflow-visible lg:px-0 lg:pb-0 ${desktopGridClass}`}
          >
            {showWordOfDay ? <div className="min-w-[86vw] snap-center lg:min-w-0 lg:h-full">
              <div className="overflow-hidden rounded-[2rem] bg-[linear-gradient(145deg,#ff8f6c_0%,#ffb661_58%,#ffc977_100%)] p-5 text-white shadow-[0_28px_55px_-32px_rgba(255,165,92,0.34)] lg:h-full">
            <div className="relative flex items-start justify-between gap-4">
              <div className="relative z-10">
                <p className="text-[0.74rem] font-medium uppercase tracking-[0.3em] text-white/78">
                  {labels.wordOfDay}
                </p>
              </div>
              <div className="absolute -right-7 -top-7 h-28 w-28 rounded-full bg-white/18 blur-2xl" />
            </div>

            {activeDailyEntry ? (
              <div className="mt-5 rounded-[1.8rem] border border-white/22 bg-[linear-gradient(145deg,rgba(255,244,232,0.14)_0%,rgba(255,240,214,0.1)_100%)] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-white/76">
                    {locale === "ta" ? "தொகுப்பு" : locale === "fr" ? "Sélection" : "Deck"} {normalizedDailyIndex + 1}/{dailyBatch.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={goPrevDaily}
                      className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[rgba(255,244,232,0.22)] text-lg text-white transition hover:bg-[rgba(255,244,232,0.3)]"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      onClick={goNextDaily}
                      className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[rgba(255,244,232,0.22)] text-lg text-white transition hover:bg-[rgba(255,244,232,0.3)]"
                    >
                      →
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="mb-2 flex items-center justify-between text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/80">
                    <span>
                      {locale === "ta"
                        ? `இன்று கற்றவை ${learnedToday.length}/${dailyBatch.length}`
                        : locale === "fr"
                          ? `Appris aujourd'hui ${learnedToday.length}/${dailyBatch.length}`
                          : `Learned today ${learnedToday.length}/${dailyBatch.length}`}
                    </span>
                    <span>
                      {locale === "ta"
                        ? `${Math.round((learnedToday.length / Math.max(dailyBatch.length, 1)) * 100)}% முடிந்தது`
                        : locale === "fr"
                          ? `${Math.round((learnedToday.length / Math.max(dailyBatch.length, 1)) * 100)}% complété`
                          : `${Math.round((learnedToday.length / Math.max(dailyBatch.length, 1)) * 100)}% complete`}
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[rgba(255,244,232,0.24)]">
                    <div
                      className="h-full rounded-full bg-white transition-[width]"
                      style={{ width: `${(learnedToday.length / Math.max(dailyBatch.length, 1)) * 100}%` }}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => openEntry(activeDailyEntry.slug)}
                  className="flex w-full items-center gap-3 rounded-[1.6rem] border border-white/14 bg-[linear-gradient(145deg,rgba(255,246,236,0.18)_0%,rgba(255,239,220,0.1)_100%)] p-3 text-left shadow-[0_14px_26px_-20px_rgba(124,45,18,0.3)] transition hover:bg-[linear-gradient(145deg,rgba(255,246,236,0.24)_0%,rgba(255,239,220,0.14)_100%)]"
                >
                  <WordThumbnail
                    entry={activeDailyEntry}
                    locale={locale}
                    accent={{ solid: "#ffffff", soft: "rgba(255,255,255,0.2)", border: "transparent", glow: "transparent" }}
                    className="h-16 w-16 shrink-0 bg-[rgba(255,246,236,0.2)]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.68rem] font-medium uppercase tracking-[0.28em] text-white/76">{labels.wordOfDay}</p>
                    <p className="mt-1 truncate text-[2rem] font-semibold tracking-[-0.05em] text-white">
                      {getPrimaryWord(activeDailyEntry, locale) || getTamilWord(activeDailyEntry)}
                    </p>
                    {locale !== "ta" && getTamilWord(activeDailyEntry) ? (
                      <p className="mt-1 truncate font-tamil text-lg font-normal text-white/90">{getTamilWord(activeDailyEntry)}</p>
                    ) : null}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {learnedToday.includes(activeDailyEntry.slug) ? (
                        <span className="rounded-full bg-emerald-500/28 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white">
                          {locale === "ta" ? "இன்று கற்றது" : locale === "fr" ? "Appris aujourd'hui" : "Learned today"}
                        </span>
                      ) : null}
                      <span
                        className={`rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] ${
                          getLearningStatus(activeDailyEntry).accent
                        }`}
                      >
                        {getLearningStatus(activeDailyEntry).label}
                      </span>
                      {activeDailyEntry.type ? (
                        <span className="rounded-full bg-[rgba(255,246,236,0.14)] px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-white">
                          {activeDailyEntry.type}
                        </span>
                      ) : null}
                      {getTamilSynonyms(activeDailyEntry).slice(0, 2).map((synonym) => (
                        <span
                          key={synonym}
                          className="rounded-full bg-[rgba(255,246,236,0.14)] px-3 py-1 text-[0.68rem] font-medium text-white"
                        >
                          {synonym}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-white/18 text-xl text-white">→</div>
                </button>

                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={markCurrentWordAsLearned}
                    disabled={learnedToday.includes(activeDailyEntry.slug)}
                    className="flex-1 rounded-[1.15rem] bg-[rgba(255,248,240,0.82)] px-4 py-3 text-sm font-medium shadow-[0_14px_28px_-22px_rgba(124,45,18,0.28)] transition disabled:opacity-70"
                    style={{ color: "#ff7a59" }}
                  >
                    {learnedToday.includes(activeDailyEntry.slug)
                      ? locale === "ta"
                        ? "இன்றைக்கு நினைவில் வைத்துவிட்டீர்கள்"
                        : locale === "fr"
                          ? "Déjà révisé aujourd'hui"
                          : "Already reviewed today"
                      : locale === "ta"
                        ? "கற்றதாக குறிக்கவும்"
                        : locale === "fr"
                          ? "Marquer comme appris"
                          : "Mark as learned"}
                  </button>
                  <button
                    type="button"
                    onClick={() => openEntry(activeDailyEntry.slug)}
                    className="rounded-[1.15rem] border border-white/28 bg-[rgba(255,246,236,0.08)] px-4 py-3 text-sm font-medium text-white transition hover:bg-[rgba(255,246,236,0.14)]"
                  >
                    {locale === "ta" ? "முழு அட்டை" : locale === "fr" ? "Fiche complète" : "Full card"}
                  </button>
                </div>
              </div>
            ) : null}
              </div>
            </div> : null}

            {showQuiz ? <div className="min-w-[86vw] snap-center lg:min-w-0 lg:h-full">
              <DailyQuiz
                key={`${dayNumber}-${dailyBatch.map((entry) => entry.slug).join("-")}`}
                dailyBatch={dailyBatch}
                locale={locale}
                dayNumber={dayNumber}
                labels={labels}
                onLearn={markWordAsLearned}
              />
            </div> : null}

            {showExplorer ? <div className="min-w-[86vw] snap-center lg:min-w-0 lg:h-full">
              <div className="flex h-full flex-col rounded-[1.9rem] border border-slate-100 bg-[#fcfdff] p-4 shadow-[0_20px_48px_-38px_rgba(15,23,42,0.28)] lg:h-full">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 xl:grid-cols-2 xl:gap-2">
                  <StatCard label={labels.words} value={entries.length} accent={accents[0]} />
                  <StatCard label={labels.letters} value={letters.length} accent={accents[2]} />
                </div>

                <div className="mt-4 flex items-center gap-3 rounded-[1.15rem] border border-slate-200 bg-white px-4 py-3">
                  <span className="text-lg text-slate-400">⌕</span>
                  <input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setVisibleEntriesCount(18);
                    }}
                    placeholder={labels.searchPlaceholder}
                    className="w-full bg-transparent text-sm font-normal text-slate-900 outline-none placeholder:text-slate-400"
                  />
                  {query ? (
                    <button type="button" onClick={() => {
                        setQuery("");
                        setVisibleEntriesCount(18);
                      }} className="text-lg text-slate-400 transition hover:text-slate-700">
                      ×
                    </button>
                  ) : null}
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLetter("all");
                      setVisibleEntriesCount(18);
                    }}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                      selectedLetter === "all" ? "bg-[#4361ee] text-white" : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {labels.allLetters}
                  </button>
                  {letters.map((letter, index) => {
                    const accent = accents[index % accents.length];
                    const active = selectedLetter === letter;

                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => {
                          setSelectedLetter(active ? "all" : letter);
                          setVisibleEntriesCount(18);
                        }}
                        className="shrink-0 rounded-full border px-4 py-2 text-sm font-medium shadow-[0_12px_24px_-22px_rgba(15,23,42,0.28)] transition"
                        style={{
                          backgroundColor: active ? accent.solid : accent.soft,
                          borderColor: active ? accent.solid : accent.border,
                          color: active ? "#ffffff" : accent.solid,
                        }}
                      >
                        {letter}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-4 rounded-[1.25rem] border border-slate-100 bg-white px-4 py-3 text-sm leading-6 text-slate-500">
                  {labels.browseHint}
                </p>

                <div className="mt-4 flex min-h-0 flex-1 flex-col rounded-[1.4rem] border border-slate-100 bg-white p-3 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.2)]">
                  <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <div>
                      <p className="text-[0.68rem] font-medium uppercase tracking-[0.24em] text-slate-400">{labels.results}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {labels.shown} {Math.min(visibleEntries.length, filteredEntries.length)}/{filteredEntries.length}
                      </p>
                    </div>
                    {filteredEntries.length > visibleEntries.length ? (
                      <button
                        type="button"
                        onClick={() => setVisibleEntriesCount((current) => current + 24)}
                        className="rounded-full bg-[#eef2ff] px-3 py-2 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-[#4361ee] transition hover:bg-[#dfe7ff]"
                      >
                        {labels.loadMore}
                      </button>
                    ) : null}
                  </div>

                  {filteredEntries.length === 0 ? (
                    <div className="rounded-[1.2rem] border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-500">
                      {isFiltered ? labels.emptyFiltered : labels.empty}
                    </div>
                  ) : (
                    <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                      {visibleEntries.map((entry) => {
                        const accent = getAccent(entry);
                        const primaryWord = getPrimaryWord(entry, locale) || getTamilWord(entry);
                        const tamilWord = getTamilWord(entry);
                        const learningStatus = getLearningStatus(entry);
                        const secondaryLine =
                          locale !== "ta" && tamilWord ? tamilWord : entry.type || getTamilDescription(entry);

                        return (
                          <button
                            key={`compact-${entry.id}`}
                            type="button"
                            onClick={() => openEntry(entry.slug)}
                            className="group grid w-full grid-cols-[2.75rem_minmax(0,1fr)_2.4rem] items-center gap-3 rounded-[1.1rem] border border-slate-100 bg-white px-3 py-2.5 text-left transition hover:border-slate-200 hover:bg-slate-50"
                          >
                            <WordThumbnail
                              entry={entry}
                              locale={locale}
                              accent={accent}
                              className="h-11 w-11 shrink-0 rounded-[0.95rem]"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <p className="truncate text-[0.98rem] font-medium text-slate-900">{primaryWord}</p>
                                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.58rem] font-medium uppercase tracking-[0.14em] ${learningStatus.accent}`}>
                                  {learningStatus.label}
                                </span>
                              </div>
                              {secondaryLine ? (
                                <p className="mt-0.5 truncate font-tamil text-[0.84rem] font-normal text-slate-500">
                                  {secondaryLine}
                                </p>
                              ) : null}
                            </div>
                            <div
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[0.9rem] text-base font-medium transition group-hover:translate-x-0.5"
                              style={{ backgroundColor: accent.soft, color: accent.solid }}
                            >
                              -&gt;
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div> : null}
          </div>
          {panelCount > 1 ? <div className="mt-3 flex items-center justify-center gap-2 lg:hidden">
            {Array.from({ length: panelCount }, (_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToMobilePanel(index)}
                aria-label={`panel-${index + 1}`}
                className="transition"
              >
                <span
                  className={`block rounded-full ${
                    mobilePanelIndex === index
                      ? "h-2.5 w-8 bg-[linear-gradient(90deg,#14b8a6_0%,#4361ee_100%)]"
                      : "h-2.5 w-2.5 bg-slate-300"
                  }`}
                />
              </button>
            ))}
          </div> : null}

          {showExplorer ? <div className="mt-4 lg:hidden">
            {entries.length === 0 ? (
              <div className="rounded-[1.9rem] border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
                {labels.empty}
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="rounded-[1.9rem] border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-500">
                {isFiltered ? labels.emptyFiltered : labels.empty}
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                {visibleEntries.map((entry) => {
                  const accent = getAccent(entry);
                  const primaryWord = getPrimaryWord(entry, locale) || getTamilWord(entry);
                  const tamilWord = getTamilWord(entry);
                  const learningStatus = getLearningStatus(entry);

                  return (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => openEntry(entry.slug)}
                      className="group w-full overflow-hidden rounded-[2rem] border bg-white text-left shadow-[0_24px_56px_-38px_rgba(15,23,42,0.24)] transition hover:-translate-y-0.5"
                      style={{ borderColor: accent.border }}
                    >
                      <div className="border-b p-4" style={{ borderColor: accent.border, background: `linear-gradient(135deg, ${accent.soft} 0%, #ffffff 140%)` }}>
                        <div className="flex items-start gap-4">
                          <WordThumbnail
                            entry={entry}
                            locale={locale}
                            accent={accent}
                            className="h-[4.6rem] w-[4.6rem] shrink-0 shadow-[0_18px_30px_-24px_rgba(15,23,42,0.3)]"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <p className="text-[0.68rem] font-medium uppercase tracking-[0.26em]" style={{ color: accent.solid }}>
                                  {entry.type ?? labels.title}
                                </p>
                                <p className="mt-1 truncate text-[1.75rem] font-semibold leading-none tracking-[-0.05em] text-slate-900">
                                  {primaryWord}
                                </p>
                                {locale !== "ta" && tamilWord ? (
                                  <p className="mt-2 truncate font-tamil text-lg font-normal text-slate-600">{tamilWord}</p>
                                ) : null}
                                {getTamilSynonyms(entry).length > 0 ? (
                                  <p className="mt-2 truncate font-tamil text-sm font-normal text-slate-500">
                                    {getTamilSynonyms(entry).join(" • ")}
                                  </p>
                                ) : null}
                              </div>
                              <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] text-xl font-medium transition group-hover:translate-x-0.5"
                                style={{ backgroundColor: "#fff", color: accent.solid }}
                              >
                                →
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 px-4 py-4">
                        <span className={`rounded-full px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] ${learningStatus.accent}`}>
                          {learningStatus.label}
                        </span>
                        {entry.type ? (
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.18em] text-slate-500">
                            {entry.type}
                          </span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div> : null}
        </div>
      </div>
    </div>
  );
}

