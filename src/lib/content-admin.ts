import { fillBlankExercises, homeSplashSlides, imageHuntExercises, wordSearchGrids } from "@/lib/mock-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type {
  AdminDictionaryInsight,
  DictionaryEntry,
  FillBlankExercise,
  ImageHuntExercise,
  Locale,
  SplashSlide,
  WordSearchGrid,
} from "@/types";

type WordSearchRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: WordSearchGrid["difficulty"];
  time_limit_seconds: number;
  grid_data: string[][];
  words: WordSearchGrid["words"];
  is_active: boolean;
};

type FillBlankExerciseRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: FillBlankExercise["difficulty"];
  time_limit_seconds: number;
  fill_blank_questions: Array<{
    id: string;
    sentence_template: string;
    sentence_translation: Record<string, string>;
    explanation: Record<string, string>;
    fill_blank_options: Array<{
      option_text: string;
      is_correct: boolean;
    }>;
  }>;
};

type ImageHuntExerciseRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: ImageHuntExercise["difficulty"];
  time_limit_seconds: number;
  image_hunt_prompts: Array<{
    instruction_translation: Record<string, string>;
  }>;
  image_hunt_targets: Array<{
    id: string;
    label_ta: string;
    label_translation: Record<string, string>;
    coordinates: {
      x: number;
      y: number;
    };
  }>;
};

type DictionaryEntryRow = {
  id: string;
  slug: string;
  image_url: string | null;
  category: string | null;
  subcategory: string | null;
  type: string | null;
  example: string | null;
  created_at?: string;
  updated_at?: string;
  dictionary_translations: Array<{
    locale: Locale;
    word: string;
    description: string | null;
    is_primary: boolean | null;
  }>;
};

type DictionaryProgressInsightRow = {
  entry_id: string;
  views_count: number | null;
  learned_count: number | null;
  user_id: string;
  dictionary_entries:
    | {
        slug: string;
        category: string | null;
        dictionary_translations: Array<{
          locale: Locale;
          word: string;
          is_primary?: boolean | null;
        }>;
      }
    | Array<{
        slug: string;
        category: string | null;
        dictionary_translations: Array<{
          locale: Locale;
          word: string;
          is_primary?: boolean | null;
        }>;
      }>;
};

type SplashSlideRow = {
  id: string;
  kind: SplashSlide["kind"];
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export async function getAdminWordSearchGrids() {
  if (!hasSupabaseEnv()) {
    return wordSearchGrids;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return wordSearchGrids;
  }

  const { data } = await supabase
    .from("word_search_grids")
    .select("id, slug, title, description, difficulty, time_limit_seconds, grid_data, words, is_active")
    .order("created_at", { ascending: false });

  if (!data) {
    return [];
  }

  return (data as WordSearchRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    timeLimitSeconds: row.time_limit_seconds,
    gridData: row.grid_data,
    words: row.words,
    isActive: row.is_active,
  }));
}

export async function getAdminWordSearchGrid(id: string) {
  const grids = await getAdminWordSearchGrids();
  return grids.find((item) => item.id === id) ?? null;
}

export async function getAdminFillBlankExercises() {
  if (!hasSupabaseEnv()) {
    return fillBlankExercises;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return fillBlankExercises;
  }

  const { data } = await supabase
    .from("fill_blank_exercises")
    .select(
      "id, slug, title, description, difficulty, time_limit_seconds, fill_blank_questions(id, sentence_template, sentence_translation, explanation, fill_blank_options(option_text, is_correct))",
    )
    .order("created_at", { ascending: false });

  if (!data) {
    return fillBlankExercises;
  }

  return (data as FillBlankExerciseRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    difficulty: row.difficulty,
    timeLimitSeconds: row.time_limit_seconds,
    questions:
      row.fill_blank_questions?.map((question) => ({
        id: question.id,
        sentenceTemplate: question.sentence_template,
        translation: question.sentence_translation as FillBlankExercise["questions"][number]["translation"],
        explanation: question.explanation as FillBlankExercise["questions"][number]["explanation"],
        options: question.fill_blank_options.map((option) => option.option_text),
        correctAnswer:
          question.fill_blank_options.find((option) => option.is_correct)?.option_text ??
          question.fill_blank_options[0]?.option_text ??
          "",
      })) ?? [],
  }));
}

export async function getAdminFillBlankExercise(id: string) {
  const exercises = await getAdminFillBlankExercises();
  return exercises.find((item) => item.id === id) ?? null;
}

