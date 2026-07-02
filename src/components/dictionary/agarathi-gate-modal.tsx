"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";

import { buildDailyDictionaryDeck, getLocalDateKey, markAgarathiDailyQuizComplete } from "@/lib/agarathi-daily";
import type { DictionaryEntry, Locale } from "@/types";

function getPrimaryWord(entry: DictionaryEntry, locale: Locale) {
  return locale === "ta" ? entry.translations.ta?.word ?? "" : entry.translations[locale]?.word ?? "";
}

function getQuizPrompt(entry: DictionaryEntry, locale: Locale) {
  if (locale === "ta") {
    return "";
  }

  return entry.translations[locale]?.word ?? entry.translations.en?.word ?? entry.slug;
}

function getTamilWord(entry: DictionaryEntry) {
  return entry.translations.ta?.word ?? "";
}

function getTamilDescription(entry: DictionaryEntry) {
  return entry.translations.ta?.description ?? "";
}

function iconProps(className: string) {
  return {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    viewBox: "0 0 24 24",
    "aria-hidden": true,
  };
}

function ArrowLeftIcon({ className }: { className: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function CardIcon({ className }: { className: string }) {
  return (
    <svg {...iconProps(className)}>
      <rect width="18" height="14" x="3" y="5" rx="3" />
      <path d="M7 10h10" />
      <path d="M7 14h6" />
    </svg>
  );
}

function AgarathiOpenIcon({ className }: { className: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H7a3 3 0 0 0-3 3V5.5Z" />
      <path d="M7 18V3" />
      <path d="M11 8h5" />
      <path d="m14 11 3 3-3 3" />
      <path d="M9 14h8" />
    </svg>
  );
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

function buildRandomOrder<T>(items: T[]) {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }

  return result;
}

const copy = {
  en: {
    eyebrow: "Today's words",
    learned: "Learned today",
    seen: "Seen",
    reviewed: "Already reviewed today",
    fullCard: "Full card",
    nextWord: "Next word",
    previous: "Previous",
    next: "Next",
    quiz: "Daily quiz",
    question: "Question",
    score: "Score",
    correct: "Correct answer",
    wrong: "Try again",
    nextQuestion: "Next question",
    showScore: "Show score",
    finish: "Open Agarathi",
    close: "Close",
  },
  fr: {
    eyebrow: "Mots du jour",
    learned: "Appris aujourd'hui",
    seen: "Vu",
    reviewed: "Déjà révisé aujourd'hui",
    fullCard: "Fiche complète",
    nextWord: "Mot suivant",
    previous: "Précédent",
    next: "Suivant",
    quiz: "Quiz du jour",
    question: "Question",
    score: "Score",
    correct: "Bonne réponse",
    wrong: "Essayez encore",
    nextQuestion: "Question suivante",
    showScore: "Voir le score",
    finish: "Ouvrir Agarathi",
    close: "Fermer",
  },
  ta: {
    eyebrow: "இன்றைய சொற்கள்",
    learned: "இன்று கற்றது",
    seen: "பார்த்தது",
    reviewed: "இன்று ஏற்கனவே பார்த்தது",
    fullCard: "முழு அட்டை",
    nextWord: "அடுத்த சொல்",
    previous: "முந்தையது",
    next: "அடுத்தது",
    quiz: "இன்றைய வினாடி வினா",
    question: "கேள்வி",
    score: "மதிப்பெண்",
    correct: "சரியான பதில்",
    wrong: "மீண்டும் முயற்சி",
    nextQuestion: "அடுத்த கேள்வி",
    showScore: "மதிப்பெண் பார்",
    finish: "அகராதி திற",
    close: "மூடு",
  },
} satisfies Record<Locale, Record<string, string>>;

export function AgarathiGateModal({
  entries,
  locale,
  open,
  onClose,
}: {
  entries: DictionaryEntry[];
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const labels = copy[locale];
  const [wordIndex, setWordIndex] = useState(0);
  const [seenSlugs, setSeenSlugs] = useState<string[]>([]);
  const [quizIndex, setQuizIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const answerAdvanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dailyDateKey = useMemo(() => getLocalDateKey(), []);
  const deck = useMemo(() => buildDailyDictionaryDeck(entries, dailyDateKey), [entries, dailyDateKey]);
  const activeEntry = deck[wordIndex] ?? deck[0] ?? null;
  const seenCount = deck.filter((entry) => seenSlugs.includes(entry.slug)).length;
  const showQuiz = deck.length > 0 && seenCount >= deck.length;
  const quizOptions = useMemo(() => {
    if (!showQuiz) {
      return [];
    }

    const answers = Array.from(new Set(deck.map((entry) => getTamilWord(entry)).filter(Boolean)));

    const questions = deck.map((entry, index) => {
      const answer = getTamilWord(entry);
      const distractors = answers.filter((item) => item !== answer);
      return {
        entry,
        answer,
        prompt: getQuizPrompt(entry, locale),
        clue: getTamilDescription(entry),
        options: buildSeededOrder([answer, ...buildSeededOrder(distractors, index + 77).slice(0, 3)], index + 171),
      };
    });

    return buildRandomOrder(questions);
  }, [deck, locale, showQuiz]);
  const activeQuestion = quizOptions[quizIndex] ?? null;

  useEffect(() => {
    return () => {
      if (answerAdvanceTimer.current) {
        clearTimeout(answerAdvanceTimer.current);
      }
    };
  }, []);

  if (!open || deck.length === 0 || typeof document === "undefined") {
    return null;
  }

  function markSeen(slug: string) {
    setSeenSlugs((current) => (current.includes(slug) ? current : [...current, slug]));
  }

  function goNextWord() {
    if (!activeEntry) {
      return;
    }

    markSeen(activeEntry.slug);
    setWordIndex((current) => Math.min(current + 1, deck.length - 1));
  }

  function openAgarathi(path = `/${locale}/agarathi`) {
    onClose();
    router.push(path);
  }

  function handleAnswer(option: string) {
    if (!activeQuestion || answered) {
      return;
    }

    if (answerAdvanceTimer.current) {
      clearTimeout(answerAdvanceTimer.current);
    }

    setSelectedAnswer(option);
    setAnswered(true);

    if (option === activeQuestion.answer) {
      setScore((current) => current + 1);
    }

    answerAdvanceTimer.current = setTimeout(() => {
      goNextQuestion();
      answerAdvanceTimer.current = null;
    }, 550);
  }

  function goNextQuestion() {
    if (quizIndex >= quizOptions.length - 1) {
      markAgarathiDailyQuizComplete(dailyDateKey);
      setQuizFinished(true);
      return;
    }

    setQuizIndex((current) => current + 1);
    setSelectedAnswer(null);
    setAnswered(false);
  }

  const modal = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto bg-[#11151a]/35 px-4 py-8 backdrop-blur-[2px]">
      <div className="w-full max-w-[560px] animate-[rise_0.5s_cubic-bezier(.2,.8,.2,1)]">
        <div className="overflow-hidden rounded-[32px] bg-[#fbf3e6] text-[#1c2321] shadow-[0_28px_70px_-14px_rgba(0,0,0,0.55),inset_0_2px_0_rgba(255,255,255,0.4)]">
          <div className="relative flex items-center justify-center px-7 pt-7">
            <p className="font-mono text-sm font-semibold uppercase tracking-[0.16em] text-[#154b44]">
              {showQuiz ? labels.quiz : labels.eyebrow}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="absolute right-6 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-[#1c2321]/[0.06] text-sm transition hover:bg-[#1c2321]/[0.12]"
              aria-label={labels.close}
            >
              x
            </button>
          </div>

          <div className="flex items-center justify-center px-7 py-5">
            <div className="flex gap-[5px]">
              {deck.map((entry, index) => (
                <span
                  key={entry.slug}
                  className={`h-1.5 rounded-full ${index <= wordIndex || seenSlugs.includes(entry.slug) ? "w-4 bg-[#1f6f64]" : "w-1.5 bg-[#c9b693]"}`}
                />
              ))}
            </div>
          </div>

          <div className="relative border-t-2 border-dashed border-[#c9b693] before:absolute before:-left-[11px] before:-top-[11px] before:h-[22px] before:w-[22px] before:rounded-full before:bg-[#11151a] after:absolute after:-right-[11px] after:-top-[11px] after:h-[22px] after:w-[22px] after:rounded-full after:bg-[#11151a]" />

          {!showQuiz && activeEntry ? (
            <>
              <div className="relative bg-[linear-gradient(180deg,#fbf3e6_0%,#f4e9d8_100%)] px-8 py-8">
                <h2 className="max-w-[85%] font-serif text-[46px] font-semibold leading-[1.05] text-[#1c2321]">
                  {getPrimaryWord(activeEntry, locale) || getTamilWord(activeEntry)}
                </h2>
                {locale !== "ta" && getTamilWord(activeEntry) ? (
                  <p className="mt-2 font-serif text-2xl font-medium text-[#154b44]">{getTamilWord(activeEntry)}</p>
                ) : null}
                <div className="mt-6 flex flex-wrap gap-3">
                  {activeEntry.type ? (
                    <span className="inline-flex items-center rounded-full border border-[#1f6f64]/20 bg-[#1f6f64]/[0.12] px-4 py-2 text-[#154b44]">
                      <span className="font-tamil text-sm font-semibold">{activeEntry.type}</span>
                    </span>
                  ) : null}
                  {activeEntry.tamilSynonyms.map((synonym) => (
                    <span key={synonym} className="inline-flex items-center rounded-full border border-[#b97832]/20 bg-[#b97832]/[0.13] px-4 py-2 text-[#75481f]">
                      <span className="font-tamil text-sm font-semibold">{synonym}</span>
                    </span>
                  ))}
                </div>
              </div>

              <div className="relative border-t-2 border-dashed border-[#c9b693]" />

              <div className="bg-[#fbf3e6] px-8 pb-7 pt-6">
                <div className="grid grid-cols-3 gap-3">
                  {wordIndex > 0 ? (
                    <button
                      type="button"
                      onClick={() => setWordIndex((current) => Math.max(0, current - 1))}
                      className="flex h-14 items-center justify-center rounded-[16px] bg-[#1c2321]/[0.06] text-[#1c2321] transition hover:bg-[#1c2321]/[0.1]"
                      aria-label={labels.previous}
                    >
                      <ArrowLeftIcon className="h-5 w-5" />
                      <span className="sr-only">{labels.previous}</span>
                    </button>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  <button
                    type="button"
                    onClick={() => openAgarathi(`/${locale}/agarathi/${activeEntry.slug}`)}
                    className="flex h-14 items-center justify-center rounded-[16px] bg-[#1c2321]/[0.06] text-[#1c2321] transition hover:bg-[#1c2321]/[0.1]"
                    aria-label={labels.fullCard}
                  >
                    <CardIcon className="h-5 w-5" />
                    <span className="sr-only">{labels.fullCard}</span>
                  </button>
                  <button
                    type="button"
                    onClick={goNextWord}
                    className="flex h-14 items-center justify-center rounded-[16px] bg-[#1f6f64] text-white shadow-[0_8px_18px_-6px_rgba(31,111,100,0.6)] transition hover:brightness-105"
                    aria-label={labels.nextWord}
                  >
                    <ArrowRightIcon className="h-5 w-5" />
                    <span className="sr-only">{labels.nextWord}</span>
                  </button>
                </div>
              </div>
            </>
          ) : quizFinished ? (
            <div className="bg-[linear-gradient(180deg,#fbf3e6_0%,#f4e9d8_100%)] px-8 py-10 text-center">
              <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#154b44]">{labels.score}</p>
              <p className="mt-4 font-serif text-[56px] font-semibold leading-none text-[#1c2321]">
                {score}/{quizOptions.length}
              </p>
              <button
                type="button"
                onClick={() => openAgarathi()}
                className="mx-auto mt-8 flex h-16 w-16 items-center justify-center rounded-[22px] bg-[#1f6f64] text-white shadow-[0_12px_26px_-10px_rgba(31,111,100,0.8)] transition hover:-translate-y-0.5 hover:brightness-105"
                aria-label={labels.finish}
              >
                <AgarathiOpenIcon className="h-7 w-7" />
                <span className="sr-only">{labels.finish}</span>
              </button>
            </div>
          ) : activeQuestion ? (
            <div className="bg-[linear-gradient(180deg,#fbf3e6_0%,#f4e9d8_100%)] px-8 py-8">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#154b44]">
                  {labels.question} {quizIndex + 1}/{quizOptions.length}
                </p>
              </div>
              {activeQuestion.prompt ? <h2 className="font-serif text-3xl font-semibold text-[#1c2321]">{activeQuestion.prompt}</h2> : null}
              {activeQuestion.clue ? (
                <p className={`${activeQuestion.prompt ? "mt-2 text-sm" : "text-lg"} font-tamil leading-7 text-[#4f463c]`}>
                  {activeQuestion.clue}
                </p>
              ) : null}
              <div className="mt-5 grid gap-2.5">
                {activeQuestion.options.map((option) => {
                  const isSelected = option === selectedAnswer;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => handleAnswer(option)}
                      disabled={answered}
                      className="rounded-[14px] border px-4 py-3 text-left font-tamil text-lg font-semibold transition disabled:cursor-default"
                      style={{
                        borderColor: isSelected ? "#1f6f64" : "#dccba9",
                        backgroundColor: isSelected ? "rgba(31,111,100,0.12)" : "#fbf3e6",
                        color: "#1c2321",
                      }}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
