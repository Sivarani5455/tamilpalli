"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";

import { saveWordSearchScoreAction } from "@/app/[locale]/game-actions";
import { initialGameState } from "@/lib/action-states";
import type { Locale, WordSearchGrid } from "@/types";

function iconProps(className?: string) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

function BookOpenIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M2 6.5A2.5 2.5 0 0 1 4.5 4H10a3 3 0 0 1 3 3v13a3 3 0 0 0-3-3H4.5A2.5 2.5 0 0 0 2 19.5z" />
      <path d="M22 6.5A2.5 2.5 0 0 0 19.5 4H14a3 3 0 0 0-3 3v13a3 3 0 0 1 3-3h5.5a2.5 2.5 0 0 1 2.5 2.5z" />
    </svg>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M10 5v14" />
      <path d="M14 5v14" />
    </svg>
  );
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m8 5 11 7-11 7z" />
    </svg>
  );
}

function RotateCcwIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M8 21h8" />
      <path d="M12 17v4" />
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
      <path d="M17 5h3a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4" />
      <path d="M7 5H4a1 1 0 0 0-1 1v1a4 4 0 0 0 4 4" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m5 12 4 4L19 7" />
    </svg>
  );
}

const PILL_COLORS = [
  "#f59e0b",
  "#06b6d4",
  "#f43f5e",
  "#4f46e5",
  "#10b981",
  "#7c3aed",
  "#84cc16",
  "#f97316",
  "#0ea5e9",
];

const MAX_ATTEMPTS = 3;
const GAME_TIME_FALLBACK = 120;

type CellCoord = [number, number];

const cellKey = (row: number, col: number) => `${row},${col}`;

function getLine(a: CellCoord, b: CellCoord, rowCount: number, columnCount: number) {
  const deltaRow = b[0] - a[0];
  const deltaCol = b[1] - a[1];

  if (deltaRow === 0 && deltaCol === 0) {
    return [a];
  }

  const absRow = Math.abs(deltaRow);
  const absCol = Math.abs(deltaCol);

  if (!(deltaRow === 0 || deltaCol === 0 || absRow === absCol)) {
    return [a];
  }

  const stepRow = deltaRow === 0 ? 0 : deltaRow > 0 ? 1 : -1;
  const stepCol = deltaCol === 0 ? 0 : deltaCol > 0 ? 1 : -1;
  const length = Math.max(absRow, absCol);
  const cells: CellCoord[] = [];

  for (let index = 0; index <= length; index += 1) {
    const row = a[0] + index * stepRow;
    const col = a[1] + index * stepCol;

    if (row >= 0 && row < rowCount && col >= 0 && col < columnCount) {
      cells.push([row, col]);
    }
  }

  return cells;
}

function formatClock(time: number) {
  return `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`;
}

