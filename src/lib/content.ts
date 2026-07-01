import { categories, fillBlankExercises, homeSplashSlides, imageHuntExercises, wordSearchGrids } from "@/lib/mock-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  ContentCategory,
  DictionaryEntry,
  DictionaryProgressSummary,
  FillBlankExercise,
  ImageHuntExercise,
  Locale,
  SplashSlide,
  WordSearchGrid,
} from "@/types";

type CategoryRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  type: ContentCategory["type"];
  is_active: boolean;
};

type CategoryAccessRow = {
  is_enabled: boolean;
  subscription_plans:
    | Array<{
        slug: "discovery" | "standard" | "elite";
      }>
    | {
        slug: "discovery" | "standard" | "elite";
      }
    | null;
};

type WordSearchRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: WordSearchGrid["difficulty"];
  time_limit_seconds: number;
  grid_data: string[][];
  words: WordSearchGrid["words"];
  created_at?: string;
  allowed_plans?: Array<"discovery" | "standard" | "elite">;
};

type FillBlankExerciseRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: FillBlankExercise["difficulty"];
  time_limit_seconds: number;
  allowed_plans?: Array<"discovery" | "standard" | "elite">;
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
  allowed_plans?: Array<"discovery" | "standard" | "elite">;
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
  created_at: string;
  updated_at: string;
  dictionary_translations: Array<{
    locale: Locale;
    word: string;
    description: string | null;
    is_primary: boolean | null;
  }>;
};

type DictionaryProgressRow = {
  views_count: number | null;
  learned_count: number | null;
  last_learned_day: number | null;
};

type SplashSlideRow = {
  id: string;
  kind: SplashSlide["kind"];
  image_url: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

function deriveRequiredPlanFromAllowed(
  allowedPlans: Array<"discovery" | "standard" | "elite"> | undefined,
): "discovery" | "standard" | "elite" {
  if (!allowedPlans || allowedPlans.length === 0) {
    return "discovery";
  }

  if (allowedPlans.includes("discovery")) {
    return "discovery";
  }

  if (allowedPlans.includes("standard")) {
    return "standard";
  }

  return "elite";
}

function mapCategoryRows(
  rows: Array<CategoryRow & { content_plan_access: CategoryAccessRow[] }>,
) {
  return rows.map((row) => {
    const enabledPlans = row.content_plan_access?.flatMap((access) => {
      if (!access.is_enabled) {
        return [];
      }

      const plans = Array.isArray(access.subscription_plans)
        ? access.subscription_plans
        : access.subscription_plans
          ? [access.subscription_plans]
          : [];

      return plans.map((plan) => plan.slug);
    });

    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      description: row.description,
      type: row.type,
      isActive: row.is_active,
      requiredPlan: deriveRequiredPlanFromAllowed(enabledPlans),
      enabledPlans,
      accessConfigured: (row.content_plan_access?.length ?? 0) > 0,
    } satisfies ContentCategory;
  });
}

function hasResolvedCategoryAccess(
  rows: Array<CategoryRow & { content_plan_access: CategoryAccessRow[] }>,
) {
  return rows.some((row) => (row.content_plan_access?.length ?? 0) > 0);
}

function mergeDefaultCategories(resolvedCategories: ContentCategory[]) {
  const bySlug = new Map(resolvedCategories.map((category) => [category.slug, category]));

  categories.forEach((fallbackCategory) => {
    if (!bySlug.has(fallbackCategory.slug)) {
      bySlug.set(fallbackCategory.slug, fallbackCategory);
    }
  });

  return Array.from(bySlug.values());
}

function mapWordSearchRows(rows: WordSearchRow[]) {
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    difficulty: row.difficulty,
    timeLimitSeconds: row.time_limit_seconds,
    gridData: row.grid_data,
    words: row.words,
    createdAt: row.created_at,
  }));
}

