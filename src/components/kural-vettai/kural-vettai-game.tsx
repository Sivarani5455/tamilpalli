"use client";

import { useEffect, useMemo, useState } from "react";

import type { Locale } from "@/types";

export type KuralVettaiRound = {
  id: string;
  number: number;
  section: string;
  chapter: string;
  lines: string[];
};

type Phase = "intro" | "memorize" | "reconstruct" | "feedback" | "complete";

type WordToken = {
  id: string;
  originalIndex: number;
  word: string;
};

const PHASE_DURATION = {
  memorize: 30,
  reconstruct: 30,
} as const;

const copy = {
  en: {
    eyebrow: "Nimisham · Memory game",
    title: "Kural Vettai",
    subtitle: "Hunt down the right order before time runs out.",
    start: "Start the hunt",
    replay: "Play again",
    unavailable: "At least 10 active kurals are required to start this game.",
    rules: ["Memorize the kural for 30 seconds", "Rebuild it within 30 seconds", "Complete 10 different kurals"],
    round: "Kural",
    score: "Score",
    memorize: "Memorize every word",
    memorizeHint: "The kural will disappear when the timer reaches zero.",
    reconstruct: "Rebuild the kural",
    reconstructHint: "Tap the words in the correct order.",
    selection: "Your reconstruction",
    validate: "Validate",
    reset: "Clear",
    retry: "That is not the right order yet. Try again!",
    correct: "Perfect reconstruction!",
    timeout: "Time is up!",
    next: "Next kural",
    results: "Hunt completed!",
    resultMessage: "You reconstructed {score} out of 10 kurals.",
    seconds: "seconds",
  },
  fr: {
    eyebrow: "Nimisham · Jeu de mémoire",
    title: "Kural Vettai",
    subtitle: "Retrouvez le bon ordre avant la fin du chrono.",
    start: "Commencer la chasse",
    replay: "Rejouer",
    unavailable: "Au moins 10 kurals actifs sont nécessaires pour démarrer ce jeu.",
    rules: ["Mémorisez le kural pendant 30 secondes", "Reconstituez-le en moins de 30 secondes", "Terminez une série de 10 kurals différents"],
    round: "Kural",
    score: "Score",
    memorize: "Mémorisez chaque mot",
    memorizeHint: "Le kural disparaîtra lorsque le chrono arrivera à zéro.",
    reconstruct: "Reconstituez le kural",
    reconstructHint: "Touchez les mots dans le bon ordre.",
    selection: "Votre reconstruction",
    validate: "Valider",
    reset: "Effacer",
    retry: "Ce n’est pas encore le bon ordre. Réessayez !",
    correct: "Reconstitution parfaite !",
    timeout: "Temps écoulé !",
    next: "Kural suivant",
    results: "Chasse terminée !",
    resultMessage: "Vous avez reconstitué {score} kurals sur 10.",
    seconds: "secondes",
  },
  ta: {
    eyebrow: "நிமிஷம் · நினைவாற்றல் விளையாட்டு",
    title: "குறள் வேட்டை",
    subtitle: "நேரம் முடிவதற்குள் சொற்களைச் சரியான வரிசையில் அமைக்கவும்.",
    start: "வேட்டையைத் தொடங்கு",
    replay: "மீண்டும் விளையாடு",
    unavailable: "இந்த விளையாட்டைத் தொடங்க குறைந்தது 10 செயலில் உள்ள குறள்கள் தேவை.",
    rules: ["30 விநாடிகள் குறளை மனப்பாடம் செய்யுங்கள்", "30 விநாடிகளில் குறளை மீண்டும் அமைக்கவும்", "10 வெவ்வேறு குறள்களை முடிக்கவும்"],
    round: "குறள்",
    score: "மதிப்பெண்",
    memorize: "ஒவ்வொரு சொல்லையும் நினைவில் கொள்ளுங்கள்",
    memorizeHint: "நேரம் முடிந்ததும் குறள் மறைந்துவிடும்.",
    reconstruct: "குறளை மீண்டும் அமைக்கவும்",
    reconstructHint: "சொற்களைச் சரியான வரிசையில் தொடவும்.",
    selection: "உங்கள் குறள்",
    validate: "சரிபார்",
    reset: "அழி",
    retry: "சொற்களின் வரிசை இன்னும் சரியாக இல்லை. மீண்டும் முயலுங்கள்!",
    correct: "மிகச் சரியான குறள்!",
    timeout: "நேரம் முடிந்தது!",
    next: "அடுத்த குறள்",
    results: "வேட்டை முடிந்தது!",
    resultMessage: "10 குறள்களில் {score} குறள்களைச் சரியாக அமைத்தீர்கள்.",
    seconds: "விநாடிகள்",
  },
} satisfies Record<Locale, {
  eyebrow: string;
  title: string;
  subtitle: string;
  start: string;
  replay: string;
  unavailable: string;
  rules: string[];
  round: string;
  score: string;
  memorize: string;
  memorizeHint: string;
  reconstruct: string;
  reconstructHint: string;
  selection: string;
  validate: string;
  reset: string;
  retry: string;
  correct: string;
  timeout: string;
  next: string;
  results: string;
  resultMessage: string;
  seconds: string;
}>;

