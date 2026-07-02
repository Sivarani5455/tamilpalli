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
  "#cc9a3c",
  "#c1442e",
  "#4fa6a0",
  "#3f9a78",
  "#f0ce86",
  "#8fbab6",
  "#d2a348",
  "#a83b2b",
  "#6bb8b1",
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
  const [saveState, saveAction] = useActionState(saveWordSearchScoreAction, initialGameState);
  const draggingRef = useRef(false);
  const autoSaveFormRef = useRef<HTMLFormElement | null>(null);
  const hasSubmittedScoreRef = useRef(false);

  const score = foundWords.length * 100;
  const foundCount = foundWords.length;
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
      <li
        key={entry.word}
        className={`flex min-w-0 items-center gap-3 rounded-[14px] border px-3 py-3 transition-all duration-300 ${
          activePulse ? "scale-[1.02] shadow-[0_0_26px_rgba(204,154,60,0.18)]" : ""
        }`}
        style={{
          background: found
            ? "linear-gradient(180deg, rgba(63,154,120,0.20), rgba(63,154,120,0.06))"
            : "linear-gradient(180deg, rgba(244,236,220,0.05), rgba(244,236,220,0.015))",
          borderColor: found ? "rgba(63,154,120,0.45)" : "rgba(212,164,55,0.16)",
        }}
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            background: found ? "#3f9a78" : color,
            boxShadow: found ? "0 0 6px rgba(63,154,120,0.7)" : `0 0 6px ${color}99`,
          }}
        />
        <span
          className={`font-tamil min-w-0 flex-1 truncate font-semibold leading-tight ${
            isTamil ? "text-[1.18rem]" : "text-[1.08rem]"
          }`}
          style={{
            color: found ? "#8fbab6" : "#f4ecdc",
            textDecoration: found ? "line-through" : "none",
            textDecorationColor: found ? "rgba(143,186,182,0.5)" : "transparent",
          }}
        >
          {entry.word}
        </span>
        {found ? <CheckIcon className="h-4 w-4 shrink-0 text-[#3f9a78]" /> : null}
      </li>
    );
  };

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden bg-[#062022] px-[18px] py-[18px] text-[#f4ecdc]"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_-10%,rgba(204,154,60,0.10),transparent_45%),radial-gradient(circle_at_100%_0%,rgba(79,166,160,0.12),transparent_40%),linear-gradient(160deg,#0A2B2D_0%,#062022_100%)]" />

      <div className="relative mx-auto flex min-h-[calc(100dvh-36px)] max-w-[60rem] flex-col">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
              <Link
                href={`/${locale}/word-search`}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[rgba(212,164,55,0.16)] bg-[linear-gradient(180deg,rgba(244,236,220,0.06),rgba(244,236,220,0.02))] text-[#f0ce86] transition active:scale-95"
                aria-label={copy.back}
              >
                <ChevronLeftIcon className="h-5 w-5" />
              </Link>

              <div className="min-w-0">
              <p className={`font-display text-[#f0ce86] ${isTamil ? "text-[0.9rem] font-semibold tracking-[0.04em]" : "text-[11px] font-bold uppercase tracking-[0.14em]"}`}>
                  {copy.category}
                </p>
              <h1 className={`font-tamil truncate text-[#f4ecdc] ${isTamil ? "text-[1.75rem] font-bold" : "text-[1.65rem] font-bold"}`}>
                  {grid.title}
                </h1>
              </div>
            </div>

          <div className="flex w-full flex-wrap items-stretch gap-2 sm:w-auto">
              {toastWord ? (
                <div
                className="hidden rounded-[14px] border border-[rgba(212,164,55,0.16)] px-4 py-2 text-sm font-bold text-[#f4ecdc] sm:flex sm:items-center"
                  style={{ backgroundColor: toastWord.color }}
                >
                  +{toastWord.points} {copy.points}
                </div>
              ) : null}

            <div className="flex min-w-[78px] flex-1 flex-col gap-1 rounded-[14px] border border-[rgba(212,164,55,0.16)] bg-[linear-gradient(180deg,rgba(244,236,220,0.06),rgba(244,236,220,0.02))] px-3 py-2 sm:flex-none sm:px-4">
              <span className="font-display text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[#8fbab6]">
                  {copy.score}
              </span>
              <span className="text-lg font-bold tabular-nums text-[#f4ecdc]">
                  {score}
              </span>
              </div>

            <div className="flex min-w-[86px] flex-1 flex-col gap-1 rounded-[14px] border border-[rgba(212,164,55,0.16)] bg-[linear-gradient(180deg,rgba(244,236,220,0.06),rgba(244,236,220,0.02))] px-3 py-2 sm:flex-none sm:px-4">
              <span className="font-display text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[#8fbab6]">
                Streak
              </span>
              <div className="flex h-[18px] items-center gap-1.5">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => (
                  <span
                    key={index}
                    className="h-[9px] w-[9px] rounded-full border transition"
                    style={{
                      background: index < attemptsLeft ? "#c1442e" : "rgba(244,236,220,0.16)",
                      borderColor: index < attemptsLeft ? "#c1442e" : "rgba(212,164,55,0.35)",
                      boxShadow: index < attemptsLeft ? "0 0 8px rgba(193,68,46,0.7)" : "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex min-w-[98px] flex-1 flex-col gap-1 rounded-[14px] border border-[rgba(212,164,55,0.16)] bg-[linear-gradient(180deg,rgba(244,236,220,0.06),rgba(244,236,220,0.02))] px-3 py-2 sm:flex-none sm:px-4">
              <span className="font-display text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[#8fbab6]">
                  {copy.progress}
              </span>
              <span className="text-lg font-bold tabular-nums text-[#f4ecdc]">
                  {foundCount}/{grid.words.length}
              </span>
              </div>

            <div className="flex min-w-[82px] flex-1 flex-col gap-1 rounded-[14px] border border-[rgba(212,164,55,0.16)] bg-[linear-gradient(180deg,rgba(244,236,220,0.06),rgba(244,236,220,0.02))] px-3 py-2 sm:flex-none sm:px-4">
              <span className="font-display text-[10.5px] font-semibold uppercase tracking-[0.13em] text-[#8fbab6]">
                  {copy.time}
              </span>
              <span className={`text-lg font-bold tabular-nums ${isLowTime ? "text-[#f0ce86]" : "text-[#f4ecdc]"}`}>
                  {formatClock(timeLeft)}
              </span>
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
              className={`inline-flex min-h-[54px] min-w-[52px] items-center justify-center rounded-[14px] border px-4 text-[#f0ce86] transition active:scale-95 ${
                  isPaused
                  ? "border-[rgba(212,164,55,0.28)] bg-[linear-gradient(180deg,rgba(204,154,60,0.30),rgba(204,154,60,0.12))]"
                  : "border-[rgba(212,164,55,0.16)] bg-[linear-gradient(180deg,rgba(204,154,60,0.22),rgba(204,154,60,0.08))]"
                }`}
              aria-label={copy.pause}
              >
              {isPaused ? <PlayIcon className="h-6 w-6" /> : <PauseIcon className="h-6 w-6" />}
              </button>
            </div>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center gap-[18px]">
              {isPaused ? (
            <section className="w-full max-w-[32.5rem] rounded-[24px] border border-[rgba(212,164,55,0.16)] bg-[#0E3A3C] p-8 text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-[#f0ce86]">
                  {copy.pause}
                </p>
              <h2 className="mt-3 text-3xl font-bold tracking-[-0.03em] text-[#f4ecdc]">
                  {copy.paused}
                </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#8fbab6]">
                  {copy.pausedBody}
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                className="mt-7 inline-flex items-center gap-2 rounded-[14px] bg-[linear-gradient(160deg,#f0ce86,#cc9a3c)] px-6 py-3 text-sm font-bold text-[#1c1300]"
                >
                  <PlayIcon className="h-4 w-4" />
                  {copy.resume}
                </button>
                </section>
              ) : (
            <>
                    <div
                className="relative w-full max-w-[32.5rem] rounded-[22px] border border-[rgba(212,164,55,0.16)] bg-[linear-gradient(165deg,rgba(244,236,220,0.045),rgba(244,236,220,0.01)),#0E3A3C] p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]"
                style={{ maxWidth: boardWidth }}
                    >
                    <div
                  className="mx-auto grid touch-none select-none"
                      style={{
                        gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                    gap: columnCount <= 6 ? "10px" : `${Math.max(boardGap, 5)}px`,
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
                          className="font-tamil flex aspect-square items-center justify-center rounded-[16px] border font-semibold transition-all duration-150"
                              aria-label={`cell ${rowIndex}-${colIndex} ${letter}`}
                              style={{
                                fontSize:
                                  typeof letter === "string" && letter.length > 1
                                    ? `calc(${boardFontSize} - 0.06rem)`
                                    : boardFontSize,
                                lineHeight: 1,
                            color: "#f4ecdc",
                            background: found
                              ? "linear-gradient(160deg, rgba(204,154,60,0.55), rgba(193,68,46,0.30))"
                              : selected
                                ? "linear-gradient(160deg, rgba(79,166,160,0.45), rgba(79,166,160,0.18))"
                                : wrong
                                  ? "linear-gradient(160deg, rgba(193,68,46,0.45), rgba(193,68,46,0.16))"
                                  : "linear-gradient(160deg, rgba(244,236,220,0.10), rgba(244,236,220,0.02))",
                            borderColor: found
                              ? (foundColor ?? "#cc9a3c")
                              : selected
                                ? "#4fa6a0"
                                : wrong
                                  ? "#c1442e"
                                  : "rgba(212,164,55,0.22)",
                                boxShadow: found
                              ? "0 0 18px rgba(204,154,60,0.22)"
                                  : selected
                                ? "0 0 18px rgba(79,166,160,0.24)"
                                : "none",
                                transform: found
                              ? "scale(1)"
                                  : selected
                                ? "scale(0.96)"
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
                      </div>

              <section className="w-full max-w-[32.5rem] rounded-[22px] border border-[rgba(212,164,55,0.16)] bg-[linear-gradient(165deg,rgba(244,236,220,0.045),rgba(244,236,220,0.01)),#0E3A3C] p-5 shadow-[0_20px_50px_-25px_rgba(0,0,0,0.6)]">
                <div className="mb-4 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-[#f0ce86]">
                    {copy.wordsToFind}
                  </h2>
                  <span className="text-sm font-semibold text-[#8fbab6]">
                    {foundCount}/{grid.words.length} {copy.found}
                  </span>
                </div>
                <ul className="grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2">
                          {grid.words.map((entry, index) => renderWordCard(entry, index))}
                </ul>
              </section>
            </>
              )}
          </main>

        {gameState !== "playing" && !isPaused ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[rgba(6,32,34,0.78)] p-5 backdrop-blur-[6px]">
            <div className="w-full max-w-[20rem] rounded-[24px] border border-[rgba(212,164,55,0.16)] bg-[#0E3A3C] px-7 py-8 text-center shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[linear-gradient(160deg,#f0ce86,#cc9a3c)] text-[#1c1300]">
                {gameState === "won" ? <TrophyIcon className="h-8 w-8" /> : <ClockIcon className="h-8 w-8" />}
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-[-0.03em] text-[#f0ce86]">
                {overlayTitle}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#8fbab6]">
                {gameState === "won"
                  ? copy.allFound
                  : lossReason === "mistakes"
                    ? copy.foundBeforeAttempts(foundCount)
                    : copy.foundBeforeTime(foundCount, grid.words.length)}
              </p>

              <div className="mt-4 text-[34px] font-bold tabular-nums text-[#f4ecdc]">
                  {score}
                </div>

              <div className="mt-5 max-h-40 space-y-2 overflow-y-auto rounded-[16px] border border-[rgba(212,164,55,0.16)] bg-[rgba(244,236,220,0.035)] p-3 text-left">
                {grid.words.map((entry, index) => {
                  const found = foundWords.includes(entry.word);
                  const color = PILL_COLORS[index % PILL_COLORS.length];

                  return (
                    <div key={entry.word} className="flex items-center justify-between gap-4 text-sm">
                      <span className="flex items-center gap-2">
                        <span
                          className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                          found ? "bg-[#3f9a78]/20 text-[#3f9a78]" : "bg-[#c1442e]/20 text-[#c1442e]"
                          }`}
                        >
                          {found ? <CheckIcon className="h-3.5 w-3.5" /> : <XIcon className="h-3.5 w-3.5" />}
                        </span>
                        <span
                          className="font-tamil font-bold"
                          style={{ color: found ? color : "#9b8267" }}
                        >
                          {entry.word}
                        </span>
                      </span>
                      {locale !== "ta" ? (
                      <span className="text-[#8fbab6]">{entry.translation[locale]}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-[14px] bg-[linear-gradient(160deg,#f0ce86,#cc9a3c)] px-4 py-3 text-sm font-bold text-[#1c1300]"
                >
                  <RotateCcwIcon className="h-4 w-4" />
                  {copy.replay}
                </button>

                <Link
                  href={`/${locale}/word-search`}
                className="inline-flex items-center justify-center rounded-[14px] border border-[rgba(212,164,55,0.16)] bg-[rgba(244,236,220,0.05)] px-4 py-3 text-sm font-bold text-[#f4ecdc]"
                >
                  {copy.backToList}
                </Link>
              </div>

              {saveState.message ? (
              <p className={`mt-4 text-xs ${saveState.ok ? "text-[#3f9a78]" : "text-[#c1442e]"}`}>
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
