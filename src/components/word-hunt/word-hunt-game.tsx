"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { Locale, WordHuntExercise } from "@/types";

function formatClock(time: number) {
  return `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;
}

function stableHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function shuffleWords(words: WordHuntExercise["words"], seed: string) {
  return [...words]
    .map((word, index) => ({ word, sort: stableHash(`${seed}-${word.id}-${word.word}-${index}`) }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ word }) => word);
}

export function WordHuntGame({
  exercise,
  locale,
}: {
  exercise: WordHuntExercise;
  locale: Locale;
}) {
  const [selected, setSelected] = useState<Record<string, "correct" | "wrong">>({});
  const [errors, setErrors] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercise.timeLimitSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const words = useMemo(() => shuffleWords(exercise.words, exercise.id), [exercise.id, exercise.words]);
  const correctTotal = exercise.words.filter((word) => word.isCorrect).length;
  const foundTotal = Object.entries(selected).filter(([, state]) => state === "correct").length;
  const score = foundTotal * 100;
  const prompt = exercise.prompt[locale] ?? exercise.prompt.en ?? "";
  const copy =
    locale === "fr"
      ? {
          back: "Retour",
          score: "Score",
          errors: "Erreurs",
          progress: "Progression",
          time: "Temps",
          pause: "Pause",
          resume: "Reprendre",
          won: "Bravo !",
          lost: "Partie terminée",
          summary: "Mots trouvés",
          replay: "Rejouer",
        }
      : locale === "ta"
        ? {
            back: "திரும்பு",
            score: "மதிப்பெண்",
            errors: "பிழைகள்",
            progress: "முன்னேற்றம்",
            time: "நேரம்",
            pause: "இடைநிறுத்து",
            resume: "தொடரவும்",
            won: "சிறப்பு !",
            lost: "விளையாட்டு முடிந்தது",
            summary: "கண்டுபிடித்த சொற்கள்",
            replay: "மீண்டும்",
          }
        : {
            back: "Back",
            score: "Score",
            errors: "Errors",
            progress: "Progress",
            time: "Time",
            pause: "Pause",
            resume: "Resume",
            won: "Great job!",
            lost: "Game over",
            summary: "Words found",
            replay: "Play again",
          };

  useEffect(() => {
    if (gameState !== "playing" || isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setGameState("lost");
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [gameState, isPaused]);

  function handleWordClick(word: WordHuntExercise["words"][number]) {
    if (gameState !== "playing" || selected[word.id]) {
      return;
    }

    if (word.isCorrect) {
      const next = { ...selected, [word.id]: "correct" as const };
      setSelected(next);

      if (Object.values(next).filter((state) => state === "correct").length >= correctTotal) {
        setGameState("won");
      }
      return;
    }

    setSelected((current) => ({ ...current, [word.id]: "wrong" }));
    setErrors((current) => {
      const next = current + 1;

      if (next >= 3) {
        setGameState("lost");
      }

      return next;
    });
  }

  return (
    <section className="relative mx-auto max-w-6xl">
      <article className="relative rounded-[1.45rem] border-[3px] border-[#180d2b] bg-white px-4 py-4 shadow-[8px_9px_0_#180d2b] sm:px-5">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href={`/${locale}/word-hunt`}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-white text-[#180d2b] shadow-[4px_5px_0_#180d2b]"
              aria-label={copy.back}
            >
              ←
            </Link>
            <div className="min-w-0">
              <p className="inline-flex rounded-full border-[3px] border-[#180d2b] bg-[#efe6ff] px-3 py-1 font-display text-[0.68rem] font-black uppercase tracking-[0.14em] text-[#7c3aed] shadow-[3px_4px_0_#180d2b]">
                {locale === "ta" ? "சொல் வேட்டை" : locale === "fr" ? "Chasse aux mots" : "Word Hunt"}
              </p>
              <h1 className="mt-2 truncate font-display text-[clamp(1.6rem,4vw,2.4rem)] font-black text-[#180d2b]">
                {exercise.title}
              </h1>
            </div>
          </div>
          <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:grid-cols-5">
            {[
              [copy.score, score],
              [copy.errors, `${errors}/3`],
              [copy.progress, `${foundTotal}/${correctTotal}`],
              [copy.time, formatClock(timeLeft)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[0.85rem] border-[3px] border-[#180d2b] bg-white px-3 py-2 shadow-[3px_4px_0_#180d2b]">
                <p className="font-display text-[0.58rem] font-black uppercase tracking-[0.13em] text-[#7c3aed]">{label}</p>
                <p className="mt-1 text-lg font-black tabular-nums text-[#180d2b]">{value}</p>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setIsPaused((current) => !current)}
              disabled={gameState !== "playing"}
              className="min-h-[54px] rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] px-4 font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b] disabled:opacity-60"
            >
              {isPaused ? "▶" : "Ⅱ"}
            </button>
          </div>
        </header>

        <div className="mt-5 rounded-[1.25rem] border-[3px] border-[#180d2b] bg-[#ffc43d] p-4 shadow-[5px_6px_0_#180d2b]">
          <p className="font-tamil text-[clamp(1.2rem,4vw,1.75rem)] font-black leading-8 text-[#180d2b]">{prompt}</p>
        </div>

        {isPaused && gameState === "playing" ? (
          <div className="mt-5 rounded-[1.25rem] border-[3px] border-[#180d2b] bg-[#fff5cf] p-8 text-center shadow-[5px_6px_0_#180d2b]">
            <p className="font-display text-4xl font-black text-[#180d2b]">{copy.pause}</p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="mt-5 rounded-[1rem] border-[3px] border-[#180d2b] bg-[#c6ff2e] px-8 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b]"
            >
              {copy.resume}
            </button>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {words.map((word) => {
              const state = selected[word.id];
              return (
                <button
                  key={word.id}
                  type="button"
                  onClick={() => handleWordClick(word)}
                  disabled={gameState !== "playing" || Boolean(state)}
                  className={`min-h-14 rounded-[1rem] border-[3px] border-[#180d2b] px-3 py-2 font-tamil text-lg font-black shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5 disabled:cursor-default ${
                    state === "correct"
                      ? "bg-[#21c77a] text-white"
                      : state === "wrong"
                        ? "bg-[#ff5f6d] text-white"
                        : "bg-[#fff7ec] text-[#180d2b]"
                  }`}
                >
                  {word.word}
                </button>
              );
            })}
          </div>
        )}

        {gameState !== "playing" ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#180d2b]/45 p-5 backdrop-blur-[6px]">
            <div className="w-full max-w-[22rem] rounded-[1.5rem] border-[3px] border-[#180d2b] bg-white px-7 py-8 text-center shadow-[8px_9px_0_#180d2b]">
              <h2 className="font-display text-4xl font-black text-[#180d2b]">{gameState === "won" ? copy.won : copy.lost}</h2>
              <p className="mt-3 text-sm font-bold text-[#6b5441]">
                {copy.summary}: {foundTotal}/{correctTotal}
              </p>
              <p className="mt-4 text-5xl font-black text-[#180d2b]">{score}</p>
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-6 rounded-[1rem] border-[3px] border-[#180d2b] bg-[#ffc43d] px-6 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b]"
              >
                {copy.replay}
              </button>
            </div>
          </div>
        ) : null}
      </article>
    </section>
  );
}