export async function getAdminImageHuntExercises() {
  if (!hasSupabaseEnv()) {
    return imageHuntExercises;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return imageHuntExercises;
  }

  const { data } = await supabase
    .from("image_hunt_exercises")
    .select(
      "id, slug, title, description, difficulty, time_limit_seconds, image_hunt_prompts(instruction_translation), image_hunt_targets(id, label_ta, label_translation, coordinates)",
    )
    .order("created_at", { ascending: false });

  if (!data) {
    return imageHuntExercises;
  }

  return (data as ImageHuntExerciseRow[]).map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    difficulty: row.difficulty,
    timeLimitSeconds: row.time_limit_seconds,
    instruction:
      (row.image_hunt_prompts[0]?.instruction_translation as ImageHuntExercise["instruction"]) ?? {
        en: row.description,
        fr: row.description,
        ta: row.description,
        de: row.description,
        da: row.description,
        no: row.description,
        it: row.description,
      },
    targets:
      row.image_hunt_targets?.map((target) => ({
        id: target.id,
        labelTa: target.label_ta,
        translation: target.label_translation as ImageHuntExercise["targets"][number]["translation"],
        x: Number(target.coordinates?.x ?? 50),
        y: Number(target.coordinates?.y ?? 50),
      })) ?? [],
  }));
}

export async function getAdminImageHuntExercise(id: string) {
  const exercises = await getAdminImageHuntExercises();
  return exercises.find((item) => item.id === id) ?? null;
}

export async function getAdminDictionaryEntries() {
  if (!hasSupabaseEnv()) {
    return [] as DictionaryEntry[];
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [] as DictionaryEntry[];
  }

  const { data } = await supabase
    .from("dictionary_entries")
    .select("id, slug, image_url, category, subcategory, type, example, created_at, updated_at, dictionary_translations(locale, word, description, is_primary)")
    .order("created_at", { ascending: false });

  if (!data) {
    return [] as DictionaryEntry[];
  }

  return (data as DictionaryEntryRow[]).map((row) => {
    const translations = (row.dictionary_translations ?? []).reduce<DictionaryEntry["translations"]>((accumulator, translation) => {
      const current = accumulator[translation.locale];

      if (!current || translation.is_primary || !current.isPrimary) {
        accumulator[translation.locale] = {
          word: translation.word,
          description: translation.description,
          isPrimary: Boolean(translation.is_primary),
        };
      }

      return accumulator;
    }, {});

    const tamilSynonyms = (row.dictionary_translations ?? [])
      .filter((translation) => translation.locale === "ta" && !translation.is_primary)
      .map((translation) => translation.word)
      .filter(Boolean);

    return {
      id: row.id,
      slug: row.slug,
      imageUrl: row.image_url,
      category: row.category,
      subcategory: row.subcategory,
      type: row.type,
      example: row.example,
      tamilSynonyms,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      translations,
    };
  });
}

export async function getAdminDictionaryEntry(id: string) {
  const entries = await getAdminDictionaryEntries();
  return entries.find((item) => item.id === id) ?? null;
}

export async function getAdminDictionaryInsights() {
  if (!hasSupabaseEnv()) {
    return [] as AdminDictionaryInsight[];
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return [] as AdminDictionaryInsight[];
  }

  const { data } = await supabase
    .from("dictionary_progress")
    .select("entry_id, user_id, views_count, learned_count, dictionary_entries!inner(slug, category, dictionary_translations(locale, word, is_primary))");

  if (!data || data.length === 0) {
    return [] as AdminDictionaryInsight[];
  }

  const grouped = new Map<string, AdminDictionaryInsight>();

  (data as DictionaryProgressInsightRow[]).forEach((row) => {
    const relation = Array.isArray(row.dictionary_entries) ? row.dictionary_entries[0] : row.dictionary_entries;

    if (!relation) {
      return;
    }

    const englishWord =
      relation.dictionary_translations.find((translation) => translation.locale === "en" && translation.is_primary !== false)?.word ??
      relation.dictionary_translations.find((translation) => translation.locale === "en")?.word ??
      relation.slug;
    const tamilWord =
      relation.dictionary_translations.find((translation) => translation.locale === "ta" && translation.is_primary)?.word ??
      relation.dictionary_translations.find((translation) => translation.locale === "ta")?.word ??
      "—";

    const current = grouped.get(row.entry_id) ?? {
      entryId: row.entry_id,
      slug: relation.slug,
      englishWord,
      tamilWord,
      category: relation.category,
      viewsTotal: 0,
      learnedTotal: 0,
      learnerCount: 0,
    };

    current.viewsTotal += Number(row.views_count ?? 0);
    current.learnedTotal += Number(row.learned_count ?? 0);
    current.learnerCount += 1;

    grouped.set(row.entry_id, current);
  });

  return Array.from(grouped.values()).sort((a, b) => {
    if (b.learnedTotal !== a.learnedTotal) {
      return b.learnedTotal - a.learnedTotal;
    }

    return b.viewsTotal - a.viewsTotal;
  });
}

export async function getAdminHomeSplashSlides() {
  if (!hasSupabaseEnv()) {
    return homeSplashSlides;
  }

  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    return homeSplashSlides;
  }

  try {
    const { data } = await supabase
      .from("home_splash_slides")
      .select("id, kind, image_url, sort_order, is_active, created_at, updated_at")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (!data) {
      return [];
    }

    return (data as SplashSlideRow[]).map((row) => ({
      id: row.id,
      kind: row.kind,
      imageUrl: row.image_url,
      sortOrder: row.sort_order,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch {
    return homeSplashSlides;
  }
}
