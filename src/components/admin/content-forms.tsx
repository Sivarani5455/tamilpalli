"use client";

import { useActionState, useState } from "react";

import {
  upsertFillBlankAction,
  upsertImageHuntAction,
  upsertWordSearchAction,
} from "@/app/[locale]/admin/content-actions";
import { initialCrudState } from "@/lib/action-states";
import type {
  FillBlankExercise,
  ImageHuntExercise,
  Locale,
  WordSearchGrid,
  WordSearchWord,
} from "@/types";

function StatusMessage({ message, ok }: { message: string; ok: boolean }) {
  if (!message) {
    return null;
  }

  return <p className={`text-sm ${ok ? "text-emerald-700" : "text-rose-600"}`}>{message}</p>;
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const GRID_SIZE_OPTIONS = [4, 8, 12, 16, 20] as const;
const WORD_SEARCH_DIRECTIONS = [
  [0, 1],
  [0, -1],
  [1, 0],
  [-1, 0],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;
const FALLBACK_TAMIL_FILLERS = ["அ", "ஆ", "இ", "உ", "எ", "க", "த", "ம", "ன", "ல"];

type WordPlacement = {
  word: string;
  row: number;
  col: number;
  rowStep: number;
  colStep: number;
  length: number;
};

const DIRECTION_GROUP_OPTIONS = [
  { key: "horizontal", label: "Horizontales" },
  { key: "vertical", label: "Verticales" },
  { key: "diagonal", label: "Diagonales" },
] as const;

type DirectionGroupKey = (typeof DIRECTION_GROUP_OPTIONS)[number]["key"];
type DirectionSelection = Record<DirectionGroupKey, boolean>;

const DIRECTION_LABELS: Record<string, string> = {
  "0,1": "horizontal droite",
  "0,-1": "horizontal gauche",
  "1,0": "vertical bas",
  "-1,0": "vertical haut",
  "1,1": "diagonale ↘",
  "1,-1": "diagonale ↙",
  "-1,1": "diagonale ↗",
  "-1,-1": "diagonale ↖",
};

function splitTamilWord(word: string) {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter("ta", { granularity: "grapheme" });
    return Array.from(segmenter.segment(word), (segment) => segment.segment).filter(Boolean);
  }

  return Array.from(word);
}

function parseTamilWords(raw: string) {
  const uniqueWords = new Set<string>();

  raw
    .split(/\r?\n|,|;/)
    .map((word) => word.trim())
    .filter(Boolean)
    .forEach((word) => uniqueWords.add(word));

  return Array.from(uniqueWords);
}

function createWordJson(words: string[]): WordSearchWord[] {
  return words.map((word) => ({
    word,
    translation: {
      ta: word,
      en: "",
      fr: "",
    },
  }));
}

function formatGridDataJson(gridData: string[][]) {
  if (gridData.length === 0) {
    return "";
  }

  const rows = gridData.map((row) => `  [${row.map((cell) => JSON.stringify(cell)).join(", ")}]`);
  return `[\n${rows.join(",\n")}\n]`;
}

function formatWordsJson(words: WordSearchWord[]) {
  if (words.length === 0) {
    return "";
  }

  const entries = words.map(
    (entry) =>
      `  { "word": ${JSON.stringify(entry.word)}, "translation": { "ta": ${JSON.stringify(entry.translation.ta)}, "en": ${JSON.stringify(entry.translation.en)}, "fr": ${JSON.stringify(entry.translation.fr)} } }`,
  );

  return `[\n${entries.join(",\n")}\n]`;
}

function countTamilGlyphs(words: string[]) {
  return words.reduce((total, word) => total + splitTamilWord(word).length, 0);
}

function resolveDirections(selection: DirectionSelection) {
  return WORD_SEARCH_DIRECTIONS.filter(([rowStep, colStep]) => {
    if (rowStep === 0) {
      return selection.horizontal;
    }

    if (colStep === 0) {
      return selection.vertical;
    }

    return selection.diagonal;
  });
}

function hasWordInGrid(
  grid: string[][],
  glyphs: string[],
  directions: ReadonlyArray<readonly [number, number]>,
) {
  const rowCount = grid.length;
  const columnCount = grid[0]?.length ?? 0;

  for (let row = 0; row < rowCount; row += 1) {
    for (let col = 0; col < columnCount; col += 1) {
      for (const [rowStep, colStep] of directions) {
        const endRow = row + rowStep * (glyphs.length - 1);
        const endCol = col + colStep * (glyphs.length - 1);

        if (endRow < 0 || endRow >= rowCount || endCol < 0 || endCol >= columnCount) {
          continue;
        }

        let matches = true;

        for (let index = 0; index < glyphs.length; index += 1) {
          if (grid[row + rowStep * index][col + colStep * index] !== glyphs[index]) {
            matches = false;
            break;
          }
        }

        if (matches) {
          return true;
        }
      }
    }
  }

  return false;
}

function validateGeneratedGrid(
  grid: string[][],
  preparedWords: Array<{ word: string; glyphs: string[] }>,
  directions: ReadonlyArray<readonly [number, number]>,
) {
  return preparedWords.every((entry) => hasWordInGrid(grid, entry.glyphs, directions));
}

function formatPlacement(placement: WordPlacement) {
  const endRow = placement.row + placement.rowStep * (placement.length - 1);
  const endCol = placement.col + placement.colStep * (placement.length - 1);
  const directionKey = `${placement.rowStep},${placement.colStep}`;

  return {
    direction: DIRECTION_LABELS[directionKey] ?? directionKey,
    start: `(${placement.row + 1}, ${placement.col + 1})`,
    end: `(${endRow + 1}, ${endCol + 1})`,
  };
}

function generateWordSearchGrid(
  words: string[],
  size: number,
  directionSelection: DirectionSelection,
) {
  const preparedWords = words
    .map((word) => ({ word, glyphs: splitTamilWord(word) }))
    .sort((left, right) => right.glyphs.length - left.glyphs.length);
  const allowedDirections = resolveDirections(directionSelection);

  if (preparedWords.length === 0) {
    return {
      gridData: [],
      words: [] as WordSearchWord[],
      placements: [] as WordPlacement[],
      error: "Collez au moins un mot tamoul pour generer la grille.",
    };
  }

  if (allowedDirections.length === 0) {
    return {
      gridData: [],
      words: createWordJson(words),
      placements: [] as WordPlacement[],
      error: "Cochez au moins un type de direction : horizontale, verticale ou diagonale.",
    };
  }

  const tooLongWord = preparedWords.find((entry) => entry.glyphs.length > size);
  const totalGlyphs = preparedWords.reduce((total, entry) => total + entry.glyphs.length, 0);
  const gridCapacity = size * size;

  if (tooLongWord) {
    return {
      gridData: [],
      words: createWordJson(words),
      placements: [] as WordPlacement[],
      error: `Le mot "${tooLongWord.word}" ne rentre pas dans une grille ${size}x${size}.`,
    };
  }

  if (totalGlyphs > gridCapacity) {
    return {
      gridData: [],
      words: createWordJson(words),
      placements: [] as WordPlacement[],
      error: `La grille ${size}x${size} contient ${gridCapacity} cases, mais vos mots demandent ${totalGlyphs} syllabes au total.`,
    };
  }

  const fillerPool =
    preparedWords.flatMap((entry) => entry.glyphs).filter(Boolean).length > 0
      ? preparedWords.flatMap((entry) => entry.glyphs).filter(Boolean)
      : FALLBACK_TAMIL_FILLERS;

  for (let attempt = 0; attempt < 80; attempt += 1) {
    const grid = Array.from({ length: size }, () => Array<string | null>(size).fill(null));
    const placements: WordPlacement[] = [];
    let placedAllWords = true;

    for (const entry of preparedWords) {
      const candidates: Array<{ row: number; col: number; rowStep: number; colStep: number }> = [];

      for (let row = 0; row < size; row += 1) {
        for (let col = 0; col < size; col += 1) {
          for (const [rowStep, colStep] of allowedDirections) {
            const endRow = row + rowStep * (entry.glyphs.length - 1);
            const endCol = col + colStep * (entry.glyphs.length - 1);

            if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) {
              continue;
            }

            let canPlace = true;

            for (let index = 0; index < entry.glyphs.length; index += 1) {
              const cell = grid[row + rowStep * index][col + colStep * index];

              if (cell !== null && cell !== entry.glyphs[index]) {
                canPlace = false;
                break;
              }
            }

            if (canPlace) {
              candidates.push({ row, col, rowStep, colStep });
            }
          }
        }
      }

      if (candidates.length === 0) {
        placedAllWords = false;
        break;
      }

      const choice = candidates[Math.floor(Math.random() * candidates.length)];

      for (let index = 0; index < entry.glyphs.length; index += 1) {
        grid[choice.row + choice.rowStep * index][choice.col + choice.colStep * index] = entry.glyphs[index];
      }

      placements.push({
        word: entry.word,
        row: choice.row,
        col: choice.col,
        rowStep: choice.rowStep,
        colStep: choice.colStep,
        length: entry.glyphs.length,
      });
    }

    if (!placedAllWords) {
      continue;
    }

    const filledGrid = grid.map((row) =>
      row.map((cell) => cell ?? fillerPool[Math.floor(Math.random() * fillerPool.length)]),
    );

    if (!validateGeneratedGrid(filledGrid, preparedWords, allowedDirections)) {
      continue;
    }

    return {
      gridData: filledGrid,
      words: createWordJson(words),
      placements,
      error: "",
    };
  }

  return {
    gridData: [],
    words: createWordJson(words),
    placements: [] as WordPlacement[],
    error: `Impossible de placer tous les mots dans une grille ${size}x${size}. Essayez une taille plus grande.`,
  };
}