export function WordSearchGame({
  grid,
  locale,
}: {
  grid: WordSearchGrid;
  locale: Locale;
}) {
  const isTamil = locale === "ta";
  const rowCount = grid.gridData.length;
  const columnCount = grid.gridData[0]?.length ?? 0;
  const boardGap = columnCount >= 16 ? 4 : 5;
  const boardSpan = Math.max(rowCount, columnCount);
  const boardMinCell = columnCount >= 16 ? 24 : columnCount >= 13 ? 30 : columnCount >= 10 ? 38 : 48;
  const boardPreferredCell =
    columnCount >= 16 ? 30 : columnCount >= 13 ? 36 : columnCount >= 10 ? 46 : 58;
  const boardMinWidth =
    boardSpan > 0 ? boardSpan * boardMinCell + (boardSpan - 1) * boardGap + 28 : 0;
  const boardMaxWidth =
    boardSpan > 0 ? boardSpan * boardPreferredCell + (boardSpan - 1) * boardGap + 44 : 0;
  const boardWidth =
    boardSpan > 0
      ? `clamp(${Math.max(boardMinWidth, 320)}px, 64vmin, ${Math.max(boardMaxWidth, 540)}px)`
      : "min(72vmin, 640px)";
  const boardFontSize =
    columnCount >= 16 ? "clamp(0.58rem, 1.05vmin, 0.95rem)" :
    columnCount >= 13 ? "clamp(0.68rem, 1.25vmin, 1rem)" :
    columnCount >= 10 ? "clamp(0.8rem, 1.48vmin, 1.12rem)" :
    "clamp(0.92rem, 1.75vmin, 1.3rem)";

  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundPlacements, setFoundPlacements] = useState<Record<string, number>>({});
  const [dragging, setDragging] = useState(false);
  const [anchor, setAnchor] = useState<CellCoord | null>(null);
  const [hoverCell, setHoverCell] = useState<CellCoord | null>(null);
  const [timeLeft, setTimeLeft] = useState(grid.timeLimitSeconds || GAME_TIME_FALLBACK);
  const [timeUsedSeconds, setTimeUsedSeconds] = useState(0);
  const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
  const [lossReason, setLossReason] = useState<"time" | "mistakes" | null>(null);
  const [attemptsLeft, setAttemptsLeft] = useState(MAX_ATTEMPTS);
  const [isPaused, setIsPaused] = useState(false);
  const [pulseWord, setPulseWord] = useState<string | null>(null);
  const [wrongKeys, setWrongKeys] = useState<Record<string, boolean>>({});
  const [toastWord, setToastWord] = useState<{ word: string; points: number; color: string } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saveState, saveAction] = useActionState(saveWordSearchScoreAction, initialGameState);
  const draggingRef = useRef(false);
  const autoSaveFormRef = useRef<HTMLFormElement | null>(null);
  const hasSubmittedScoreRef = useRef(false);

  const score = foundWords.length * 100;
  const foundCount = foundWords.length;
  const progressPercent = (foundCount / Math.max(grid.words.length, 1)) * 100;
  const isLowTime = timeLeft <= 30 && gameState === "playing";
  const copy =
    locale === "ta"
      ? {
          category: "சொல் தேடல்",
          back: "பட்டியலுக்கு திரும்பு",
          score: "மதிப்பெண்",
          progress: "முன்னேற்றம்",
          time: "நேரம்",
          pause: "இடைநிறுத்தம்",
          paused: "விளையாட்டு இடைநிறுத்தப்பட்டுள்ளது",
          pausedBody: "விளையாட்டைத் தொடர மீண்டும் தொடங்குங்கள்.",
          resume: "தொடர்க",
          grid: "கிரிட்",
          cells: "செல்கள்",
          wordsToFind: "கண்டுபிடிக்க வேண்டிய சொற்கள்",
          found: "கண்டுபிடித்தது",
          close: "மூடு",
          congrats: "வாழ்த்துகள்",
          noAttempts: "முயற்சிகள் முடிந்துவிட்டன",
          timeOver: "நேரம் முடிந்தது",
          allFound: "அனைத்து சொற்களும் கண்டுபிடிக்கப்பட்டன. கிரிட் முடிந்தது.",
          foundBeforeAttempts: (count: number) => `முயற்சிகள் முடிவதற்கு முன் ${count} சொற்கள் கண்டுபிடிக்கப்பட்டன.`,
          foundBeforeTime: (count: number, total: number) => `நேரம் முடிவதற்கு முன் ${total} இல் ${count} சொற்கள் கண்டுபிடிக்கப்பட்டன.`,
          finalScore: "இறுதி மதிப்பெண்",
          replay: "மீண்டும் விளையாடு",
          backToList: "திரும்பு",
          points: "புள்ளிகள்",
        }
      : locale === "fr"
        ? {
            category: "Recherche de mots",
            back: "Retour à la liste",
            score: "Score",
            progress: "Progression",
            time: "Temps",
            pause: "Pause",
            paused: "La grille est en pause",
            pausedBody: "Reprenez la partie pour retrouver les mots, suivre votre progression et finir la grille.",
            resume: "Reprendre",
            grid: "Grille",
            cells: "cases",
            wordsToFind: "Mots à trouver",
            found: "trouvés",
            close: "Fermer",
            congrats: "Félicitations",
            noAttempts: "Plus d'essais",
            timeOver: "Temps écoulé",
            allFound: "Tous les mots ont été trouvés. La grille est complète.",
            foundBeforeAttempts: (count: number) => `Vous avez trouvé ${count} mot${count > 1 ? "s" : ""} avant la fin des essais.`,
            foundBeforeTime: (count: number, total: number) => `Vous avez trouvé ${count} mot${count > 1 ? "s" : ""} sur ${total} avant la fin du temps.`,
            finalScore: "Score final",
            replay: "Rejouer",
            backToList: "Retour",
            points: "pts",
          }
        : {
            category: "Word Search",
            back: "Back to list",
            score: "Score",
            progress: "Progress",
            time: "Time",
            pause: "Pause",
            paused: "The grid is paused",
            pausedBody: "Resume the game to keep finding words and finish the grid.",
            resume: "Resume",
            grid: "Grid",
            cells: "cells",
            wordsToFind: "Words to find",
            found: "found",
            close: "Close",
            congrats: "Congratulations",
            noAttempts: "No attempts left",
            timeOver: "Time over",
            allFound: "All words were found. The grid is complete.",
            foundBeforeAttempts: (count: number) => `You found ${count} word${count > 1 ? "s" : ""} before running out of attempts.`,
            foundBeforeTime: (count: number, total: number) => `You found ${count} word${count > 1 ? "s" : ""} out of ${total} before time ran out.`,
            finalScore: "Final score",
            replay: "Play again",
            backToList: "Back",
            points: "pts",
          };
  const selectedCells =
    dragging && anchor && hoverCell ? getLine(anchor, hoverCell, rowCount, columnCount) : [];
  const overlayTitle =
    gameState === "won"
      ? copy.congrats
      : lossReason === "mistakes"
        ? copy.noAttempts
        : copy.timeOver;

  useEffect(() => {
    draggingRef.current = dragging;
  }, [dragging]);

  useEffect(() => {
    if (gameState !== "playing" || isPaused) {
      return;
    }

    const timer = window.setTimeout(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          setLossReason("time");
          setGameState("lost");
          return 0;
        }

        return current - 1;
      });
      setTimeUsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [gameState, isPaused, timeLeft]);

  useEffect(() => {
    if (gameState === "playing") {
      hasSubmittedScoreRef.current = false;
      return;
    }

    if (hasSubmittedScoreRef.current) {
      return;
    }

    hasSubmittedScoreRef.current = true;
    autoSaveFormRef.current?.requestSubmit();
  }, [gameState]);

  useEffect(() => {
    const finishSelection = () => {
      if (!draggingRef.current || !anchor || !hoverCell || gameState !== "playing" || isPaused) {
        setDragging(false);
        setAnchor(null);
        setHoverCell(null);
        return;
      }

      const line = getLine(anchor, hoverCell, rowCount, columnCount);

      if (line.length >= 2) {
        const selectedWord = line.map(([row, col]) => grid.gridData[row][col]).join("");
        const reversedWord = [...selectedWord].reverse().join("");
        const match = grid.words.find(
          (entry) =>
            !foundWords.includes(entry.word) &&
            (entry.word === selectedWord || entry.word === reversedWord),
        );

        if (match) {
          const colorIdx = foundWords.length % PILL_COLORS.length;
          const color = PILL_COLORS[colorIdx];

          setFoundPlacements((current) => {
            const next = { ...current };
            line.forEach(([row, col]) => {
              next[cellKey(row, col)] = colorIdx;
            });
            return next;
          });
          setFoundWords((current) => {
            const next = [...current, match.word];

            if (next.length === grid.words.length && grid.words.length > 0) {
              setGameState("won");
            }

            return next;
          });
          setPulseWord(match.word);
          setToastWord({ word: match.word, points: 100, color });
          window.setTimeout(() => setPulseWord(null), 1200);
          window.setTimeout(() => setToastWord(null), 1800);
        } else {
          const nextWrongKeys = Object.fromEntries(line.map(([row, col]) => [cellKey(row, col), true]));
          setWrongKeys(nextWrongKeys);
          window.setTimeout(() => setWrongKeys({}), 450);

          setAttemptsLeft((current) => {
            const next = current - 1;

            if (next <= 0) {
              setLossReason("mistakes");
              setGameState("lost");
              return 0;
            }

            return next;
          });
        }
      }

      setDragging(false);
      setAnchor(null);
      setHoverCell(null);
    };

    window.addEventListener("mouseup", finishSelection);
    window.addEventListener("touchend", finishSelection);

    return () => {
      window.removeEventListener("mouseup", finishSelection);
      window.removeEventListener("touchend", finishSelection);
    };
  }, [anchor, columnCount, foundWords, gameState, grid.gridData, grid.words, hoverCell, isPaused, rowCount]);

  const renderWordCard = (entry: WordSearchGrid["words"][number], index: number) => {
    const found = foundWords.includes(entry.word);
    const color = PILL_COLORS[index % PILL_COLORS.length];
    const activePulse = pulseWord === entry.word;

    return (
      <div
        key={entry.word}
        className={`rounded-[1.4rem] border px-4 py-3 transition-all duration-300 ${
          activePulse ? "scale-[1.02] shadow-[0_18px_36px_-28px_rgba(79,70,229,0.9)]" : ""
        }`}
        style={{
          background: found ? `${color}16` : "rgba(255,255,255,0.76)",
          borderColor: found ? `${color}66` : "rgba(191,219,254,0.56)",
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="mt-1 h-3 w-3 shrink-0 rounded-full"
            style={{
              background: found ? color : "#c7d2fe",
              boxShadow: found ? `0 0 0 6px ${color}18` : "none",
            }}
          />
          <div className="min-w-0 flex-1">
            <div
              className={`font-tamil break-words leading-tight ${isTamil ? "text-[1.28rem] font-semibold sm:text-[1.38rem]" : "text-[1.1rem] font-bold sm:text-[1.2rem]"}`}
              style={{
                color: found ? color : "#172554",
                textDecoration: found ? "line-through" : "none",
              }}
            >
              {entry.word}
            </div>
            {locale !== "ta" ? (
              <div className="mt-1 break-words text-sm font-medium text-slate-500">
                {entry.translation[locale]}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden bg-[linear-gradient(160deg,#eef2ff_0%,#f8fbff_52%,#ede9fe_100%)] text-slate-900"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(139,92,246,0.14),transparent_30%)]" />

      <div className="relative flex min-h-[100dvh] flex-col">
        <header className="border-b border-white/60 bg-white/70 px-4 py-4 backdrop-blur-xl sm:px-6 xl:px-8">
          <div className="mx-auto flex w-full max-w-[118rem] items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <Link
                href={`/${locale}/word-search`}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/70 bg-white text-slate-700 shadow-[0_16px_32px_-24px_rgba(15,23,42,0.6)] transition hover:-translate-y-0.5"
                aria-label={copy.back}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Link>

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#18c8a3] to-[#4f62ff] text-white shadow-[0_22px_40px_-28px_rgba(79,98,255,0.75)]">
                <BookOpenIcon className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className={`text-teal-500 ${isTamil ? "text-[0.9rem] font-medium tracking-[0.02em]" : "text-[11px] font-black uppercase tracking-[0.28em]"}`}>
                  {copy.category}
                </p>
                <h1 className={`truncate text-slate-950 ${isTamil ? "text-[2rem] font-semibold tracking-[-0.02em] sm:text-[2.2rem]" : "text-xl font-black tracking-[-0.04em] sm:text-2xl"}`}>
                  {grid.title}
                </h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              {toastWord ? (
                <div
                  className="rounded-full px-4 py-2 text-sm font-black text-white shadow-[0_18px_36px_-24px_rgba(15,23,42,0.8)]"
                  style={{ backgroundColor: toastWord.color }}
                >
                  +{toastWord.points} {copy.points}
                </div>
              ) : null}

              <div className="flex h-[62px] min-w-[122px] flex-col justify-between rounded-[1.15rem] border border-teal-100 bg-[linear-gradient(180deg,#f2fffb,#ecfdf5)] px-4 py-2 shadow-sm">
                <div className={`text-slate-400 ${isTamil ? "text-[0.82rem] font-medium tracking-[0.02em]" : "text-[10px] font-black uppercase tracking-[0.22em]"}`}>
                  {copy.score}
                </div>
                <div className="text-lg font-black tracking-[-0.04em] text-slate-900">
                  {score}
                </div>
              </div>

              <div className="flex h-[62px] min-w-[118px] items-center justify-center gap-2 rounded-[1.15rem] border border-violet-100 bg-white px-4 py-2 shadow-sm">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => (
                  <div
                    key={index}
                    className={`h-4.5 w-4.5 rounded-full transition ${index < attemptsLeft ? "bg-violet-500" : "bg-slate-200"}`}
                    style={{
                      transform: index < attemptsLeft ? "scale(1)" : "scale(0.72)",
                      opacity: index < attemptsLeft ? 1 : 0.5,
                    }}
                  />
                ))}
              </div>

              <div className="flex h-[62px] min-w-[170px] flex-col justify-between rounded-[1.15rem] border border-teal-100 bg-white px-4 py-2 shadow-sm">
                <div className={`text-slate-400 ${isTamil ? "text-[0.82rem] font-medium tracking-[0.02em]" : "text-[10px] font-black uppercase tracking-[0.22em]"}`}>
                  {copy.progress}
                </div>
                <div className="text-lg font-black tracking-[-0.04em] text-slate-900">
                  {foundCount}/{grid.words.length}
                </div>
              </div>

              <div
                className={`flex h-[62px] min-w-[130px] flex-col justify-between rounded-[1.15rem] border px-4 py-2 shadow-sm ${
                  isLowTime ? "border-rose-200 bg-rose-50" : "border-sky-100 bg-white"
                }`}
              >
                <div className={`flex items-center gap-2 text-slate-400 ${isTamil ? "text-[0.82rem] font-medium tracking-[0.02em]" : "text-[10px] font-black uppercase tracking-[0.22em]"}`}>
                  <ClockIcon className="h-3.5 w-3.5" />
                  {copy.time}
                </div>
                <div className={`text-lg font-black tracking-[-0.04em] ${isLowTime ? "text-rose-600" : "text-slate-900"}`}>
                  {formatClock(timeLeft)}
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (gameState !== "playing") {
                    return;
                  }
                  setDragging(false);
                  setAnchor(null);
                  setHoverCell(null);
                  setIsPaused((current) => !current);
                }}
                className={`inline-flex h-[62px] min-w-[78px] items-center justify-center rounded-[1.15rem] border px-4 py-2 shadow-sm transition hover:-translate-y-0.5 ${
                  isPaused
                    ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-700"
                    : "border-violet-200 bg-gradient-to-br from-violet-50 to-indigo-100 text-indigo-700"
                }`}
              >
                {isPaused ? <PlayIcon className="h-8 w-8" /> : <PauseIcon className="h-8 w-8" />}
              </button>
            </div>
          </div>
        </header>

        <div className="relative flex-1">
          <main className="relative flex h-full items-center justify-center px-3 py-4 sm:px-4 lg:px-6 xl:px-8">
            <div className="mx-auto flex h-full w-full max-w-[118rem] flex-1 items-center justify-center">
              {isPaused ? (
                <section className="w-full max-w-3xl rounded-[2.4rem] border border-white/70 bg-white/82 p-10 text-center shadow-[0_40px_90px_-55px_rgba(17,25,53,0.4)] backdrop-blur-xl">
                <p className={`text-teal-500 ${isTamil ? "text-[0.92rem] font-medium tracking-[0.02em]" : "text-[11px] font-black uppercase tracking-[0.28em]"}`}>
                  {copy.pause}
                </p>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-slate-950">
                  {copy.paused}
                </h2>
                <p className={`mx-auto mt-3 max-w-xl text-slate-500 ${isTamil ? "text-[1.02rem] leading-8" : "text-base leading-7"}`}>
                  {copy.pausedBody}
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                  className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#18c8a3] to-[#4f62ff] px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_22px_42px_-26px_rgba(79,98,255,0.8)]"
                >
                  <PlayIcon className="h-4 w-4" />
                  {copy.resume}
                </button>
                </section>
              ) : (
                <section className="relative flex h-full w-full flex-1 items-center justify-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className="relative rounded-[2.75rem] border border-white/70 bg-white/82 p-4 shadow-[0_42px_95px_-52px_rgba(17,25,53,0.4)] backdrop-blur-xl sm:p-5"
                      style={{ width: boardWidth }}
                    >
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className={`text-slate-400 ${isTamil ? "text-[0.88rem] font-medium tracking-[0.02em]" : "text-[11px] font-black uppercase tracking-[0.28em]"}`}>
                          {copy.grid}
                        </p>
                        <div className={`mt-1 text-slate-500 ${isTamil ? "text-[0.98rem] font-medium tracking-[0.01em]" : "text-sm font-semibold"}`}>
                          {rowCount} x {columnCount} {copy.cells}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 lg:hidden">
                        <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-slate-600">
                          {foundCount}/{grid.words.length}
                        </div>
                        <button
                          type="button"
                          onClick={() => setSidebarOpen((current) => !current)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/70 bg-white text-slate-700 shadow-sm"
                          aria-label={copy.wordsToFind}
                        >
                          <ChevronLeftIcon className={`h-4 w-4 transition ${sidebarOpen ? "rotate-180" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <div
                      className="grid touch-none select-none rounded-[2rem] bg-[linear-gradient(180deg,rgba(248,250,252,0.98),rgba(240,249,255,0.96))] p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] sm:p-3"
                      style={{
                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                        gap: `${boardGap}px`,
                        touchAction: "none",
                      }}
                      onTouchMove={(event) => {
                        event.preventDefault();
                        const touch = event.touches[0];
                        const element = document.elementFromPoint(
                          touch.clientX,
                          touch.clientY,
                        ) as HTMLElement | null;
                        const row = element?.dataset?.row;
                        const col = element?.dataset?.col;

                        if (row !== undefined && col !== undefined) {
                          setHoverCell([Number(row), Number(col)]);
                        }
                      }}
                    >
                      {grid.gridData.flatMap((row, rowIndex) =>
                        row.map((letter, colIndex) => {
                          const key = cellKey(rowIndex, colIndex);
                          const selected = selectedCells.some(
                            ([selectedRow, selectedCol]) =>
                              selectedRow === rowIndex && selectedCol === colIndex,
                          );
                          const foundColorIdx = foundPlacements[key];
                          const found = foundColorIdx !== undefined;
                          const foundColor = found ? PILL_COLORS[foundColorIdx] : null;
                          const wrong = Boolean(wrongKeys[key]);

                          return (
                            <button
                              key={key}
                              type="button"
                              data-row={rowIndex}
                              data-col={colIndex}
                              onMouseDown={() => {
                                if (gameState !== "playing" || isPaused) {
                                  return;
                                }
                                setDragging(true);
                                setAnchor([rowIndex, colIndex]);
                                setHoverCell([rowIndex, colIndex]);
                              }}
                              onMouseEnter={() => {
                                if (draggingRef.current && gameState === "playing" && !isPaused) {
                                  setHoverCell([rowIndex, colIndex]);
                                }
                              }}
                              onTouchStart={(event) => {
                                event.preventDefault();
                                if (gameState !== "playing" || isPaused) {
                                  return;
                                }
                                setDragging(true);
                                setAnchor([rowIndex, colIndex]);
                                setHoverCell([rowIndex, colIndex]);
                              }}
                              className="font-tamil flex aspect-square items-center justify-center rounded-[1.1rem] font-bold transition-all duration-150"
                              aria-label={`cell ${rowIndex}-${colIndex} ${letter}`}
                              style={{
                                fontSize:
                                  typeof letter === "string" && letter.length > 1
                                    ? `calc(${boardFontSize} - 0.06rem)`
                                    : boardFontSize,
                                lineHeight: 1,
                                color: found ? "#ffffff" : selected ? "#312e81" : wrong ? "#991b1b" : "#0f172a",
                                backgroundColor: found
                                  ? foundColor ?? "#6366f1"
                                  : selected
                                    ? "#c7d2fe"
                                    : wrong
                                      ? "#fecaca"
                                      : "#ffffff",
                                boxShadow: found
                                  ? "0 18px 30px -24px rgba(15,23,42,0.85)"
                                  : selected
                                    ? "0 14px 24px -20px rgba(99,102,241,0.75)"
                                    : "0 1px 0 rgba(255,255,255,0.65), 0 10px 20px -22px rgba(15,23,42,0.7)",
                                transform: found
                                  ? "scale(1.03)"
                                  : selected
                                    ? "scale(1.08)"
                                    : wrong
                                      ? "scale(0.97)"
                                      : "scale(1)",
                                position: selected ? "relative" : "static",
                                zIndex: selected ? 10 : "auto",
                              }}
                            >
                              {letter}
                            </button>
                          );
                        }),
                      )}
                    </div>

                      <button
                        type="button"
                        onClick={() => setSidebarOpen((current) => !current)}
                        className="absolute -right-5 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 rounded-[1.7rem] border border-white/70 bg-white/88 px-3 py-4 text-slate-700 shadow-[0_24px_48px_-32px_rgba(17,25,53,0.7)] backdrop-blur-xl xl:flex"
                        aria-label={copy.wordsToFind}
                      >
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                          {foundCount}
                        </span>
                        <span className="h-14 w-px bg-slate-200" />
                        <ChevronLeftIcon className={`h-4 w-4 transition ${sidebarOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>

                    <aside
                      className={`absolute top-0 z-30 flex w-[22rem] max-w-[92vw] flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/82 shadow-[-30px_0_80px_-45px_rgba(17,25,53,0.55)] backdrop-blur-xl transition-transform duration-300 xl:left-[calc(100%+2rem)] xl:right-auto xl:w-[24rem] ${
                        sidebarOpen ? "right-0 translate-x-0" : "right-0 translate-x-full xl:translate-x-0"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
                        <div>
                          <p className={`text-teal-500 ${isTamil ? "text-[0.92rem] font-medium tracking-[0.02em]" : "text-[11px] font-black uppercase tracking-[0.26em]"}`}>
                            {copy.wordsToFind}
                          </p>
                          <h2 className={`mt-1 text-slate-950 ${isTamil ? "text-[2rem] font-semibold tracking-[-0.02em]" : "text-xl font-black tracking-[-0.04em]"}`}>
                            {foundCount}/{grid.words.length} {copy.found}
                          </h2>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSidebarOpen(false)}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:text-slate-900"
                          aria-label={copy.close}
                        >
                          <XIcon className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="border-b border-slate-100 px-5 py-5 xl:hidden">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-[1.5rem] border border-teal-100 bg-[linear-gradient(180deg,#f2fffb,#ecfdf5)] p-4">
                            <div className={`text-slate-400 ${isTamil ? "text-[0.82rem] font-medium tracking-[0.02em]" : "text-[10px] font-black uppercase tracking-[0.22em]"}`}>
                              {copy.score}
                            </div>
                            <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950">
                              {score}
                            </div>
                          </div>

                          <div className={`rounded-[1.5rem] border p-4 ${isLowTime ? "border-rose-200 bg-rose-50" : "border-sky-100 bg-sky-50/60"}`}>
                            <div className={`text-slate-400 ${isTamil ? "text-[0.82rem] font-medium tracking-[0.02em]" : "text-[10px] font-black uppercase tracking-[0.22em]"}`}>
                              {copy.time}
                            </div>
                            <div className={`mt-2 text-2xl font-black tracking-[-0.04em] ${isLowTime ? "text-rose-600" : "text-slate-950"}`}>
                              {formatClock(timeLeft)}
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => (
                              <div
                                key={index}
                                className={`h-3 w-3 rounded-full transition ${index < attemptsLeft ? "bg-violet-500" : "bg-slate-200"}`}
                                style={{
                                  transform: index < attemptsLeft ? "scale(1)" : "scale(0.72)",
                                  opacity: index < attemptsLeft ? 1 : 0.5,
                                }}
                              />
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (gameState !== "playing") {
                                return;
                              }
                              setDragging(false);
                              setAnchor(null);
                              setHoverCell(null);
                              setIsPaused((current) => !current);
                            }}
                            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-black uppercase tracking-[0.16em] text-slate-700 shadow-sm"
                          >
                            {isPaused ? <PlayIcon className="h-3.5 w-3.5" /> : <PauseIcon className="h-3.5 w-3.5" />}
                            {isPaused ? copy.resume : copy.pause}
                          </button>
                        </div>

                        <div className="mt-4">
                          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span>{copy.progress}</span>
                            <span>{Math.round(progressPercent)}%</span>
                          </div>
                          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#18c8a3] via-[#3fb3ff] to-[#8b5cf6] transition-all duration-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="px-5 py-5">
                        <div className="space-y-3">
                          {grid.words.map((entry, index) => renderWordCard(entry, index))}
                        </div>
                      </div>
                    </aside>
                  </div>
                </section>
              )}
            </div>
          </main>

          {sidebarOpen ? (
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="absolute inset-0 z-20 bg-slate-950/20 xl:hidden"
              aria-label={copy.close}
            />
          ) : null}
        </div>

        {gameState !== "playing" && !isPaused ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/30 p-5 backdrop-blur-[6px]">
            <div className="w-full max-w-md rounded-[2.4rem] border border-white/65 bg-white/90 p-7 text-center shadow-[0_45px_95px_-55px_rgba(17,25,53,0.65)] backdrop-blur-xl">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#18c8a3] to-[#4f62ff] text-white shadow-[0_18px_40px_-24px_rgba(79,98,255,0.8)]">
                {gameState === "won" ? <TrophyIcon className="h-8 w-8" /> : <ClockIcon className="h-8 w-8" />}
              </div>

              <h2 className={`mt-5 ${isTamil ? "text-[2.5rem] font-semibold leading-tight tracking-[-0.02em]" : "text-3xl font-black tracking-[-0.05em]"} ${gameState === "won" ? "text-slate-950" : "text-rose-600"}`}>
                {overlayTitle}
              </h2>

              <p className={`mx-auto mt-3 max-w-sm text-slate-500 ${isTamil ? "text-[1rem] leading-7" : "text-sm leading-6"}`}>
                {gameState === "won"
                  ? copy.allFound
                  : lossReason === "mistakes"
                    ? copy.foundBeforeAttempts(foundCount)
                    : copy.foundBeforeTime(foundCount, grid.words.length)}
              </p>

              <div className="mt-6 rounded-[1.8rem] border border-slate-100 bg-[linear-gradient(180deg,#f8fbff,#f8fafc)] p-5">
                <p className={`text-slate-400 ${isTamil ? "text-[0.9rem] font-medium tracking-[0.02em]" : "text-[11px] font-black uppercase tracking-[0.24em]"}`}>
                  {copy.finalScore}
                </p>
                <div className="mt-2 text-5xl font-black tracking-[-0.06em] text-slate-950">
                  {score}
                </div>
              </div>

              <div className="mt-6 max-h-40 space-y-2 overflow-y-auto rounded-[1.6rem] border border-slate-100 bg-slate-50/80 p-4 text-left">
                {grid.words.map((entry, index) => {
                  const found = foundWords.includes(entry.word);
                  const color = PILL_COLORS[index % PILL_COLORS.length];

                  return (
                    <div key={entry.word} className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                            found ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                          }`}
                        >
                          {found ? <CheckIcon className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                        </span>
                        <span
                          className="font-tamil font-bold"
                          style={{ color: found ? color : "#94a3b8" }}
                        >
                          {entry.word}
                        </span>
                      </span>
                      {locale !== "ta" ? (
                        <span className="text-slate-400">{entry.translation[locale]}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#18c8a3] to-[#4f62ff] px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-white shadow-[0_22px_42px_-24px_rgba(79,98,255,0.8)]"
                >
                  <RotateCcwIcon className="h-4 w-4" />
                  {copy.replay}
                </button>

                <Link
                  href={`/${locale}/word-search`}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-slate-700"
                >
                  {copy.backToList}
                </Link>
              </div>

              {saveState.message ? (
                <p className={`mt-4 text-xs ${saveState.ok ? "text-emerald-700" : "text-rose-600"}`}>
                  {saveState.message}
                </p>
              ) : null}
            </div>
          </div>
        ) : null}

        <form ref={autoSaveFormRef} action={saveAction} className="hidden">
          <input type="hidden" name="gridId" value={grid.id} />
          <input type="hidden" name="score" value={score} />
          <input type="hidden" name="wordsFound" value={foundWords.length} />
          <input type="hidden" name="totalWords" value={grid.words.length} />
          <input type="hidden" name="timeUsedSeconds" value={timeUsedSeconds} />
          <input type="hidden" name="path" value={`/${locale}/word-search`} />
        </form>
      </div>
    </div>
  );
}