function shuffleArray<T>(values: T[]) {
  const shuffled = [...values];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled;
}

function createTokens(round: KuralVettaiRound) {
  return round.lines
    .join(" ")
    .trim()
    .split(/\s+/u)
    .filter(Boolean)
    .map<WordToken>((word, originalIndex) => ({
      id: `${round.id}-${originalIndex}`,
      originalIndex,
      word,
    }));
}

function Timer({ value, duration, urgent = false }: { value: number; duration: number; urgent?: boolean }) {
  const progress = Math.max(0, Math.min(100, (value / duration) * 100));

  return (
    <div className="flex flex-col items-center" aria-live="polite">
      <div className={`relative flex h-24 w-24 items-center justify-center rounded-full border-[4px] border-[#180d2b] bg-white shadow-[5px_6px_0_#180d2b] ${urgent ? "animate-pulse" : ""}`}>
        <div
          className="absolute inset-2 rounded-full"
          style={{ background: `conic-gradient(#7c3aed ${progress}%, #eee5ff ${progress}% 100%)` }}
          aria-hidden="true"
        />
        <div className="relative flex h-[66px] w-[66px] items-center justify-center rounded-full bg-white text-3xl font-black text-[#180d2b]">
          {value}
        </div>
      </div>
    </div>
  );
}

function GameProgress({
  current,
  score,
  results,
}: {
  current: number;
  score: number;
  results: Array<boolean | null>;
}) {
  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto sm:gap-4">
      <div className="flex min-w-0 flex-1 gap-1.5 sm:flex-none" aria-label={`${current + 1} / 10`}>
        {Array.from({ length: 10 }, (_, index) => {
          const result = results[index];
          const statusColor = result === true
            ? "bg-[#20bf73]"
            : result === false
              ? "bg-[#ff3d68]"
              : index === current
                ? "bg-[#ffc43d]"
                : "bg-white";

          return (
            <span
              key={index}
              className={`h-3 flex-1 rounded-full border-2 border-[#180d2b] sm:w-9 sm:flex-none ${statusColor}`}
            />
          );
        })}
      </div>
      <div className="rounded-full border-[3px] border-[#180d2b] bg-[#c6ff2e] px-4 py-2 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b]">
        ★ {score} / 10
      </div>
    </div>
  );
}

