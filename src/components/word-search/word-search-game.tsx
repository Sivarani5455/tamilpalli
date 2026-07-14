"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState } from "react";

import { saveWordSearchScoreAction } from "@/app/[locale]/game-actions";
import { initialGameState } from "@/lib/action-states";
import type { DictionaryEntry, Locale, WordSearchGrid } from "@/types";

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

function StarIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="M13.5 3.5c.5 3-1.8 4.2-1.8 6.4 0 1.1.7 1.9 1.7 1.9 1.4 0 2.3-1.3 2.1-3.1 1.8 1.6 3 3.7 3 6a6.5 6.5 0 0 1-13 0c0-3.6 2-6.7 5.4-9-.2 2.3.5 3.6 1.5 4.1-.2-2.1.1-4.3 1.1-6.3Z" />
    </svg>
  );
}

function ListChecksIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <path d="m4 7 1.5 1.5L8 6" />
      <path d="M11 7h9" />
      <path d="m4 12 1.5 1.5L8 11" />
      <path d="M11 12h9" />
      <path d="m4 17 1.5 1.5L8 16" />
      <path d="M11 17h9" />
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

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg {...iconProps(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

const PILL_COLORS = [
  "#7c3aed",
  "#0f766e",
  "#be123c",
  "#0369a1",
  "#a16207",
  "#15803d",
  "#c2410c",
  "#4338ca",
  "#be185d",
  "#0e7490",
  "#4d7c0f",
  "#9333ea",
  "#b91c1c",
  "#047857",
  "#1d4ed8",
  "#b45309",
  "#6d28d9",
  "#9f1239",
  "#166534",
  "#075985",
];

function getFoundCellBackground(colorIndexes: number[]) {
  if (colorIndexes.length === 1) {
    return PILL_COLORS[colorIndexes[0] % PILL_COLORS.length];
  }

  const segmentSize = 100 / colorIndexes.length;
  const stops = colorIndexes.flatMap((colorIndex, index) => {
    const color = PILL_COLORS[colorIndex % PILL_COLORS.length];
    return [`${color} ${index * segmentSize}%`, `${color} ${(index + 1) * segmentSize}%`];
  });

  return `linear-gradient(135deg, ${stops.join(", ")})`;
}

const MAX_ATTEMPTS = 3;
const GAME_TIME_FALLBACK = 120;
const TOUCH_SELECTION_DELAY_MS = 220;
const TOUCH_GESTURE_THRESHOLD_PX = 10;

type CellCoord = [number, number];
type TouchGesture = {
  mode: "pending" | "scrolling" | "selecting";
  startX: number;
  startY: number;
  lastY: number;
  anchor: CellCoord;
  selectionTimer: number;
};

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

function normalizeDictionaryKey(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function WordSearchGame({
  grid,
  locale,
  dictionaryEntries = [],
}: {
  grid: WordSearchGrid;
  locale: Locale;
  dictionaryEntries?: DictionaryEntry[];
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
      ? `clamp(${Math.max(boardMinWidth, 320)}px, 76vmin, ${Math.max(boardMaxWidth, 680)}px)`
      : "min(76vmin, 680px)";
  const boardFontSize =
    columnCount >= 16 ? "clamp(0.58rem, 1.05vmin, 0.95rem)" :
    columnCount >= 13 ? "clamp(0.68rem, 1.25vmin, 1rem)" :
    columnCount >= 10 ? "clamp(0.8rem, 1.48vmin, 1.12rem)" :
    "clamp(0.92rem, 1.75vmin, 1.3rem)";

  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [foundPlacements, setFoundPlacements] = useState<Record<string, number[]>>({});
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
  const touchGestureRef = useRef<TouchGesture | null>(null);
  const autoSaveFormRef = useRef<HTMLFormElement | null>(null);
  const hasSubmittedScoreRef = useRef(false);

  const score = foundWords.length * 100;
  const foundCount = foundWords.length;
  const isLowTime = timeLeft <= 30 && gameState === "playing";
  const dictionaryEntryByWord = useMemo(() => {
    const entriesByWord = new Map<string, DictionaryEntry>();

    dictionaryEntries.forEach((dictionaryEntry) => {
      const candidates = [
        dictionaryEntry.translations.ta?.word,
        dictionaryEntry.translations.en?.word,
        dictionaryEntry.translations.fr?.word,
        ...dictionaryEntry.tamilSynonyms,
      ];

      candidates.forEach((candidate) => {
        if (!candidate) {
          return;
        }

        const key = normalizeDictionaryKey(candidate);

        if (key && !entriesByWord.has(key)) {
          entriesByWord.set(key, dictionaryEntry);
        }
      });
    });

    return entriesByWord;
  }, [dictionaryEntries]);
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
          dictionaryInfo: "அகராதி",
          type: "வகை",
          example: "உதாரணம்",
          description: "விளக்கம்",
          synonyms: "இணைச்சொற்கள்",
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
            dictionaryInfo: "Agarathi",
            type: "Type",
            example: "Exemple",
            description: "Description",
            synonyms: "Synonymes",
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
            dictionaryInfo: "Agarathi",
            type: "Type",
            example: "Example",
            description: "Description",
            synonyms: "Synonyms",
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
    return () => {
      const gesture = touchGestureRef.current;

      if (gesture) {
        window.clearTimeout(gesture.selectionTimer);
      }
    };
  }, []);

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
    const finishSelection = (event: MouseEvent | TouchEvent) => {
      if (event.type === "touchend" || event.type === "touchcancel") {
        const gesture = touchGestureRef.current;

        if (gesture) {
          window.clearTimeout(gesture.selectionTimer);
        }

        touchGestureRef.current = null;

        if (event.type === "touchcancel" || gesture?.mode !== "selecting") {
          draggingRef.current = false;
          setDragging(false);
          setAnchor(null);
          setHoverCell(null);
          return;
        }
      }

      if (!draggingRef.current || !anchor || !hoverCell || gameState !== "playing" || isPaused) {
        draggingRef.current = false;
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
              const key = cellKey(row, col);
              const currentColors = next[key] ?? [];
              next[key] = currentColors.includes(colorIdx) ? currentColors : [...currentColors, colorIdx];
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

      draggingRef.current = false;
      setDragging(false);
      setAnchor(null);
      setHoverCell(null);
    };

    window.addEventListener("mouseup", finishSelection);
    window.addEventListener("touchend", finishSelection);
    window.addEventListener("touchcancel", finishSelection);

    return () => {
      window.removeEventListener("mouseup", finishSelection);
      window.removeEventListener("touchend", finishSelection);
      window.removeEventListener("touchcancel", finishSelection);
    };
  }, [anchor, columnCount, foundWords, gameState, grid.gridData, grid.words, hoverCell, isPaused, rowCount]);

  const renderWordCard = (entry: WordSearchGrid["words"][number], index: number) => {
    const found = foundWords.includes(entry.word);
    const color = PILL_COLORS[index % PILL_COLORS.length];
    const activePulse = pulseWord === entry.word;
    const dictionaryEntry = dictionaryEntryByWord.get(normalizeDictionaryKey(entry.word));
    const dictionaryPrimaryWord =
      dictionaryEntry?.translations[locale]?.word ??
      dictionaryEntry?.translations.ta?.word ??
      dictionaryEntry?.translations.en?.word ??
      entry.word;
    const dictionaryTamilWord = dictionaryEntry?.translations.ta?.word;
    const dictionaryDescription = dictionaryEntry?.translations.ta?.description;

    return (
      <li
        key={entry.word}
        className={`relative flex min-w-0 items-center gap-2 overflow-visible rounded-[0.85rem] border-[3px] border-[#180d2b] px-3 py-2 transition-all duration-300 lg:w-max lg:min-w-[9.5rem] ${
          activePulse ? "scale-[1.02] shadow-[4px_5px_0_#180d2b]" : ""
        }`}
        style={{
          background: found ? "#e7fff3" : "#fff7ec",
          opacity: found ? 0.78 : 1,
        }}
      >
        <span
          className="h-2.5 w-2.5 shrink-0 rounded-full"
          style={{
            background: found ? "#3f9a78" : color,
            boxShadow: found ? "0 0 0 2px rgba(63,154,120,0.18)" : `0 0 0 2px ${color}33`,
          }}
        />
        <span
          className={`font-tamil min-w-0 flex-1 truncate font-semibold leading-tight lg:min-w-max lg:overflow-visible lg:whitespace-nowrap lg:text-clip ${
            isTamil ? "text-[1.18rem]" : "text-[1.08rem]"
          }`}
          style={{
            color: "#180d2b",
            textDecoration: found ? "line-through" : "none",
            textDecorationColor: found ? "#13885c" : "transparent",
          }}
        >
          {entry.word}
        </span>
        {dictionaryEntry ? (
          <span className="group/info relative shrink-0">
            <button
              type="button"
              className="flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-[#180d2b] bg-white text-[#7c3aed] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/45"
              aria-label={`${copy.dictionaryInfo}: ${entry.word}`}
            >
              <InfoIcon className="h-4 w-4" />
            </button>

            <span className="pointer-events-none absolute bottom-[calc(100%+0.75rem)] right-0 z-30 hidden w-[min(18rem,78vw)] rounded-[18px] border border-[rgba(212,164,55,0.28)] bg-[#3a271b]/98 p-4 text-left text-[#f4ecdc] shadow-[0_24px_60px_-28px_rgba(0,0,0,0.78)] backdrop-blur group-hover/info:block group-focus-within/info:block">
              <span className="mb-3 flex items-start gap-3">
                {dictionaryEntry.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={dictionaryEntry.imageUrl}
                    alt={dictionaryPrimaryWord}
                    loading="lazy"
                    decoding="async"
                    className="h-14 w-14 shrink-0 rounded-[14px] border border-[rgba(212,164,55,0.22)] object-cover"
                  />
                ) : (
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[14px] border border-[rgba(212,164,55,0.22)] bg-[rgba(244,236,220,0.06)] font-tamil text-2xl text-[#f0ce86]">
                    {dictionaryTamilWord?.charAt(0) ?? dictionaryPrimaryWord.charAt(0)}
                  </span>
                )}

                <span className="min-w-0">
                  <span className="block text-[0.64rem] font-bold uppercase tracking-[0.18em] text-[#f0ce86]">
                    {copy.dictionaryInfo}
                  </span>
                  <span className="mt-1 block truncate font-tamil text-xl font-semibold leading-tight text-[#f4ecdc]">
                    {dictionaryPrimaryWord}
                  </span>
                  {locale !== "ta" && dictionaryTamilWord ? (
                    <span className="mt-1 block truncate font-tamil text-sm text-[#8fbab6]">
                      {dictionaryTamilWord}
                    </span>
                  ) : null}
                </span>
              </span>

              {dictionaryEntry.type ? (
                <span className="mb-2 inline-flex rounded-full bg-[rgba(240,206,134,0.12)] px-2.5 py-1 text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#f0ce86]">
                  {copy.type}: {dictionaryEntry.type}
                </span>
              ) : null}

              {dictionaryDescription ? (
                <span className="block font-tamil text-sm leading-6 text-[#ead2ae]">
                  <span className="font-semibold text-[#f4ecdc]">{copy.description}: </span>
                  {dictionaryDescription}
                </span>
              ) : null}

              {dictionaryEntry.example ? (
                <span className="mt-2 block text-sm leading-6 text-[#d9c3a3]">
                  <span className="font-semibold text-[#f4ecdc]">{copy.example}: </span>
                  {dictionaryEntry.example}
                </span>
              ) : null}

              {dictionaryEntry.tamilSynonyms.length > 0 ? (
                <span className="mt-3 block">
                  <span className="mb-1 block text-[0.62rem] font-bold uppercase tracking-[0.14em] text-[#f0ce86]">
                    {copy.synonyms}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {dictionaryEntry.tamilSynonyms.slice(0, 5).map((synonym) => (
                      <span
                        key={synonym}
                        className="rounded-full border border-[rgba(212,164,55,0.24)] bg-[rgba(244,236,220,0.06)] px-2 py-1 font-tamil text-xs text-[#ead2ae]"
                      >
                        {synonym}
                      </span>
                    ))}
                  </span>
                </span>
              ) : null}
            </span>
          </span>
        ) : null}
        {found ? <CheckIcon className="h-4 w-4 shrink-0 text-[#13885c]" /> : null}
      </li>
    );
  };

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden bg-[#fff7ec] px-3 py-4 text-[#180d2b] sm:px-5 sm:py-5"
      style={{
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <div className="relative mx-auto flex min-h-[calc(100dvh-32px)] max-w-[48rem] flex-col">
        <header className="-mx-3 -mt-4 mb-3 bg-[#fff7ec] px-3 pb-3 pt-4 sm:hidden">
          <div className="grid grid-cols-[2.5rem_1fr_2.75rem] items-center gap-3">
            <Link
              href={`/${locale}/word-search`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#180d2b] bg-white text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:bg-[#fff2cf] active:shadow-none"
              aria-label={copy.back}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Link>

            <div className={`flex items-center justify-center gap-1.5 text-sm font-black tabular-nums ${isLowTime ? "text-[#ff3b6f]" : "text-[#180d2b]"}`}>
              <ClockIcon className="h-4 w-4 text-[#d8c998]" />
              <span>{formatClock(timeLeft)}</span>
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#2f7fdf] text-white transition hover:bg-[#3b8ced] active:scale-95"
              aria-label={copy.pause}
            >
              {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-[0.65rem] bg-[#181818] px-3 py-2.5">
              <p className="text-xs font-medium text-[#e5e5e5]">{copy.score}</p>
              <p className="mt-1 text-2xl font-medium leading-none tabular-nums text-white">
                {toastWord ? `+${toastWord.points}` : score}
              </p>
            </div>

            <div className="rounded-[0.65rem] bg-[#181818] px-3 py-2.5">
              <p className="text-xs font-medium text-[#e5e5e5]">
                {locale === "fr" ? "Série" : locale === "ta" ? "தொடர்" : "Streak"}
              </p>
              <div className="mt-2.5 flex h-3 items-center gap-1">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-2.5 w-2.5 rounded-full ${index < attemptsLeft ? "bg-[#ef4b55]" : "bg-[#555]"}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-2 rounded-[0.65rem] bg-[#181818] px-3 py-2.5">
            <div className="flex items-center justify-between gap-3 text-xs font-medium text-[#e5e5e5]">
              <span>{copy.progress}</span>
              <span className="font-black tabular-nums text-white">{foundCount}/{grid.words.length}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#444]">
              <div
                className="h-full rounded-full bg-[#2f7fdf] transition-[width] duration-300"
                style={{ width: `${grid.words.length > 0 ? (foundCount / grid.words.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </header>

        <header className="-mx-5 -mt-5 mb-3 hidden bg-[#fff7ec] px-4 py-2.5 sm:block">
          <div className="grid w-full grid-cols-[2.5rem_repeat(4,minmax(0,1fr))_2.75rem] items-center gap-2.5">
            <Link
              href={`/${locale}/word-search`}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#180d2b] bg-white text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:bg-[#fff2cf] active:shadow-none"
              aria-label={copy.back}
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </Link>

            <div className="flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center rounded-[0.65rem] border border-[#4b4b4b] bg-[#303030] px-1.5 py-1.5">
              <StarIcon className="h-4 w-4 text-[#b7ae93]" />
              <span className="mt-1 truncate text-[0.64rem] font-medium text-[#e5e5e5]">{copy.score}</span>
              <span className="text-base font-medium leading-tight tabular-nums text-white">{toastWord ? `+${toastWord.points}` : score}</span>
            </div>

            <div className="flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center rounded-[0.65rem] border border-[#4b4b4b] bg-[#303030] px-1.5 py-1.5">
              <FlameIcon className="h-4 w-4 text-[#9d9d9d]" />
              <span className="mt-1 truncate text-[0.64rem] font-medium text-[#e5e5e5]">
                {locale === "fr" ? "Série" : locale === "ta" ? "தொடர்" : "Streak"}
              </span>
              <div className="mt-1 flex h-3 items-center gap-1">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => (
                  <span
                    key={index}
                    className={`h-2 w-2 rounded-full ${index < attemptsLeft ? "bg-[#ef4b55]" : "bg-[#666]"}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center rounded-[0.65rem] border border-[#4b4b4b] bg-[#303030] px-1.5 py-1.5">
              <ListChecksIcon className="h-4 w-4 text-[#9d9d9d]" />
              <span className="mt-1 truncate text-[0.64rem] font-medium text-[#e5e5e5]">{copy.progress}</span>
              <span className="text-base font-medium leading-tight tabular-nums text-white">{foundCount}/{grid.words.length}</span>
            </div>

            <div className="flex min-h-[4.5rem] min-w-0 flex-col items-center justify-center rounded-[0.65rem] border border-[#4b4b4b] bg-[#303030] px-1.5 py-1.5">
              <ClockIcon className="h-4 w-4 text-[#9d9d9d]" />
              <span className="mt-1 truncate text-[0.64rem] font-medium text-[#e5e5e5]">{copy.time}</span>
              <span className={`text-base font-medium leading-tight tabular-nums ${isLowTime ? "text-[#ff5b68]" : "text-white"}`}>
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
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#2f7fdf] text-white transition hover:bg-[#3b8ced] active:scale-95"
              aria-label={copy.pause}
            >
              {isPaused ? <PlayIcon className="h-5 w-5" /> : <PauseIcon className="h-5 w-5" />}
            </button>
          </div>
        </header>

        <header className="hidden">
          <Link
            href={`/${locale}/word-search`}
            className="absolute left-0 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border-2 border-[#180d2b] bg-white text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:bg-[#fff2cf] active:shadow-none sm:h-9 sm:w-9 lg:h-11 lg:w-11 lg:border-[3px] lg:shadow-[4px_5px_0_#180d2b]"
            aria-label={copy.back}
          >
            <ChevronLeftIcon className="h-4 w-4 lg:h-5 lg:w-5" />
          </Link>

          <div className="flex shrink-0 flex-nowrap items-stretch gap-2">
            <div className="flex overflow-hidden rounded-[0.7rem] border-2 border-[#180d2b] bg-white shadow-[2px_3px_0_#180d2b] lg:gap-2 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:shadow-none">
            <div
              className={`flex w-[2.4rem] flex-col justify-center gap-0.5 border-r-2 border-[#180d2b] px-1 py-1 transition-all duration-300 sm:w-[3.1rem] sm:px-1.5 lg:w-auto lg:min-w-[70px] lg:gap-1 lg:rounded-[0.85rem] lg:border-[3px] lg:px-3 lg:py-2 lg:shadow-[3px_4px_0_#180d2b] ${
                toastWord ? "text-white lg:scale-[1.04]" : "bg-white"
              }`}
              style={toastWord ? { backgroundColor: toastWord.color } : undefined}
            >
              <span className={`truncate font-display text-[0.42rem] font-black uppercase tracking-[0.03em] sm:text-[0.5rem] lg:text-[0.58rem] lg:tracking-[0.13em] ${toastWord ? "text-white" : "text-[#7c3aed]"}`}>
                  {copy.score}
              </span>
              <span className={`truncate text-xs font-black tabular-nums sm:text-sm lg:text-lg ${toastWord ? "text-white" : "text-[#180d2b]"}`}>
                  {toastWord ? `+${toastWord.points}` : score}
              </span>
              </div>

            <div className="flex w-[2.65rem] flex-col justify-center gap-0.5 border-r-2 border-[#180d2b] bg-white px-1 py-1 sm:w-[3.6rem] sm:px-1.5 lg:w-auto lg:min-w-[82px] lg:gap-1 lg:rounded-[0.85rem] lg:border-[3px] lg:px-3 lg:py-2 lg:shadow-[3px_4px_0_#180d2b]">
              <span className="truncate font-display text-[0.42rem] font-black uppercase tracking-[0.03em] text-[#7c3aed] sm:text-[0.5rem] lg:text-[0.58rem] lg:tracking-[0.13em]">
                Streak
              </span>
              <div className="flex h-3 items-center gap-0.5 sm:h-4 sm:gap-1 lg:h-[18px] lg:gap-1.5">
                {Array.from({ length: MAX_ATTEMPTS }).map((_, index) => (
                  <span
                    key={index}
                    className="h-1.5 w-1.5 rounded-full border transition sm:h-2 sm:w-2 lg:h-[9px] lg:w-[9px]"
                    style={{
                      background: index < attemptsLeft ? "#c1442e" : "rgba(244,236,220,0.16)",
                      borderColor: index < attemptsLeft ? "#ff3b6f" : "#180d2b",
                      boxShadow: "none",
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex w-[2.95rem] flex-col justify-center gap-0.5 border-r-2 border-[#180d2b] bg-white px-1 py-1 sm:w-16 sm:px-1.5 lg:w-auto lg:min-w-[92px] lg:gap-1 lg:rounded-[0.85rem] lg:border-[3px] lg:px-3 lg:py-2 lg:shadow-[3px_4px_0_#180d2b]">
              <span className="truncate font-display text-[0.42rem] font-black uppercase tracking-[0.03em] text-[#7c3aed] sm:text-[0.5rem] lg:text-[0.58rem] lg:tracking-[0.13em]">
                  {copy.progress}
              </span>
              <span className="text-xs font-black tabular-nums text-[#180d2b] sm:text-sm lg:text-lg">
                  {foundCount}/{grid.words.length}
              </span>
              </div>

            <div className="flex w-[3.1rem] flex-col justify-center gap-0.5 bg-white px-1 py-1 sm:w-[3.75rem] sm:px-1.5 lg:w-auto lg:min-w-[78px] lg:gap-1 lg:rounded-[0.85rem] lg:border-[3px] lg:border-[#180d2b] lg:px-3 lg:py-2 lg:shadow-[3px_4px_0_#180d2b]">
              <span className="truncate font-display text-[0.42rem] font-black uppercase tracking-[0.03em] text-[#7c3aed] sm:text-[0.5rem] lg:text-[0.58rem] lg:tracking-[0.13em]">
                  {copy.time}
              </span>
              <span className={`text-xs font-black tabular-nums sm:text-sm lg:text-lg ${isLowTime ? "text-[#ff3b6f]" : "text-[#180d2b]"}`}>
                  {formatClock(timeLeft)}
              </span>
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
              className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#180d2b] text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5 active:translate-y-0.5 sm:h-10 sm:w-10 lg:min-h-[54px] lg:min-w-[52px] lg:border-[3px] lg:px-4 lg:shadow-[4px_5px_0_#180d2b] lg:active:shadow-[2px_2px_0_#180d2b] ${
                  isPaused
                  ? "bg-[#b7ff2a]"
                  : "bg-[#ffc43d]"
                }`}
              aria-label={copy.pause}
              >
              {isPaused ? <PlayIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-6 lg:w-6" /> : <PauseIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-6 lg:w-6" />}
              </button>
            </div>
        </header>

        <main
          className={`flex flex-1 flex-col items-center gap-4 lg:flex-none lg:justify-start ${
            isPaused ? "justify-start pt-1" : "justify-center"
          }`}
        >
              {isPaused ? (
            <section className="w-full max-w-[32.5rem] rounded-[1.4rem] border-[3px] border-[#180d2b] bg-white p-8 text-center shadow-[8px_9px_0_#180d2b]">
              <p className="font-display text-xs font-black uppercase tracking-[0.14em] text-[#7c3aed]">
                  {copy.pause}
                </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-[#180d2b]">
                  {copy.paused}
                </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm font-bold leading-6 text-[#6b5441]">
                  {copy.pausedBody}
                </p>
                <button
                  type="button"
                  onClick={() => setIsPaused(false)}
                className="mt-7 inline-flex items-center gap-2 rounded-[1rem] border-[3px] border-[#180d2b] bg-[#c6ff2e] px-6 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b]"
                >
                  <PlayIcon className="h-4 w-4" />
                  {copy.resume}
                </button>
                </section>
              ) : (
            <>
                    <div
                className="relative w-full max-w-[32.5rem] rounded-[1rem] border border-[#d2d0ca] bg-[#f1f0ec] p-3 sm:p-4"
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
                        const gesture = touchGestureRef.current;
                        const touch = event.touches[0];

                        if (!gesture || !touch) {
                          return;
                        }

                        const deltaX = touch.clientX - gesture.startX;
                        const deltaY = touch.clientY - gesture.startY;

                        if (gesture.mode === "pending") {
                          const isVerticalScroll =
                            Math.abs(deltaY) >= TOUCH_GESTURE_THRESHOLD_PX &&
                            Math.abs(deltaY) > Math.abs(deltaX) * 1.2;
                          const isSelectionDrag =
                            Math.hypot(deltaX, deltaY) >= TOUCH_GESTURE_THRESHOLD_PX;

                          if (isVerticalScroll) {
                            window.clearTimeout(gesture.selectionTimer);
                            gesture.mode = "scrolling";
                            draggingRef.current = false;
                            setDragging(false);
                            setAnchor(null);
                            setHoverCell(null);
                          } else if (isSelectionDrag) {
                            window.clearTimeout(gesture.selectionTimer);
                            gesture.mode = "selecting";
                            draggingRef.current = true;
                            setDragging(true);
                            setAnchor(gesture.anchor);
                            setHoverCell(gesture.anchor);
                          }
                        }

                        if (gesture.mode === "scrolling") {
                          window.scrollBy({ top: gesture.lastY - touch.clientY, behavior: "auto" });
                          gesture.lastY = touch.clientY;
                          return;
                        }

                        if (gesture.mode !== "selecting") {
                          return;
                        }

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
                          const foundColorIndexes = foundPlacements[key] ?? [];
                          const found = foundColorIndexes.length > 0;
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
                                draggingRef.current = true;
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
                                if (gameState !== "playing" || isPaused) {
                                  return;
                                }

                                const touch = event.touches[0];

                                if (!touch) {
                                  return;
                                }

                                const currentGesture = touchGestureRef.current;

                                if (currentGesture) {
                                  window.clearTimeout(currentGesture.selectionTimer);
                                }

                                const nextGesture: TouchGesture = {
                                  mode: "pending",
                                  startX: touch.clientX,
                                  startY: touch.clientY,
                                  lastY: touch.clientY,
                                  anchor: [rowIndex, colIndex],
                                  selectionTimer: 0,
                                };

                                nextGesture.selectionTimer = window.setTimeout(() => {
                                  if (touchGestureRef.current !== nextGesture || nextGesture.mode !== "pending") {
                                    return;
                                  }

                                  nextGesture.mode = "selecting";
                                  draggingRef.current = true;
                                  setDragging(true);
                                  setAnchor(nextGesture.anchor);
                                  setHoverCell(nextGesture.anchor);
                                }, TOUCH_SELECTION_DELAY_MS);

                                touchGestureRef.current = nextGesture;
                              }}
                          className="font-tamil flex aspect-square items-center justify-center rounded-[0.45rem] border border-[#c9c7c2] bg-[#f8f8f6] font-black text-[#181818] transition-[background-color,border-color,box-shadow] duration-150"
                              aria-label={`cell ${rowIndex}-${colIndex} ${letter}`}
                              style={{
                                fontSize:
                                  typeof letter === "string" && letter.length > 1
                                    ? `calc(${boardFontSize} - 0.06rem)`
                                    : boardFontSize,
                                lineHeight: 1,
                            color: found ? "#ffffff" : "#181818",
                            background: found
                              ? getFoundCellBackground(foundColorIndexes)
                              : selected
                                ? "#ececea"
                                : wrong
                                  ? "#f0f0ed"
                                  : "#f8f8f6",
                            borderColor: found
                              ? "#181818"
                              : selected
                                ? "#181818"
                                : wrong
                                  ? "#8e8b85"
                                  : "#c9c7c2",
                                boxShadow: found
                              ? "inset 0 0 0 1px rgba(255,255,255,0.35)"
                                  : selected
                                ? "inset 0 0 0 1px #181818"
                                : "none",
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

              <section className="w-full max-w-[32.5rem] rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-4 shadow-[7px_8px_0_#180d2b] sm:p-5 lg:w-max lg:max-w-[calc(100vw-2rem)]">
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <h2 className="font-display text-xs font-black uppercase tracking-[0.14em] text-[#9a83b3]">
                    {copy.wordsToFind}
                  </h2>
                  <span className="rounded-full border-[2px] border-[#180d2b] bg-[#c6ff2e] px-3 py-1 text-xs font-black text-[#180d2b]">
                    {foundCount}/{grid.words.length} {copy.found}
                  </span>
                </div>
                <ul className="grid list-none grid-cols-1 gap-2.5 p-0 sm:grid-cols-2 lg:grid-flow-col lg:grid-cols-none lg:grid-rows-2 lg:auto-cols-max lg:overflow-x-auto lg:pb-2 [scrollbar-width:thin]">
                          {grid.words.map((entry, index) => renderWordCard(entry, index))}
                </ul>
              </section>
            </>
              )}
          </main>

        {gameState !== "playing" && !isPaused ? (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#180d2b]/45 p-5 backdrop-blur-[6px]">
            <div className="w-full max-w-[20rem] rounded-[1.5rem] border-[3px] border-[#180d2b] bg-white px-7 py-8 text-center shadow-[8px_9px_0_#180d2b]">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] text-[#180d2b] shadow-[4px_5px_0_#180d2b]">
                {gameState === "won" ? <TrophyIcon className="h-8 w-8" /> : <ClockIcon className="h-8 w-8" />}
              </div>

              <h2 className="mt-4 text-2xl font-black tracking-[-0.03em] text-[#180d2b]">
                {overlayTitle}
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm font-bold leading-6 text-[#6b5441]">
                {gameState === "won"
                  ? copy.allFound
                  : lossReason === "mistakes"
                    ? copy.foundBeforeAttempts(foundCount)
                    : copy.foundBeforeTime(foundCount, grid.words.length)}
              </p>

              <div className="mt-4 text-[34px] font-black tabular-nums text-[#180d2b]">
                  {score}
                </div>

              <div className="mt-5 max-h-40 space-y-2 overflow-y-auto rounded-[1rem] border-[2px] border-[#180d2b] bg-[#fff7ec] p-3 text-left">
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
                      <span className="text-[#6b5441]">{entry.translation[locale]}</span>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 rounded-[1rem] border-[3px] border-[#180d2b] bg-[#ffc43d] px-4 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b]"
                >
                  <RotateCcwIcon className="h-4 w-4" />
                  {copy.replay}
                </button>

                <Link
                  href={`/${locale}/word-search`}
                className="inline-flex items-center justify-center rounded-[1rem] border-[3px] border-[#180d2b] bg-white px-4 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b]"
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
