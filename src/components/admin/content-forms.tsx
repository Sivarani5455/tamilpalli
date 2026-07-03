"use client";

import { type ChangeEvent, type MouseEvent, type PointerEvent, useActionState, useRef, useState } from "react";

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

type FillBlankQuestionDraft = {
  sentenceTemplate: string;
  translationEn: string;
  translationFr: string;
  explanationEn: string;
  explanationFr: string;
  explanationTa: string;
  blanks: Array<{
    key: string;
    options: string;
    correctAnswer: string;
  }>;
};

function createEmptyFillBlankQuestion(): FillBlankQuestionDraft {
  return {
    sentenceTemplate: "",
    translationEn: "",
    translationFr: "",
    explanationEn: "",
    explanationFr: "",
    explanationTa: "",
    blanks: [{ key: "blank_1", options: "", correctAnswer: "" }],
  };
}

const FILL_BLANK_CSV_HEADERS = [
  "sentence_template",
  "english_translation",
  "french_translation",
  "english_explanation",
  "french_explanation",
  "tamil_explanation",
  "blanks",
] as const;

const FILL_BLANK_CSV_HEADER_TEXT = FILL_BLANK_CSV_HEADERS.join(", ");
const FILL_BLANK_CSV_BLANKS_EXAMPLE = "blank_1=சாப்பிடுகிறேன்|சாப்பிடுகிறேன்;குடிக்கிறேன் || blank_2=காலை|காலை;மாலை";

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === "\"" && quoted && nextChar === "\"") {
      current += "\"";
      index += 1;
      continue;
    }

    if (char === "\"") {
      quoted = !quoted;
      continue;
    }

    if (char === "," && !quoted) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (quoted) {
    throw new Error("CSV invalide: guillemet non ferme.");
  }

  values.push(current.trim());
  return values;
}

function parseFillBlankCsvBlanks(rawValue: string, lineNumber: number) {
  return rawValue
    .split("||")
    .map((entry, entryIndex) => {
      const trimmedEntry = entry.trim();
      const [rawKey, rawAnswerAndOptions] = trimmedEntry.split("=");
      const [rawCorrectAnswer, rawOptions] = (rawAnswerAndOptions ?? "").split("|");
      const key = rawKey?.trim() ?? "";
      const correctAnswer = rawCorrectAnswer?.trim() ?? "";
      const options = (rawOptions ?? "")
        .split(";")
        .map((option) => option.trim())
        .filter(Boolean);

      if (!key || !/^[A-Za-z0-9_]+$/.test(key)) {
        throw new Error(`Ligne ${lineNumber}: le trou ${entryIndex + 1} doit avoir une cle comme blank_1.`);
      }

      if (!correctAnswer || options.length < 2) {
        throw new Error(`Ligne ${lineNumber}: ${key} doit respecter le format cle=reponse|option1;option2.`);
      }

      if (!options.includes(correctAnswer)) {
        throw new Error(`Ligne ${lineNumber}: la reponse correcte de ${key} doit etre dans ses options.`);
      }

      return {
        key,
        options: options.join("\n"),
        correctAnswer,
      };
    })
    .filter((blank) => blank.key.length > 0);
}