export function KuralVettaiGame({ initialRounds, locale }: { initialRounds: KuralVettaiRound[]; locale: Locale }) {
  const labels = copy[locale];
  const [rounds, setRounds] = useState(initialRounds);
  const [phase, setPhase] = useState<Phase>("intro");
  const [roundIndex, setRoundIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState<number>(PHASE_DURATION.memorize);
  const [score, setScore] = useState(0);
  const [roundResults, setRoundResults] = useState<Array<boolean | null>>(
    () => Array.from({ length: 10 }, () => null),
  );
  const [scrambledTokens, setScrambledTokens] = useState<WordToken[]>([]);
  const [selectedTokenIds, setSelectedTokenIds] = useState<string[]>([]);
  const [attemptMessage, setAttemptMessage] = useState("");
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const currentRound = rounds[roundIndex];
  const selectedTokens = selectedTokenIds
    .map((id) => scrambledTokens.find((token) => token.id === id))
    .filter((token): token is WordToken => Boolean(token));
  const allWordsSelected = scrambledTokens.length > 0 && selectedTokens.length === scrambledTokens.length;

  const resultMessage = useMemo(
    () => labels.resultMessage.replace("{score}", String(score)),
    [labels.resultMessage, score],
  );

  useEffect(() => {
    if (phase !== "memorize" && phase !== "reconstruct") {
      return;
    }

    const timeout = window.setTimeout(() => {
      if (timeLeft > 1) {
        setTimeLeft((value) => value - 1);
        return;
      }

      if (phase === "memorize" && currentRound) {
        setScrambledTokens(shuffleArray(createTokens(currentRound)));
        setSelectedTokenIds([]);
        setAttemptMessage("");
        setPhase("reconstruct");
        setTimeLeft(PHASE_DURATION.reconstruct);
      } else if (phase === "reconstruct") {
        setRoundResults((current) => current.map((result, index) => (index === roundIndex ? false : result)));
        setFeedbackCorrect(false);
        setAttemptMessage(labels.timeout);
        setPhase("feedback");
      }
    }, 1000);

    return () => window.clearTimeout(timeout);
  }, [currentRound, labels.timeout, phase, roundIndex, timeLeft]);

  function startGame() {
    setRounds(shuffleArray(initialRounds));
    setRoundIndex(0);
    setScore(0);
    setRoundResults(Array.from({ length: 10 }, () => null));
    setSelectedTokenIds([]);
    setScrambledTokens([]);
    setAttemptMessage("");
    setFeedbackCorrect(false);
    setTimeLeft(PHASE_DURATION.memorize);
    setPhase("memorize");
  }

  function selectToken(tokenId: string) {
    setSelectedTokenIds((current) => [...current, tokenId]);
    setAttemptMessage("");
  }

  function removeSelectedToken(position: number) {
    setSelectedTokenIds((current) => current.filter((_, index) => index !== position));
    setAttemptMessage("");
  }

  function validateReconstruction() {
    const isCorrect = selectedTokens.every((token, index) => token.originalIndex === index);

    if (!isCorrect) {
      setAttemptMessage(labels.retry);
      setSelectedTokenIds([]);
      return;
    }

    setScore((value) => value + 1);
    setRoundResults((current) => current.map((result, index) => (index === roundIndex ? true : result)));
    setFeedbackCorrect(true);
    setAttemptMessage(labels.correct);
    setPhase("feedback");
  }

  function goToNextRound() {
    if (roundIndex >= rounds.length - 1) {
      setPhase("complete");
      return;
    }

    setRoundIndex((index) => index + 1);
    setSelectedTokenIds([]);
    setScrambledTokens([]);
    setAttemptMessage("");
    setFeedbackCorrect(false);
    setTimeLeft(PHASE_DURATION.memorize);
    setPhase("memorize");
  }

  if (initialRounds.length < 10) {
    return (
      <main className="min-h-[calc(100vh-88px)] bg-[#fff7ec] px-4 py-10 sm:px-6">
        <div className="mx-auto max-w-3xl rounded-[2rem] border-[4px] border-[#180d2b] bg-white p-8 text-center shadow-[9px_10px_0_#180d2b]">
          <p className="font-tamil text-xl font-black text-[#ff3d68]">{labels.unavailable}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-88px)] bg-[#fff7ec] px-4 py-6 text-[#180d2b] sm:px-6 sm:py-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c3aed]">{labels.eyebrow}</p>
            <h1 className="mt-2 font-tamil text-3xl font-black sm:text-5xl">{labels.title}</h1>
            <p className="mt-2 font-semibold text-[#6f587f]">{labels.subtitle}</p>
          </div>
          {phase !== "intro" && phase !== "complete" ? (
            <GameProgress current={roundIndex} score={score} results={roundResults} />
          ) : null}
        </header>

        {phase === "intro" ? (
          <section className="overflow-hidden rounded-[2rem] border-[4px] border-[#180d2b] bg-white shadow-[9px_10px_0_#180d2b]">
            <div className="grid md:grid-cols-[0.9fr_1.1fr]">
              <div className="flex min-h-72 items-center justify-center border-b-[4px] border-[#180d2b] bg-[#eee5ff] p-8 md:border-b-0 md:border-r-[4px]">
                <div className="relative flex h-44 w-44 items-center justify-center rounded-full border-[4px] border-[#180d2b] bg-[#ffc43d] text-7xl shadow-[8px_9px_0_#180d2b]">
                  <span aria-hidden="true">⏱</span>
                  <span className="absolute -right-3 -top-3 rounded-full border-[3px] border-[#180d2b] bg-[#ff3d68] px-3 py-1 text-sm font-black text-white">10×</span>
                </div>
              </div>
              <div className="p-7 sm:p-10">
                <ol className="grid gap-3">
                  {labels.rules.map((rule, index) => (
                    <li key={rule} className="flex items-center gap-4 rounded-2xl border-[3px] border-[#180d2b] bg-[#fff7ec] px-4 py-3 shadow-[3px_4px_0_#180d2b]">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-[#180d2b] bg-[#7c3aed] font-black text-white">{index + 1}</span>
                      <span className="font-tamil text-sm font-bold sm:text-base">{rule}</span>
                    </li>
                  ))}
                </ol>
                <button type="button" onClick={startGame} className="mt-7 w-full rounded-full border-[3px] border-[#180d2b] bg-[#20bf73] px-6 py-3.5 font-tamil text-lg font-black text-white shadow-[5px_6px_0_#180d2b] transition hover:-translate-y-1 hover:shadow-[7px_8px_0_#180d2b]">
                  {labels.start} →
                </button>
              </div>
            </div>
          </section>
        ) : null}

        {phase === "memorize" && currentRound ? (
          <section className="rounded-[2rem] border-[4px] border-[#180d2b] bg-white p-6 shadow-[9px_10px_0_#180d2b] sm:p-10">
            <div className="flex flex-col items-center gap-7 lg:flex-row lg:items-stretch">
              <div className="flex shrink-0 flex-col items-center justify-center rounded-[1.5rem] border-[3px] border-[#180d2b] bg-[#eee5ff] p-6">
                <Timer value={timeLeft} duration={PHASE_DURATION.memorize} urgent={timeLeft <= 5} />
                <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">{labels.seconds}</p>
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border-2 border-[#180d2b] bg-[#ffc43d] px-3 py-1 font-tamil text-xs font-black">#{currentRound.number}</span>
                  <span className="rounded-full border-2 border-[#180d2b] bg-white px-3 py-1 font-tamil text-xs font-black">{currentRound.chapter}</span>
                </div>
                <h2 className="mt-5 font-tamil text-lg font-black text-[#7c3aed]">{labels.memorize}</h2>
                <div className="mt-4 rounded-[1.5rem] border-[3px] border-[#180d2b] bg-[#fff7ec] p-6 shadow-[5px_6px_0_#180d2b] sm:p-8">
                  {currentRound.lines.map((line) => (
                    <p key={line} className="font-tamil text-xl font-black leading-[1.8] sm:text-3xl">{line}</p>
                  ))}
                </div>
                <p className="mt-5 font-tamil text-sm font-semibold text-[#6f587f]">{labels.memorizeHint}</p>
              </div>
            </div>
          </section>
        ) : null}

        {phase === "reconstruct" && currentRound ? (
          <section className="rounded-[2rem] border-[4px] border-[#180d2b] bg-white p-5 shadow-[9px_10px_0_#180d2b] sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-tamil text-xl font-black text-[#ff3d68]">{labels.reconstruct}</p>
                <p className="mt-1 font-tamil text-sm font-semibold text-[#6f587f]">{labels.reconstructHint}</p>
              </div>
              <div className="flex items-center gap-3 rounded-full border-[3px] border-[#180d2b] bg-[#ffe4eb] px-4 py-2 shadow-[3px_4px_0_#180d2b]">
                <span aria-hidden="true">⏱</span>
                <span className={`text-xl font-black ${timeLeft <= 10 ? "animate-pulse text-[#d41445]" : "text-[#180d2b]"}`}>{timeLeft}s</span>
              </div>
            </div>

            <div className="mt-6 rounded-[1.5rem] border-[3px] border-dashed border-[#180d2b] bg-[#fff7ec] p-4 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">{labels.selection}</p>
                {selectedTokenIds.length ? (
                  <button type="button" onClick={() => setSelectedTokenIds([])} className="rounded-full border-2 border-[#180d2b] bg-white px-3 py-1 text-xs font-black shadow-[2px_2px_0_#180d2b]">{labels.reset}</button>
                ) : null}
              </div>
              <div className="flex min-h-24 flex-wrap content-start gap-2">
                {selectedTokens.map((token, index) => (
                  <button key={`${token.id}-selected`} type="button" onClick={() => removeSelectedToken(index)} className="rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] px-4 py-2 font-tamil text-sm font-black shadow-[3px_3px_0_#180d2b] transition hover:-translate-y-0.5 sm:text-base">
                    {token.word}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-2.5">
              {scrambledTokens.map((token) => {
                const isSelected = selectedTokenIds.includes(token.id);
                return (
                  <button key={token.id} type="button" disabled={isSelected} onClick={() => selectToken(token.id)} className="rounded-full border-[3px] border-[#180d2b] bg-white px-4 py-2.5 font-tamil text-sm font-black shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-1 hover:bg-[#eee5ff] disabled:cursor-default disabled:opacity-20 sm:text-base">
                    {token.word}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
              <p className="font-tamil text-sm font-bold text-[#d41445]" aria-live="polite">{attemptMessage}</p>
              <button type="button" disabled={!allWordsSelected} onClick={validateReconstruction} className="ml-auto rounded-full border-[3px] border-[#180d2b] bg-[#20bf73] px-6 py-3 font-tamil text-base font-black text-white shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#c9c0d0] disabled:text-[#6f587f] disabled:opacity-70">
                {labels.validate} ✓
              </button>
            </div>
          </section>
        ) : null}

        {phase === "feedback" && currentRound ? (
          <section className={`rounded-[2rem] border-[4px] border-[#180d2b] p-7 text-center shadow-[9px_10px_0_#180d2b] sm:p-10 ${feedbackCorrect ? "bg-[#ddf8e9]" : "bg-[#ffe4eb]"}`}>
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full border-[4px] border-[#180d2b] text-4xl shadow-[5px_6px_0_#180d2b] ${feedbackCorrect ? "bg-[#20bf73] text-white" : "bg-[#ff3d68] text-white"}`}>
              {feedbackCorrect ? "✓" : "⏱"}
            </div>
            <h2 className="mt-6 font-tamil text-2xl font-black sm:text-4xl">{feedbackCorrect ? labels.correct : labels.timeout}</h2>
            <div className="mx-auto mt-6 max-w-3xl rounded-[1.5rem] border-[3px] border-[#180d2b] bg-white p-5 text-left shadow-[4px_5px_0_#180d2b] sm:p-7">
              {currentRound.lines.map((line) => (
                <p key={line} className="font-tamil text-lg font-black leading-[1.8] sm:text-2xl">{line}</p>
              ))}
            </div>
            <button type="button" onClick={goToNextRound} className="mt-7 rounded-full border-[3px] border-[#180d2b] bg-[#7c3aed] px-7 py-3 font-tamil text-base font-black text-white shadow-[5px_6px_0_#180d2b] transition hover:-translate-y-1 hover:shadow-[7px_8px_0_#180d2b]">
              {roundIndex === rounds.length - 1 ? labels.results : labels.next} →
            </button>
          </section>
        ) : null}

        {phase === "complete" ? (
          <section className="rounded-[2rem] border-[4px] border-[#180d2b] bg-[#eee5ff] p-8 text-center shadow-[9px_10px_0_#180d2b] sm:p-12">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[4px] border-[#180d2b] bg-[#ffc43d] text-5xl shadow-[7px_8px_0_#180d2b]">🏆</div>
            <h2 className="mt-7 font-tamil text-3xl font-black sm:text-5xl">{labels.results}</h2>
            <p className="mt-4 font-tamil text-lg font-bold text-[#6f587f] sm:text-xl">{resultMessage}</p>
            <div className="mx-auto mt-7 w-fit rounded-full border-[4px] border-[#180d2b] bg-[#c6ff2e] px-8 py-4 text-3xl font-black shadow-[5px_6px_0_#180d2b]">★ {score} / 10</div>
            <button type="button" onClick={startGame} className="mt-8 rounded-full border-[3px] border-[#180d2b] bg-[#20bf73] px-7 py-3 font-tamil text-base font-black text-white shadow-[5px_6px_0_#180d2b] transition hover:-translate-y-1 hover:shadow-[7px_8px_0_#180d2b]">
              {labels.replay}
            </button>
          </section>
        ) : null}
      </div>
    </main>
  );
}