function mapFillBlankRows(rows: FillBlankExerciseRow[]) {
  return rows.map((row) => ({
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

function mapImageHuntRows(rows: ImageHuntExerciseRow[]) {
  return rows.map((row) => ({
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

function mapDictionaryRows(rows: DictionaryEntryRow[]): DictionaryEntry[] {
  return rows.map((row) => ({
    ...(function () {
      const translationsByLocale = (row.dictionary_translations ?? []).reduce<
        Partial<Record<Locale, DictionaryEntry["translations"][Locale]>>
      >((accumulator, translation) => {
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
        translations: translationsByLocale as DictionaryEntry["translations"],
        tamilSynonyms,
      };
    })(),
    id: row.id,
    slug: row.slug,
    imageUrl: row.image_url,
    category: row.category,
    subcategory: row.subcategory,
    type: row.type,
    example: row.example,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

function mapSplashRows(rows: SplashSlideRow[]): SplashSlide[] {
  return rows.map((row) => ({
    id: row.id,
    kind: row.kind,
    imageUrl: row.image_url,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getContentCategories() {
  if (!hasSupabaseEnv()) {
    return categories;
  }

  const adminClient = createSupabaseAdminClient();

  if (adminClient) {
    const { data: adminData } = await adminClient
      .from("content_categories")
      .select("id, slug, title, description, type, is_active, content_plan_access(is_enabled, subscription_plans(slug))")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (adminData && adminData.length > 0) {
      return mergeDefaultCategories(mapCategoryRows(
        adminData as Array<CategoryRow & { content_plan_access: CategoryAccessRow[] }>,
      ));
    }
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return categories;
  }

  const { data } = await supabase
    .from("content_categories")
    .select("id, slug, title, description, type, is_active, content_plan_access(is_enabled, subscription_plans(slug))")
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (data && data.length > 0) {
    const typedData = data as Array<CategoryRow & { content_plan_access: CategoryAccessRow[] }>;

    if (hasResolvedCategoryAccess(typedData)) {
      return mergeDefaultCategories(mapCategoryRows(typedData));
    }
  }

  return categories;
}

export async function getWordSearchGrids() {
  if (!hasSupabaseEnv()) {
    return wordSearchGrids;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return wordSearchGrids;
  }

  const { data } = await supabase
    .from("word_search_grids")
    .select("id, slug, title, description, difficulty, time_limit_seconds, grid_data, words, created_at, allowed_plans")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (data && data.length > 0) {
    return mapWordSearchRows(data as WordSearchRow[]);
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return wordSearchGrids;
  }

  const { data: adminData } = await adminClient
    .from("word_search_grids")
    .select("id, slug, title, description, difficulty, time_limit_seconds, grid_data, words, created_at, allowed_plans")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!adminData || adminData.length === 0) {
    return [];
  }

  return mapWordSearchRows(adminData as WordSearchRow[]);
}

export async function getWordSearchGrid(id: string) {
  const grids = await getWordSearchGrids();
  return grids.find((entry) => entry.id === id) ?? null;
}

export async function getWordSearchGridUserScores() {
  if (!hasSupabaseEnv()) {
    return {} as Record<string, number>;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {} as Record<string, number>;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {} as Record<string, number>;
  }

  const { data } = await supabase
    .from("word_search_scores")
    .select("grid_id, score")
    .eq("user_id", user.id);

  if (!data || data.length === 0) {
    return {} as Record<string, number>;
  }

  return data.reduce<Record<string, number>>((accumulator, row) => {
    const currentBest = accumulator[row.grid_id] ?? 0;
    accumulator[row.grid_id] = Math.max(currentBest, row.score ?? 0);
    return accumulator;
  }, {});
}

export async function getFillBlankExercises() {
  if (!hasSupabaseEnv()) {
    return fillBlankExercises;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return fillBlankExercises;
  }

  const { data } = await supabase
    .from("fill_blank_exercises")
    .select(
      "id, slug, title, description, difficulty, time_limit_seconds, allowed_plans, fill_blank_questions(id, sentence_template, sentence_translation, explanation, fill_blank_options(option_text, is_correct))",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (data) {
    return mapFillBlankRows(data as FillBlankExerciseRow[]);
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return fillBlankExercises;
  }

  const { data: adminData } = await adminClient
    .from("fill_blank_exercises")
    .select(
      "id, slug, title, description, difficulty, time_limit_seconds, allowed_plans, fill_blank_questions(id, sentence_template, sentence_translation, explanation, fill_blank_options(option_text, is_correct))",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!adminData) {
    return fillBlankExercises;
  }

  return mapFillBlankRows(adminData as FillBlankExerciseRow[]);
}

export async function getFillBlankExercise(id: string) {
  const exercises = await getFillBlankExercises();
  return exercises.find((entry) => entry.id === id) ?? null;
}

export async function getImageHuntExercises() {
  if (!hasSupabaseEnv()) {
    return imageHuntExercises;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return imageHuntExercises;
  }

  const { data } = await supabase
    .from("image_hunt_exercises")
    .select(
      "id, slug, title, description, difficulty, time_limit_seconds, allowed_plans, image_hunt_prompts(instruction_translation), image_hunt_targets(id, label_ta, label_translation, coordinates)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (data) {
    return mapImageHuntRows(data as ImageHuntExerciseRow[]);
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return imageHuntExercises;
  }

  const { data: adminData } = await adminClient
    .from("image_hunt_exercises")
    .select(
      "id, slug, title, description, difficulty, time_limit_seconds, allowed_plans, image_hunt_prompts(instruction_translation), image_hunt_targets(id, label_ta, label_translation, coordinates)",
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!adminData) {
    return imageHuntExercises;
  }

  return mapImageHuntRows(adminData as ImageHuntExerciseRow[]);
}

export async function getImageHuntExercise(id: string) {
  const exercises = await getImageHuntExercises();
  return exercises.find((entry) => entry.id === id) ?? null;
}

export async function getDictionaryEntries() {
  if (!hasSupabaseEnv()) {
    return [] as DictionaryEntry[];
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [] as DictionaryEntry[];
  }

  const { data } = await supabase
    .from("dictionary_entries")
    .select("id, slug, image_url, category, subcategory, type, example, created_at, updated_at, dictionary_translations(locale, word, description, is_primary)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (data && data.length > 0) {
    return mapDictionaryRows(data as DictionaryEntryRow[]);
  }

  const adminClient = createSupabaseAdminClient();

  if (!adminClient) {
    return [] as DictionaryEntry[];
  }

  const { data: adminData } = await adminClient
    .from("dictionary_entries")
    .select("id, slug, image_url, category, subcategory, type, example, created_at, updated_at, dictionary_translations(locale, word, description, is_primary)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (!adminData || adminData.length === 0) {
    return [] as DictionaryEntry[];
  }

  return mapDictionaryRows(adminData as DictionaryEntryRow[]);
}

export async function getDictionaryProgressSummary() {
  if (!hasSupabaseEnv()) {
    return {
      totalViewed: 0,
      totalLearned: 0,
      totalMastered: 0,
      reviewedToday: 0,
    } satisfies DictionaryProgressSummary;
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return {
      totalViewed: 0,
      totalLearned: 0,
      totalMastered: 0,
      reviewedToday: 0,
    } satisfies DictionaryProgressSummary;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      totalViewed: 0,
      totalLearned: 0,
      totalMastered: 0,
      reviewedToday: 0,
    } satisfies DictionaryProgressSummary;
  }

  const { data } = await supabase
    .from("dictionary_progress")
    .select("views_count, learned_count, last_learned_day")
    .eq("user_id", user.id);

  const today = Math.floor(Date.now() / 86_400_000);
  const rows = (data ?? []) as DictionaryProgressRow[];

  return {
    totalViewed: rows.filter((row) => Number(row.views_count ?? 0) > 0).length,
    totalLearned: rows.filter((row) => Number(row.learned_count ?? 0) > 0).length,
    totalMastered: rows.filter((row) => Number(row.learned_count ?? 0) >= 3).length,
    reviewedToday: rows.filter((row) => Number(row.last_learned_day ?? -1) === today).length,
  } satisfies DictionaryProgressSummary;
}

export async function getHomeSplashSlides() {
  if (!hasSupabaseEnv()) {
    return homeSplashSlides;
  }

  const adminClient = createSupabaseAdminClient();

  if (adminClient) {
    try {
      const { data } = await adminClient
        .from("home_splash_slides")
        .select("id, kind, image_url, sort_order, is_active, created_at, updated_at")
        .eq("is_active", true)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });

      if (data) {
        return mapSplashRows(data as SplashSlideRow[]);
      }
    } catch {}
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return homeSplashSlides;
  }

  try {
    const { data } = await supabase
      .from("home_splash_slides")
      .select("id, kind, image_url, sort_order, is_active, created_at, updated_at")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (data) {
      return mapSplashRows(data as SplashSlideRow[]);
    }
  } catch {
    return homeSplashSlides;
  }

  return homeSplashSlides;
}