export function WordSearchAdminForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial?: WordSearchGrid | null;
}) {
  const initialGridSize = initial?.gridData.length;
  const normalizedInitialGridSize =
    initialGridSize && GRID_SIZE_OPTIONS.includes(initialGridSize as (typeof GRID_SIZE_OPTIONS)[number])
      ? (initialGridSize as (typeof GRID_SIZE_OPTIONS)[number])
      : null;

  const [state, action, pending] = useActionState(upsertWordSearchAction, initialCrudState);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [description, setDescription] = useState(initial?.description ?? "");
  const [gridSize, setGridSize] = useState<number | null>(initialGridSize ?? normalizedInitialGridSize);
  const [rawTamilWords, setRawTamilWords] = useState(
    initial?.words.map((entry) => entry.word).join("\n") ?? "",
  );
  const [directionSelection, setDirectionSelection] = useState<DirectionSelection>({
    horizontal: true,
    vertical: true,
    diagonal: true,
  });
  const [gridDataJson, setGridDataJson] = useState(
    initial?.gridData ? formatGridDataJson(initial.gridData) : "",
  );
  const [wordsJson, setWordsJson] = useState(
    initial?.words ? formatWordsJson(initial.words) : "",
  );
  const [placementPreview, setPlacementPreview] = useState<WordPlacement[]>([]);
  const [generationError, setGenerationError] = useState("");
  const [generationSummary, setGenerationSummary] = useState(
    initial?.words.length
      ? `${initial.words.length} mot${initial.words.length > 1 ? "s" : ""} prets dans une grille ${initial.gridData.length}x${initial.gridData[0]?.length ?? initial.gridData.length}.`
      : "Choisissez d'abord une taille de grille pour lancer la generation.",
  );

  const syncGeneratedContent = (
    nextRawTamilWords: string,
    nextGridSize: number | null,
    nextDirectionSelection: DirectionSelection = directionSelection,
  ) => {
    if (!nextGridSize) {
      setGridDataJson("");
      setWordsJson("");
      setPlacementPreview([]);
      setGenerationError("");
      setGenerationSummary("Choisissez d'abord une taille de grille pour lancer la generation.");
      return;
    }

    const words = parseTamilWords(nextRawTamilWords);
    const totalGlyphs = countTamilGlyphs(words);
    const gridCapacity = nextGridSize * nextGridSize;

    if (words.length === 0) {
      setGridDataJson("");
      setWordsJson("");
      setPlacementPreview([]);
      setGenerationError("");
      setGenerationSummary("");
      return;
    }

    const generated = generateWordSearchGrid(words, nextGridSize, nextDirectionSelection);
    setWordsJson(formatWordsJson(generated.words));

    if (generated.error) {
      setPlacementPreview([]);
      setGenerationError(generated.error);
      setGenerationSummary(
        `${words.length} mot${words.length > 1 ? "s" : ""}, ${totalGlyphs} syllabes pour ${gridCapacity} cases.`,
      );
      return;
    }

    setGridDataJson(formatGridDataJson(generated.gridData));
    setGenerationError("");
    setPlacementPreview(generated.placements);
    setGenerationSummary(
      `${words.length} mot${words.length > 1 ? "s" : ""}, ${totalGlyphs} syllabes placees dans ${gridCapacity} cases (${nextGridSize}x${nextGridSize}).`,
    );
  };

  return (
    <form
      action={action}
      className="mt-6 w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" defaultValue={initial?.id} />

      <section className="min-w-0 px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-7">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Generation</h2>
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Statut</div>
              {generationSummary ? <p className="mt-2 text-sm text-slate-700">{generationSummary}</p> : null}
              {generationError ? (
                <p className="mt-2 text-sm font-medium text-rose-600">{generationError}</p>
              ) : generationSummary ? null : (
                <p className="mt-2 text-sm text-slate-500">La generation apparaitra ici apres saisie.</p>
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Titre</span>
              <input
                name="title"
                placeholder="Flowers grid"
                value={title}
                onChange={(event) => {
                  const nextTitle = event.target.value;
                  setTitle(nextTitle);

                  if (!slugTouched) {
                    setSlug(slugify(nextTitle));
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Slug</span>
              <input
                name="slug"
                placeholder="flowers-grid"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </label>
          </div>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Description</span>
            <textarea
              name="description"
              placeholder="Decrivez rapidement le theme de la grille."
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[0.95fr_0.95fr_1.1fr]">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Difficulte</span>
              <select
                name="difficulty"
                defaultValue={initial?.difficulty ?? "beginner"}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Temps limite</span>
              <input
                name="timeLimitSeconds"
                type="number"
                defaultValue={initial?.timeLimitSeconds ?? 180}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              />
            </label>

            <div className="space-y-2 sm:col-span-2 xl:col-span-1">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Taille de grille</span>
              <div className="flex flex-wrap items-center gap-2">
                {GRID_SIZE_OPTIONS.map((size) => {
                  const active = gridSize === size;

                  return (
                    <button
                      key={size}
                      type="button"
                      onClick={() => {
                        setGridSize(size);
                        syncGeneratedContent(rawTamilWords, size, directionSelection);
                      }}
                      className={`rounded-xl border px-4 py-2 text-xs font-semibold transition ${
                        active
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
                      }`}
                      style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
                    >
                      {size}x{size}
                    </button>
                  );
                })}

                <div
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
                    gridSize !== null && !GRID_SIZE_OPTIONS.includes(gridSize as (typeof GRID_SIZE_OPTIONS)[number])
                      ? "border-indigo-300 bg-indigo-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <span className="text-xs font-semibold text-slate-600">Custom</span>
                  <input
                    type="number"
                    min={2}
                    max={30}
                    value={gridSize ?? ""}
                    onChange={(event) => {
                      const nextValue = Number(event.target.value);

                      if (!event.target.value) {
                        setGridSize(null);
                        syncGeneratedContent(rawTamilWords, null, directionSelection);
                        return;
                      }

                      if (Number.isNaN(nextValue)) {
                        return;
                      }

                      setGridSize(nextValue);
                      syncGeneratedContent(rawTamilWords, nextValue, directionSelection);
                    }}
                    className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm font-semibold text-slate-950 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
              Directions autorisees
            </span>
            <div className="flex flex-wrap gap-3">
              {DIRECTION_GROUP_OPTIONS.map((option) => {
                const checked = directionSelection[option.key];

                return (
                  <label
                    key={option.key}
                    className={`inline-flex items-center gap-3 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                      checked
                        ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-600"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) => {
                        const nextDirectionSelection = {
                          ...directionSelection,
                          [option.key]: event.target.checked,
                        };

                        setDirectionSelection(nextDirectionSelection);
                        syncGeneratedContent(rawTamilWords, gridSize, nextDirectionSelection);
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
            <p className="text-xs text-slate-500">
              Cochez les axes autorises pour le placement des mots dans la grille.
            </p>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <label className="block text-xs font-bold uppercase tracking-[0.22em] text-slate-500">
                  Mots tamouls source
                </label>
                <p className="mt-1 text-xs text-slate-500">Un mot par ligne, ou separes par virgules / point-virgules.</p>
              </div>
              <div className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                {parseTamilWords(rawTamilWords).length} mots detectes
              </div>
            </div>

            <textarea
              value={rawTamilWords}
              onChange={(event) => {
                const nextRawTamilWords = event.target.value;
                setRawTamilWords(nextRawTamilWords);
                syncGeneratedContent(nextRawTamilWords, gridSize, directionSelection);
              }}
              className="min-h-72 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-4 font-medium text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
            />
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">JSON de la grille</span>
            <textarea
              name="gridData"
              value={gridDataJson}
              onChange={(event) => setGridDataJson(event.target.value)}
              className="min-h-80 w-full resize-none rounded-xl border border-slate-200 bg-[#0f172a] px-4 py-4 font-mono text-sm text-slate-100 shadow-sm outline-none transition focus:border-indigo-400"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">JSON des mots</span>
            <textarea
              name="words"
              value={wordsJson}
              onChange={(event) => setWordsJson(event.target.value)}
              className="min-h-80 w-full resize-none rounded-xl border border-slate-200 bg-[#0f172a] px-4 py-4 font-mono text-sm text-slate-100 shadow-sm outline-none transition focus:border-indigo-400"
            />
          </label>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Placements verifies</span>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              {placementPreview.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {placementPreview.map((placement) => {
                    const details = formatPlacement(placement);

                    return (
                      <div
                        key={`${placement.word}-${placement.row}-${placement.col}-${placement.rowStep}-${placement.colStep}`}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-tamil text-lg font-bold leading-tight text-slate-950">
                              {placement.word}
                            </div>
                            <div className="mt-1 text-xs font-medium text-slate-600">{details.direction}</div>
                          </div>
                          <div
                            className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-500"
                            style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" }}
                          >
                            {details.start} → {details.end}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-500">
                  Les coordonnees de placement apparaitront ici apres une generation valide.
                </p>
              )}
            </div>
          </div>

          <div className="pt-1">
            <button
              disabled={pending}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
            >
              Save grid
            </button>
          </div>
          <StatusMessage message={state.message} ok={state.ok} />
        </div>
      </section>
    </form>
  );
}

export function FillBlankAdminForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial?: FillBlankExercise | null;
}) {
  const [state, action, pending] = useActionState(upsertFillBlankAction, initialCrudState);
  const question = initial?.questions[0];

  return (
    <form action={action} className="mt-8 space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" defaultValue={initial?.id} />
      <input name="title" placeholder="Title" defaultValue={initial?.title} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <input name="slug" placeholder="slug" defaultValue={initial?.slug} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <textarea name="description" placeholder="Description" defaultValue={initial?.title ?? ""} className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <select name="difficulty" defaultValue={initial?.difficulty ?? "beginner"} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
        <option value="beginner">beginner</option>
        <option value="intermediate">intermediate</option>
        <option value="advanced">advanced</option>
      </select>
      <input name="timeLimitSeconds" type="number" defaultValue={initial?.timeLimitSeconds ?? 180} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <textarea name="sentenceTemplate" defaultValue={question?.sentenceTemplate} className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <input name="translationEn" defaultValue={question?.translation.en} placeholder="English translation" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <textarea name="explanationEn" defaultValue={question?.explanation.en} placeholder="English explanation" className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <textarea name="options" defaultValue={question?.options.join("\n")} placeholder="One option per line" className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <input name="correctAnswer" defaultValue={question?.correctAnswer} placeholder="Correct answer" className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <button disabled={pending} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        Save exercise
      </button>
      <StatusMessage message={state.message} ok={state.ok} />
    </form>
  );
}

export function ImageHuntAdminForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial?: ImageHuntExercise | null;
}) {
  const [state, action, pending] = useActionState(upsertImageHuntAction, initialCrudState);

  return (
    <form action={action} className="mt-8 space-y-4 rounded-[2rem] border border-slate-200 bg-white p-6">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" defaultValue={initial?.id} />
      <input name="title" placeholder="Title" defaultValue={initial?.title} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <input name="slug" placeholder="slug" defaultValue={initial?.slug} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <textarea name="description" placeholder="Description" defaultValue={initial?.title ?? ""} className="min-h-28 w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <select name="difficulty" defaultValue={initial?.difficulty ?? "beginner"} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
        <option value="beginner">beginner</option>
        <option value="intermediate">intermediate</option>
        <option value="advanced">advanced</option>
      </select>
      <input name="timeLimitSeconds" type="number" defaultValue={initial?.timeLimitSeconds ?? 240} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <textarea name="instructionEn" defaultValue={initial?.instruction.en} placeholder="English instruction" className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3" />
      <textarea
        name="targets"
        defaultValue={JSON.stringify(
          initial?.targets.map((target) => ({
            labelTa: target.labelTa,
            en: target.translation.en,
            x: target.x,
            y: target.y,
          })) ?? [],
          null,
          2,
        )}
        className="min-h-40 w-full rounded-2xl border border-slate-200 px-4 py-3 font-mono text-sm"
      />
      <button disabled={pending} className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60">
        Save exercise
      </button>
      <StatusMessage message={state.message} ok={state.ok} />
    </form>
  );
}