function parseFillBlankQuestionsCsv(csvText: string): FillBlankQuestionDraft[] {
  const lines = csvText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("Le CSV doit contenir une ligne d'en-tete et au moins une question.");
  }

  const headers = parseCsvLine(lines[0]);

  if (
    headers.length !== FILL_BLANK_CSV_HEADERS.length ||
    headers.some((header, index) => header !== FILL_BLANK_CSV_HEADERS[index])
  ) {
    throw new Error(`Format CSV invalide. En-tete attendu: ${FILL_BLANK_CSV_HEADER_TEXT}`);
  }

  return lines.slice(1).map((line, index) => {
    const lineNumber = index + 2;
    const values = parseCsvLine(line);

    if (values.length !== FILL_BLANK_CSV_HEADERS.length) {
      throw new Error(`Ligne ${lineNumber}: ${FILL_BLANK_CSV_HEADERS.length} colonnes attendues.`);
    }

    const row = Object.fromEntries(FILL_BLANK_CSV_HEADERS.map((header, headerIndex) => [header, values[headerIndex]]));
    const blanks = parseFillBlankCsvBlanks(row.blanks, lineNumber);

    if (blanks.length === 0) {
      throw new Error(`Ligne ${lineNumber}: ajoutez au moins un trou dans la colonne blanks.`);
    }

    for (const blank of blanks) {
      if (!row.sentence_template.includes(`[${blank.key}]`) && !(blank.key === "blank_1" && row.sentence_template.includes("__"))) {
        throw new Error(`Ligne ${lineNumber}: la phrase doit contenir [${blank.key}].`);
      }
    }

    return {
      sentenceTemplate: row.sentence_template,
      translationEn: row.english_translation,
      translationFr: row.french_translation,
      explanationEn: row.english_explanation,
      explanationFr: row.french_explanation,
      explanationTa: row.tamil_explanation,
      blanks,
    };
  });
}

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
  const detectedTamilWordCount = parseTamilWords(rawTamilWords).length;
  const hasOddTamilWordCount = detectedTamilWordCount > 0 && detectedTamilWordCount % 2 !== 0;

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

    if (words.length % 2 !== 0) {
      setGridDataJson("");
      setWordsJson("");
      setPlacementPreview([]);
      setGenerationError(
        `Le nombre total de mots tamouls source doit etre pair. Actuellement: ${words.length}. Ajoutez ou retirez un mot.`,
      );
      setGenerationSummary(
        `${words.length} mots detectes. Utilisez un total pair, par exemple ${words.length - 1} ou ${words.length + 1}.`,
      );
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
              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  hasOddTamilWordCount ? "bg-rose-50 text-rose-700" : "bg-indigo-50 text-indigo-700"
                }`}
              >
                {detectedTamilWordCount} mots detectes
              </div>
            </div>
            {hasOddTamilWordCount ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                Le nombre de mots doit etre pair pour un affichage en deux lignes. Ajoutez ou retirez un mot.
              </p>
            ) : null}

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
              disabled={pending || hasOddTamilWordCount}
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
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "beginner");
  const [timeLimitSeconds, setTimeLimitSeconds] = useState(initial?.timeLimitSeconds ?? 180);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [csvImportMessage, setCsvImportMessage] = useState<{ ok: boolean; message: string } | null>(null);
  const [questions, setQuestions] = useState<FillBlankQuestionDraft[]>(() =>
    initial?.questions.length
        ? initial.questions.map((question) => ({
          sentenceTemplate: question.sentenceTemplate,
          translationEn: question.translation.en ?? "",
          translationFr: question.translation.fr ?? "",
          explanationEn: question.explanation.en ?? "",
          explanationFr: question.explanation.fr ?? "",
          explanationTa: question.explanation.ta ?? "",
          blanks: question.blanks?.length
            ? question.blanks.map((blank) => ({
                key: blank.key,
                options: blank.options.join("\n"),
                correctAnswer: blank.correctAnswer,
              }))
            : [{ key: "blank_1", options: question.options.join("\n"), correctAnswer: question.correctAnswer }],
        }))
      : [createEmptyFillBlankQuestion()],
  );
  const activeQuestion = questions[activeQuestionIndex] ?? questions[0] ?? createEmptyFillBlankQuestion();
  const serializedQuestions = JSON.stringify(
    questions.map((question) => ({
      sentenceTemplate: question.sentenceTemplate,
      translationEn: question.translationEn,
      translationFr: question.translationFr,
      explanationEn: question.explanationEn,
      explanationFr: question.explanationFr,
      explanationTa: question.explanationTa,
      blanks: question.blanks.map((blank) => ({
        key: blank.key,
        options: blank.options
          .split(/\r?\n/)
          .map((option) => option.trim())
          .filter(Boolean),
        correctAnswer: blank.correctAnswer,
      })),
    })),
  );
  const questionCompleteCount = questions.filter(
    (question) =>
      question.sentenceTemplate.trim() &&
      question.translationEn.trim() &&
      question.translationFr.trim() &&
      question.explanationEn.trim() &&
      question.explanationFr.trim() &&
      question.explanationTa.trim() &&
      question.blanks.length > 0 &&
      question.blanks.every((blank) => blank.key.trim() && blank.options.trim() && blank.correctAnswer.trim()),
  ).length;
  const progressFields = [title, slug, questionCompleteCount === questions.length && questions.length > 0 ? "questions-complete" : ""];
  const completedFields = progressFields.filter((value) => value.trim().length > 0).length;
  const previewMarkup = activeQuestion.sentenceTemplate.trim()
    ? activeQuestion.blanks.reduce(
        (sentence, blank) => sentence.replace(new RegExp(`\\[${blank.key}\\]|_{2,}`), blank.correctAnswer.trim() || "?"),
        activeQuestion.sentenceTemplate,
      )
    : "";
  const formTitle = initial ? "Edit Fill in the Blanks Exercise" : "Create Fill in the Blanks Exercise";

  function updateQuestion(index: number, patch: Partial<FillBlankQuestionDraft>) {
    setQuestions((current) =>
      current.map((question, questionIndex) => (questionIndex === index ? { ...question, ...patch } : question)),
    );
  }

  function updateBlank(questionIndex: number, blankIndex: number, patch: Partial<FillBlankQuestionDraft["blanks"][number]>) {
    setQuestions((current) =>
      current.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
              ...question,
              blanks: question.blanks.map((blank, currentBlankIndex) =>
                currentBlankIndex === blankIndex ? { ...blank, ...patch } : blank,
              ),
            }
          : question,
      ),
    );
  }

  function addBlank(questionIndex: number) {
    setQuestions((current) =>
      current.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex
          ? {
              ...question,
              blanks: [...question.blanks, { key: `blank_${question.blanks.length + 1}`, options: "", correctAnswer: "" }],
            }
          : question,
      ),
    );
  }

  function removeBlank(questionIndex: number, blankIndex: number) {
    setQuestions((current) =>
      current.map((question, currentQuestionIndex) =>
        currentQuestionIndex === questionIndex && question.blanks.length > 1
          ? {
              ...question,
              blanks: question.blanks.filter((_, currentBlankIndex) => currentBlankIndex !== blankIndex),
            }
          : question,
      ),
    );
  }

  function addQuestion() {
    setQuestions([...questions, createEmptyFillBlankQuestion()]);
    setActiveQuestionIndex(questions.length);
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) {
      return;
    }

    const next = questions.filter((_, questionIndex) => questionIndex !== index);
    setQuestions(next);
    setActiveQuestionIndex(Math.min(activeQuestionIndex, next.length - 1));
  }

  async function importQuestionsCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setCsvImportMessage({ ok: false, message: "Le fichier doit etre un CSV." });
      event.target.value = "";
      return;
    }

    try {
      const importedQuestions = parseFillBlankQuestionsCsv(await file.text());
      setQuestions(importedQuestions);
      setActiveQuestionIndex(0);
      setCsvImportMessage({
        ok: true,
        message: `${importedQuestions.length} question${importedQuestions.length > 1 ? "s" : ""} importee${importedQuestions.length > 1 ? "s" : ""} dans le formulaire.`,
      });
    } catch (error) {
      setCsvImportMessage({ ok: false, message: error instanceof Error ? error.message : "Import CSV impossible." });
    } finally {
      event.target.value = "";
    }
  }

  return (
    <form action={action} className="mx-auto mt-8 max-w-[48rem] pb-10">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" defaultValue={initial?.id} />
      <input type="hidden" name="questions" value={serializedQuestions} readOnly />
      <h1 className="font-display text-[clamp(2.25rem,5vw,3rem)] leading-tight text-slate-950">{formTitle}</h1>

      <div className="mt-6 flex items-center gap-3">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${(completedFields / progressFields.length) * 100}%` }} />
        </div>
        <span className="font-mono text-xs text-slate-500">
          {completedFields}/{progressFields.length}
        </span>
      </div>

      <div className="mt-5 rounded-[1.25rem] bg-slate-950 p-5 text-white shadow-[0_22px_55px_-38px_rgba(15,23,42,0.7)]">
        <p className="flex items-center gap-2 font-mono text-[0.68rem] uppercase tracking-[0.14em] text-slate-300">
          <span className="h-1.5 w-1.5 rounded-full bg-[#ffd54a]" />
          Sentence preview
        </p>
        <p className="mt-3 min-h-8 font-display text-xl leading-8">
          {previewMarkup || <span className="font-sans text-sm italic text-slate-500">Preview appears when you write the sentence...</span>}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-[#ffd54a]/30 bg-[#ffd54a]/15 px-3 py-1 font-mono text-xs text-[#ffd54a]">{difficulty}</span>
          <span className="rounded-full border border-white/10 bg-white/[0.08] px-3 py-1 font-mono text-xs text-slate-200">{timeLimitSeconds} s</span>
        </div>
      </div>

      <section className="mt-6">
        <p className="mb-2 ml-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">General</p>
        <div className="overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white">
          <label className="block border-b border-slate-100 px-4 py-3">
            <span className="block text-xs font-medium text-slate-500">Title</span>
            <input
              name="title"
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                if (!initial && slug.trim().length === 0) {
                  setSlug(slugify(nextTitle));
                }
              }}
              placeholder="Tamil basics: daily actions"
              className="mt-1 w-full bg-transparent text-[0.98rem] text-slate-950 outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="block border-b border-slate-100 px-4 py-3">
            <span className="block text-xs font-medium text-slate-500">Slug</span>
            <input
              name="slug"
              value={slug}
              onChange={(event) => setSlug(slugify(event.target.value))}
              placeholder="tamil-basics-daily-actions"
              className="mt-1 w-full bg-transparent font-mono text-[0.92rem] text-slate-950 outline-none placeholder:text-slate-400"
            />
          </label>
          <div className="grid sm:grid-cols-2">
            <label className="block border-b border-slate-100 px-4 py-3 sm:border-b-0 sm:border-r">
              <span className="block text-xs font-medium text-slate-500">Difficulty</span>
              <select
                name="difficulty"
                value={difficulty}
                onChange={(event) => setDifficulty(event.target.value as FillBlankExercise["difficulty"])}
                className="mt-1 w-full bg-transparent text-[0.98rem] text-slate-950 outline-none"
              >
                <option value="beginner">beginner</option>
                <option value="intermediate">intermediate</option>
                <option value="advanced">advanced</option>
              </select>
            </label>
            <label className="block px-4 py-3">
              <span className="block text-xs font-medium text-slate-500">Time limit</span>
              <input
                name="timeLimitSeconds"
                type="number"
                value={timeLimitSeconds}
                onChange={(event) => setTimeLimitSeconds(Number(event.target.value))}
                className="mt-1 w-full bg-transparent font-mono text-[0.98rem] text-slate-950 outline-none"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="mt-6 rounded-[1.25rem] border border-dashed border-slate-300 bg-white p-5">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Import CSV</p>
            <h2 className="mt-2 font-display text-2xl text-slate-950">Importer les questions</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Le CSV remplace les questions affichees dans le formulaire. Verifie ensuite le resultat, puis sauvegarde
              l&apos;exercice.
            </p>
            <code className="mt-4 block overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-xs leading-6 text-slate-100">
              {FILL_BLANK_CSV_HEADER_TEXT}
            </code>
            <p className="mt-3 text-xs leading-5 text-slate-500">
              Colonne blanks: <span className="font-mono text-slate-700">{FILL_BLANK_CSV_BLANKS_EXAMPLE}</span>
            </p>
          </div>

          <div className="w-full shrink-0 space-y-3 lg:w-[18rem]">
            <label className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-center text-sm text-slate-600">
              <span className="font-semibold text-slate-950">Choisir un CSV</span>
              <input type="file" accept=".csv,text/csv" onChange={importQuestionsCsv} className="mt-3 w-full text-sm" />
            </label>
            {csvImportMessage ? (
              <p className={`text-sm leading-6 ${csvImportMessage.ok ? "text-emerald-700" : "text-rose-600"}`}>
                {csvImportMessage.message}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="ml-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Questions</p>
          <button
            type="button"
            onClick={addQuestion}
            className="rounded-full bg-slate-950 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
          >
            + Add question
          </button>
        </div>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {questions.map((question, index) => {
            const isComplete =
              question.sentenceTemplate.trim() &&
              question.translationEn.trim() &&
              question.translationFr.trim() &&
              question.explanationEn.trim() &&
              question.explanationFr.trim() &&
              question.explanationTa.trim() &&
              question.blanks.every((blank) => blank.key.trim() && blank.options.trim() && blank.correctAnswer.trim());
            return (
              <button
                key={index}
                type="button"
                onClick={() => setActiveQuestionIndex(index)}
                className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${
                  activeQuestionIndex === index
                    ? "border-slate-950 bg-slate-950 text-white"
                    : isComplete
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-500"
                }`}
              >
                Question {index + 1}
              </button>
            );
          })}
        </div>
        <div className="overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <p className="text-sm font-semibold text-slate-900">Question {activeQuestionIndex + 1}</p>
            <button
              type="button"
              onClick={() => removeQuestion(activeQuestionIndex)}
              disabled={questions.length <= 1}
              className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Remove
            </button>
          </div>
          <label className="block border-b border-slate-100 px-4 py-3">
            <span className="block text-xs font-medium text-slate-500">Sentence with blank</span>
            <textarea
              value={activeQuestion.sentenceTemplate}
              onChange={(event) => updateQuestion(activeQuestionIndex, { sentenceTemplate: event.target.value })}
              placeholder="நான் காலை உணவு ____."
              className="mt-1 min-h-20 w-full resize-none bg-transparent text-[0.98rem] leading-7 text-slate-950 outline-none placeholder:text-slate-400"
            />
            <span className="mt-1 block text-xs text-slate-400">
              Use [blank_1], [blank_2] for multiple blanks. Legacy ___ also works for the first blank.
            </span>
          </label>
          <label className="block border-b border-slate-100 px-4 py-3">
            <span className="block text-xs font-medium text-slate-500">English translation</span>
            <input
              value={activeQuestion.translationEn}
              onChange={(event) => updateQuestion(activeQuestionIndex, { translationEn: event.target.value })}
              placeholder="I eat breakfast."
              className="mt-1 w-full bg-transparent text-[0.98rem] text-slate-950 outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="block border-b border-slate-100 px-4 py-3">
            <span className="block text-xs font-medium text-slate-500">French translation</span>
            <input
              value={activeQuestion.translationFr}
              onChange={(event) => updateQuestion(activeQuestionIndex, { translationFr: event.target.value })}
              placeholder="Je mange le petit-déjeuner."
              className="mt-1 w-full bg-transparent text-[0.98rem] text-slate-950 outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="block border-b border-slate-100 px-4 py-3">
            <span className="block text-xs font-medium text-slate-500">English explanation</span>
            <textarea
              value={activeQuestion.explanationEn}
              onChange={(event) => updateQuestion(activeQuestionIndex, { explanationEn: event.target.value })}
              placeholder="Explain the grammar point in English."
              className="mt-1 min-h-20 w-full resize-none bg-transparent text-[0.98rem] leading-7 text-slate-950 outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="block border-b border-slate-100 px-4 py-3">
            <span className="block text-xs font-medium text-slate-500">French explanation</span>
            <textarea
              value={activeQuestion.explanationFr}
              onChange={(event) => updateQuestion(activeQuestionIndex, { explanationFr: event.target.value })}
              placeholder="Expliquez le point de grammaire en français."
              className="mt-1 min-h-20 w-full resize-none bg-transparent text-[0.98rem] leading-7 text-slate-950 outline-none placeholder:text-slate-400"
            />
          </label>
          <label className="block px-4 py-3">
            <span className="block text-xs font-medium text-slate-500">Tamil explanation</span>
            <textarea
              value={activeQuestion.explanationTa}
              onChange={(event) => updateQuestion(activeQuestionIndex, { explanationTa: event.target.value })}
              placeholder="தமிழில் இலக்கண விளக்கத்தை எழுதுங்கள்."
              className="mt-1 min-h-20 w-full resize-none bg-transparent text-[0.98rem] leading-7 text-slate-950 outline-none placeholder:text-slate-400"
            />
          </label>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="ml-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Blanks and answers</p>
          <button
            type="button"
            onClick={() => addBlank(activeQuestionIndex)}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
          >
            + Add blank
          </button>
        </div>
        <div className="space-y-3">
          {activeQuestion.blanks.map((blank, blankIndex) => {
            const blankOptions = blank.options
              .split(/\r?\n/)
              .map((option) => option.trim())
              .filter(Boolean);

            return (
              <div key={`${blank.key}-${blankIndex}`} className="overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <label className="flex-1">
                    <span className="block text-xs font-medium text-slate-500">Blank key</span>
                    <input
                      value={blank.key}
                      onChange={(event) => updateBlank(activeQuestionIndex, blankIndex, { key: slugify(event.target.value).replace(/-/g, "_") || `blank_${blankIndex + 1}` })}
                      placeholder={`blank_${blankIndex + 1}`}
                      className="mt-1 w-full bg-transparent font-mono text-sm text-slate-950 outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeBlank(activeQuestionIndex, blankIndex)}
                    disabled={activeQuestion.blanks.length <= 1}
                    className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Remove
                  </button>
                </div>
                <label className="block border-b border-slate-100 px-4 py-3">
                  <span className="block text-xs font-medium text-slate-500">Options for [{blank.key || `blank_${blankIndex + 1}`}]</span>
                  <textarea
                    value={blank.options}
                    onChange={(event) => updateBlank(activeQuestionIndex, blankIndex, { options: event.target.value })}
                    placeholder={"One option per line\nகாலை\nமாலை\nஇரவு"}
                    className="mt-1 min-h-24 w-full resize-none bg-transparent text-[0.98rem] leading-7 text-slate-950 outline-none placeholder:text-slate-400"
                  />
                </label>
                {blankOptions.length > 0 ? (
                  <div className="border-b border-slate-100 px-4 py-3">
                    <p className="text-xs font-medium text-slate-500">Choose correct answer</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {blankOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => updateBlank(activeQuestionIndex, blankIndex, { correctAnswer: option })}
                          className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                            blank.correctAnswer === option
                              ? "border-[#ffd54a] bg-[#ffd54a]/30 font-semibold text-[#5c4600]"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
                <label className="block px-4 py-3">
                  <span className="block text-xs font-medium text-slate-500">Correct answer</span>
                  <input
                    value={blank.correctAnswer}
                    onChange={(event) => updateBlank(activeQuestionIndex, blankIndex, { correctAnswer: event.target.value })}
                    placeholder="காலை"
                    className="mt-1 w-full bg-transparent text-[0.98rem] text-slate-950 outline-none placeholder:text-slate-400"
                  />
                </label>
              </div>
            );
          })}
        </div>
      </section>

      <div className="sticky bottom-0 mt-7 bg-[linear-gradient(to_top,#eff2f6_68%,transparent)] pt-4">
        <button
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          <span className="text-[#ffd54a]">✓</span>
          {initial ? "Save exercise" : "Create exercise"}
        </button>
        <StatusMessage message={state.message} ok={state.ok} />
      </div>
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
  const [imageUrl, setImageUrl] = useState(initial?.imageUrl ?? "");
  const [targetLabelTa, setTargetLabelTa] = useState("");
  const [targetLabelEn, setTargetLabelEn] = useState("");
  const [targetLabelFr, setTargetLabelFr] = useState("");
  const [activeTargetIndex, setActiveTargetIndex] = useState<number | null>(null);
  const [placementMessage, setPlacementMessage] = useState("");
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [targets, setTargets] = useState(() =>
    initial?.targets.map((target) => ({
      labelTa: target.labelTa,
      en: target.translation.en ?? "",
      fr: target.translation.fr ?? target.translation.en ?? "",
      x: target.x,
      y: target.y,
      radius: target.radius ?? 10,
      width: target.width ?? (target.radius ?? 10) * 2,
      height: target.height ?? (target.radius ?? 10) * 2,
    })) ?? [],
  );
  const serializedTargets = JSON.stringify(targets);

  function addTargetFromImage(event: MouseEvent<HTMLDivElement>) {
    if (!imageUrl.trim()) {
      return;
    }

    if (!targetLabelTa.trim() || !targetLabelEn.trim() || !targetLabelFr.trim()) {
      setPlacementMessage("Ajoute les labels tamoul, anglais et francais avant de cliquer sur l'image.");
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = Number((((event.clientX - rect.left) / rect.width) * 100).toFixed(2));
    const y = Number((((event.clientY - rect.top) / rect.height) * 100).toFixed(2));

    setTargets((current) => [
      ...current,
      {
        labelTa: targetLabelTa.trim(),
        en: targetLabelEn.trim(),
        fr: targetLabelFr.trim(),
        x,
        y,
        radius: 9,
        width: 18,
        height: 14,
      },
    ]);
    setActiveTargetIndex(targets.length);
    setTargetLabelTa("");
    setTargetLabelEn("");
    setTargetLabelFr("");
    setPlacementMessage(`Zone ajoutee a ${x}%, ${y}%. Deplace-la ou etire-la directement sur l'image.`);
  }

  function removeTarget(index: number) {
    setTargets((current) => current.filter((_, targetIndex) => targetIndex !== index));
    setActiveTargetIndex(null);
  }

  function updateTarget(index: number, patch: Partial<(typeof targets)[number]>) {
    setTargets((current) =>
      current.map((target, targetIndex) => (targetIndex === index ? { ...target, ...patch } : target)),
    );
  }

  function clampPercent(value: number, min = 0, max = 100) {
    return Math.min(max, Math.max(min, value));
  }

  function startTargetDrag(event: PointerEvent<HTMLButtonElement>, index: number) {
    event.preventDefault();
    event.stopPropagation();
    setActiveTargetIndex(index);

    const preview = previewRef.current;
    const target = targets[index];

    if (!preview || !target) {
      return;
    }

    const rect = preview.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startTargetX = target.x;
    const startTargetY = target.y;

    function moveTarget(moveEvent: globalThis.PointerEvent) {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 100;
      updateTarget(index, {
        x: Number(clampPercent(startTargetX + dx, 0, 100).toFixed(2)),
        y: Number(clampPercent(startTargetY + dy, 0, 100).toFixed(2)),
      });
    }

    window.addEventListener("pointermove", moveTarget);
    window.addEventListener("pointerup", () => window.removeEventListener("pointermove", moveTarget), { once: true });
  }

  function startTargetResize(event: PointerEvent<HTMLSpanElement>, index: number) {
    event.preventDefault();
    event.stopPropagation();
    setActiveTargetIndex(index);

    const preview = previewRef.current;
    const target = targets[index];

    if (!preview || !target) {
      return;
    }

    const rect = preview.getBoundingClientRect();
    const startX = event.clientX;
    const startY = event.clientY;
    const startWidth = target.width;
    const startHeight = target.height;

    function resizeTarget(moveEvent: globalThis.PointerEvent) {
      const dx = ((moveEvent.clientX - startX) / rect.width) * 100;
      const dy = ((moveEvent.clientY - startY) / rect.height) * 100;
      const width = clampPercent(startWidth + dx * 2, 5, 70);
      const height = clampPercent(startHeight + dy * 2, 5, 70);

      updateTarget(index, {
        width: Number(width.toFixed(2)),
        height: Number(height.toFixed(2)),
        radius: Number((Math.max(width, height) / 2).toFixed(2)),
      });
    }

    window.addEventListener("pointermove", resizeTarget);
    window.addEventListener("pointerup", () => window.removeEventListener("pointermove", resizeTarget), { once: true });
  }

  return (
    <form action={action} className="mx-auto mt-8 max-w-7xl space-y-5 pb-24 sm:px-4 lg:pb-10">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" defaultValue={initial?.id} />
      <input type="hidden" name="targets" value={serializedTargets} readOnly />

      <div className="overflow-hidden rounded-[1.75rem] border border-[#ead5b8] bg-[#fff8ec] shadow-[0_24px_70px_-50px_rgba(74,51,36,0.45)]">
        <div className="border-b border-[#ead5b8] px-5 py-4 sm:px-6">
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[#ead5b8] bg-white/70 text-center shadow-sm">
            <div className="px-4 py-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#9a6a2f]">Zones</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--brand-ink)]">{targets.length}</p>
            </div>
            <div className="border-x border-[#ead5b8] px-4 py-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#9a6a2f]">Image</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--brand-ink)]">{imageUrl.trim() ? "OK" : "--"}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#9a6a2f]">Mode</p>
              <p className="mt-1 text-2xl font-semibold text-[var(--brand-ink)]">Tap</p>
            </div>
          </div>
        </div>

        <section className="grid gap-3 p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
          <label className="block rounded-2xl border border-[#ead5b8] bg-white/80 px-4 py-3">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a2f]">Title</span>
            <input
              name="title"
              placeholder="Animals in the garden"
              defaultValue={initial?.title}
              className="mt-2 w-full bg-transparent text-base font-semibold text-[var(--brand-ink)] outline-none placeholder:text-[#9d8974]"
            />
          </label>
          <label className="block rounded-2xl border border-[#ead5b8] bg-white/80 px-4 py-3">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a2f]">Slug</span>
            <input
              name="slug"
              placeholder="animals-garden"
              defaultValue={initial?.slug}
              className="mt-2 w-full bg-transparent font-mono text-sm text-[var(--brand-ink)] outline-none placeholder:text-[#9d8974]"
            />
          </label>
          <label className="block rounded-2xl border border-[#ead5b8] bg-white/80 px-4 py-3">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a2f]">Difficulty</span>
            <select
              name="difficulty"
              defaultValue={initial?.difficulty ?? "beginner"}
              className="mt-2 w-full bg-transparent text-base font-semibold text-[var(--brand-ink)] outline-none"
            >
              <option value="beginner">beginner</option>
              <option value="intermediate">intermediate</option>
              <option value="advanced">advanced</option>
            </select>
          </label>
          <label className="block rounded-2xl border border-[#ead5b8] bg-white/80 px-4 py-3">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a2f]">Time limit</span>
            <input
              name="timeLimitSeconds"
              type="number"
              defaultValue={initial?.timeLimitSeconds ?? 240}
              className="mt-2 w-full bg-transparent font-mono text-base font-semibold text-[var(--brand-ink)] outline-none"
            />
          </label>
          <label className="block rounded-2xl border border-[#ead5b8] bg-white/80 px-4 py-3 md:col-span-2 xl:col-span-4">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a2f]">Image URL</span>
            <input
              name="imageUrl"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              placeholder="/image-hunt/animaux.jpg or https://..."
              className="mt-2 w-full bg-transparent text-sm text-[var(--brand-ink)] outline-none placeholder:text-[#9d8974]"
            />
          </label>
          <label className="block rounded-2xl border border-[#ead5b8] bg-white/80 px-4 py-3 md:col-span-2">
            <span className="block text-xs font-semibold uppercase tracking-[0.16em] text-[#9a6a2f]">Instruction</span>
            <textarea
              name="instructionEn"
              defaultValue={initial?.instruction.en}
              placeholder="Find the requested object in the image."
              className="mt-2 min-h-20 w-full resize-none bg-transparent text-sm leading-6 text-[var(--brand-ink)] outline-none placeholder:text-[#9d8974]"
            />
          </label>
        </section>
      </div>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,0.75fr)]">
        <div className="rounded-[1.75rem] border border-[#ead5b8] bg-[#fff8ec] p-3 shadow-[0_24px_70px_-55px_rgba(74,51,36,0.45)] sm:p-4">
          <div className="mb-3 flex flex-col gap-2 px-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#9a6a2f]">Image preview</p>
              <p className="mt-1 text-sm text-[#755b43]">Tap to add a zone, drag to move, pull the black handle to resize.</p>
            </div>
            <span className="w-fit rounded-full border border-[#ead5b8] bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#7d5a38]">
              {activeTargetIndex === null ? "No zone selected" : `Zone ${activeTargetIndex + 1} selected`}
            </span>
          </div>
          <div
            ref={previewRef}
            onClick={addTargetFromImage}
            className={`relative aspect-[4/3] w-full overflow-hidden rounded-[1.4rem] border border-[#ead5b8] bg-[#f7ead7] text-left shadow-inner sm:aspect-[16/10] ${
              imageUrl.trim() ? "cursor-crosshair" : "cursor-not-allowed"
            }`}
          >
            {imageUrl.trim() ? (
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center px-6 text-center text-sm text-[#80664c]">
                Ajoute une URL ou un chemin d&apos;image pour commencer le placement.
              </span>
            )}
            {targets.map((target, index) => (
              <button
                key={`${target.labelTa}-${index}`}
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setActiveTargetIndex(index);
                }}
                onPointerDown={(event) => startTargetDrag(event, index)}
                className={`absolute flex min-h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center rounded-full border-2 text-xs font-bold text-white shadow-lg ${
                  activeTargetIndex === index
                    ? "border-white bg-[#1f7a67]/50 ring-4 ring-[#9be3d4]/80"
                    : "border-white bg-[#1f7a67]/28 ring-2 ring-[#1f7a67]/45"
                }`}
                style={{
                  left: `${target.x}%`,
                  top: `${target.y}%`,
                  width: `${target.width}%`,
                  height: `${target.height}%`,
                }}
              >
                {index + 1}
                <span
                  onPointerDown={(event) => startTargetResize(event, index)}
                  className="absolute -bottom-3 -right-3 h-7 w-7 rounded-full border-2 border-white bg-[#2d2017] shadow-md sm:h-6 sm:w-6"
                  aria-hidden="true"
                />
              </button>
            ))}
          </div>
          {placementMessage ? (
            <p className="mt-3 rounded-2xl border border-[#ead5b8] bg-white/75 px-4 py-3 text-sm leading-6 text-[#684f38]">
              {placementMessage}
            </p>
          ) : null}
        </div>

        <div className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <div className="rounded-[1.75rem] border border-[#ead5b8] bg-[#fff8ec] p-4 shadow-[0_18px_55px_-45px_rgba(74,51,36,0.45)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6a2f]">New zone</p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--brand-ink)]">Target labels</h2>
              </div>
              <span className="rounded-full bg-[#1f7a67] px-3 py-1 text-xs font-bold text-white">Step 1</span>
            </div>
            <div className="mt-4 space-y-3">
              <label className="block rounded-2xl border border-[#ead5b8] bg-white/80 px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6a2f]">Tamil</span>
                <input
                  value={targetLabelTa}
                  onChange={(event) => setTargetLabelTa(event.target.value)}
                  placeholder="நாய்"
                  className="mt-1 w-full bg-transparent text-base font-semibold text-[var(--brand-ink)] outline-none placeholder:text-[#a28b72]"
                />
              </label>
              <label className="block rounded-2xl border border-[#ead5b8] bg-white/80 px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6a2f]">English</span>
                <input
                  value={targetLabelEn}
                  onChange={(event) => setTargetLabelEn(event.target.value)}
                  placeholder="dog"
                  className="mt-1 w-full bg-transparent text-base font-semibold text-[var(--brand-ink)] outline-none placeholder:text-[#a28b72]"
                />
              </label>
              <label className="block rounded-2xl border border-[#ead5b8] bg-white/80 px-4 py-3">
                <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-[#9a6a2f]">French</span>
                <input
                  value={targetLabelFr}
                  onChange={(event) => setTargetLabelFr(event.target.value)}
                  placeholder="chien"
                  className="mt-1 w-full bg-transparent text-base font-semibold text-[var(--brand-ink)] outline-none placeholder:text-[#a28b72]"
                />
              </label>
              <p className="rounded-2xl bg-[#f4e4cc] px-4 py-3 text-xs leading-5 text-[#72563d]">
                Remplis ces champs, clique dans l&apos;image, puis deplace la zone ou etire-la avec la poignee noire.
              </p>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-[#ead5b8] bg-white/90 p-4 shadow-[0_18px_55px_-45px_rgba(74,51,36,0.45)] sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#9a6a2f]">Zones</p>
                <h2 className="mt-1 text-xl font-semibold text-[var(--brand-ink)]">Saved targets</h2>
              </div>
              <span className="rounded-full border border-[#ead5b8] bg-[#fff8ec] px-3 py-1 text-xs font-semibold text-[#7d5a38]">
                {targets.length}
              </span>
            </div>
            <div className="mt-4 max-h-[22rem] space-y-2 overflow-y-auto pr-1">
              {targets.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#d9b98f] bg-[#fff8ec] px-4 py-5 text-sm leading-6 text-[#72563d]">
                  Aucune zone ajoutee.
                </p>
              ) : (
                targets.map((target, index) => (
                  <div
                    key={`${target.labelTa}-${target.x}-${target.y}`}
                    className={`flex items-center justify-between gap-3 rounded-2xl border px-3 py-3 transition ${
                      activeTargetIndex === index
                        ? "border-[#1f7a67] bg-[#e7f6f1]"
                        : "border-[#ead5b8] bg-[#fff8ec]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveTargetIndex(index)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <p className="truncate font-semibold text-[var(--brand-ink)]">
                        {index + 1}. {target.labelTa}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#72563d]">
                        {target.en} / {target.fr}
                      </p>
                      <p className="mt-1 font-mono text-[0.65rem] text-[#9a6a2f]">
                        {target.x}%, {target.y}% · {target.width}% x {target.height}%
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => removeTarget(index)}
                      className="shrink-0 rounded-full bg-[#fee2e2] px-3 py-2 text-xs font-bold text-[#b42318] transition hover:bg-[#fecaca]"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-[#ead5b8] bg-[#fff8ec]/95 px-4 py-3 shadow-[0_-18px_45px_-35px_rgba(74,51,36,0.55)] backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:shadow-none sm:backdrop-blur-0">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <StatusMessage message={state.message} ok={state.ok} />
          <button
            disabled={pending || targets.length === 0}
            className="min-h-12 rounded-2xl bg-[#1f7a67] px-6 py-3 text-sm font-bold text-white shadow-[0_16px_35px_-22px_rgba(31,122,103,0.8)] transition hover:bg-[#176454] disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-[12rem]"
          >
            {pending ? "Saving..." : "Save exercise"}
          </button>
        </div>
      </div>
    </form>
  );
}
