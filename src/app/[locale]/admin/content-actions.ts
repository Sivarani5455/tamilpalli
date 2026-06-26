"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { AuthState } from "@/types";

const wordSearchSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeLimitSeconds: z.coerce.number().int().positive(),
  gridData: z.string().min(2),
  words: z.string().min(2),
});

const fillBlankSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeLimitSeconds: z.coerce.number().int().positive(),
  sentenceTemplate: z.string().min(2),
  translationEn: z.string().min(1),
  explanationEn: z.string().min(1),
  options: z.string().min(2),
  correctAnswer: z.string().min(1),
});

const imageHuntSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeLimitSeconds: z.coerce.number().int().positive(),
  instructionEn: z.string().min(2),
  targets: z.string().min(2),
});

const dictionarySchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  slug: z.string().min(2),
  imageUrl: z.string().url().optional().or(z.literal("")),
  category: z.string().min(1),
  subcategory: z.string().min(1),
  type: z.string().min(1),
  example: z.string().min(1),
  tamilSynonyms: z.string().optional().default(""),
  wordEn: z.string().min(1),
  wordTa: z.string().min(1),
  descriptionTa: z.string().min(1),
  wordFr: z.string().min(1),
});

const splashSlideSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  kind: z.enum(["intro", "fullscreen"]),
  imageUrl: z.string().url(),
  sortOrder: z.coerce.number().int().min(0),
  isActive: z.string().optional(),
});

const splashMoveSchema = z.object({
  id: z.string().min(1),
  locale: z.string().min(2),
  direction: z.enum(["up", "down"]),
});

function parseDictionarySynonyms(value: string) {
  return Array.from(
    new Set(
      value
        .split(/\r?\n|,|;/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function parseJsonField<T>(value: string, label: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`${label} must be valid JSON.`);
  }
}

function stateError(error: unknown): AuthState {
  return {
    ok: false,
    message: error instanceof Error ? error.message : "Unexpected error.",
  };
}

function isRedirectLikeError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof (error as { digest?: unknown }).digest === "string" &&
    (error as { digest: string }).digest.startsWith("NEXT_REDIRECT")
  );
}

function missingSupabaseState(entity: string): AuthState {
  return {
    ok: true,
    message: `${entity} saved in scaffold mode. Add Supabase env vars to persist it in the database.`,
  };
}

function requireAdminClient() {
  const supabase = createSupabaseAdminClient();

  if (!supabase) {
    throw new Error("Supabase service role key is missing.");
  }

  return supabase;
}

function revalidateSharedSplashPaths() {
  for (const locale of ["en", "ta", "fr"] as const) {
    revalidatePath(`/${locale}`);
    revalidatePath(`/${locale}/admin/splash`);
  }
}

export async function upsertWordSearchAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = wordSearchSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Word Search grid");
  }

  try {
    const supabase = requireAdminClient();

    const payload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      time_limit_seconds: parsed.data.timeLimitSeconds,
      grid_data: parseJsonField<string[][]>(parsed.data.gridData, "Grid data"),
      words: parseJsonField(parsed.data.words, "Words"),
      is_active: true,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("word_search_grids")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("word_search_grids").insert(payload);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath(`/${parsed.data.locale}/admin/word-search`);
    redirect(`/${parsed.data.locale}/admin/word-search`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deleteWordSearchAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();
    await supabase.from("word_search_grids").delete().eq("id", id);
  }

  revalidatePath(`/${locale}/admin/word-search`);
}

export async function upsertFillBlankAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = fillBlankSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Fill in the Blanks exercise");
  }

  try {
    const supabase = requireAdminClient();

    const exercisePayload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      time_limit_seconds: parsed.data.timeLimitSeconds,
    };

    let exerciseId = parsed.data.id;

    if (exerciseId) {
      const { error: updateError } = await supabase
        .from("fill_blank_exercises")
        .update(exercisePayload)
        .eq("id", exerciseId);
      if (updateError) {
        throw new Error(updateError.message);
      }

      const { error: deleteError } = await supabase
        .from("fill_blank_questions")
        .delete()
        .eq("exercise_id", exerciseId);
      if (deleteError) {
        throw new Error(deleteError.message);
      }
    } else {
      const { data, error } = await supabase
        .from("fill_blank_exercises")
        .insert(exercisePayload)
        .select("id")
        .single<{ id: string }>();
      if (error) {
        throw new Error(error.message);
      }
      exerciseId = data?.id;
    }

    if (!exerciseId) {
      throw new Error("Exercise id was not created.");
    }

    const { data: question, error: questionError } = await supabase
      .from("fill_blank_questions")
      .insert({
        exercise_id: exerciseId,
        sentence_template: parsed.data.sentenceTemplate,
        sentence_translation: {
          en: parsed.data.translationEn,
        },
        explanation: {
          en: parsed.data.explanationEn,
        },
      })
      .select("id")
      .single<{ id: string }>();

    if (questionError) {
      throw new Error(questionError.message);
    }

    const options = parsed.data.options
      .split("\n")
      .map((option) => option.trim())
      .filter(Boolean);

    const { error: optionsError } = await supabase.from("fill_blank_options").insert(
      options.map((option, index) => ({
        question_id: question?.id,
        option_text: option,
        is_correct: option === parsed.data.correctAnswer,
        order_index: index,
      })),
    );

    if (optionsError) {
      throw new Error(optionsError.message);
    }

    revalidatePath(`/${parsed.data.locale}/admin/fill-in-the-blanks`);
    redirect(`/${parsed.data.locale}/admin/fill-in-the-blanks`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deleteFillBlankAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();
    await supabase.from("fill_blank_exercises").delete().eq("id", id);
  }

  revalidatePath(`/${locale}/admin/fill-in-the-blanks`);
}

export async function upsertImageHuntAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = imageHuntSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Image Hunt exercise");
  }

  try {
    const supabase = requireAdminClient();

    const exercisePayload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      time_limit_seconds: parsed.data.timeLimitSeconds,
    };

    let exerciseId = parsed.data.id;

    if (exerciseId) {
      const { error: updateError } = await supabase
        .from("image_hunt_exercises")
        .update(exercisePayload)
        .eq("id", exerciseId);
      if (updateError) {
        throw new Error(updateError.message);
      }

      const { error: promptsDeleteError } = await supabase
        .from("image_hunt_prompts")
        .delete()
        .eq("exercise_id", exerciseId);
      if (promptsDeleteError) {
        throw new Error(promptsDeleteError.message);
      }

      const { error: targetsDeleteError } = await supabase
        .from("image_hunt_targets")
        .delete()
        .eq("exercise_id", exerciseId);
      if (targetsDeleteError) {
        throw new Error(targetsDeleteError.message);
      }
    } else {
      const { data, error } = await supabase
        .from("image_hunt_exercises")
        .insert(exercisePayload)
        .select("id")
        .single<{ id: string }>();
      if (error) {
        throw new Error(error.message);
      }
      exerciseId = data?.id;
    }

    if (!exerciseId) {
      throw new Error("Exercise id was not created.");
    }

    const { error: promptError } = await supabase.from("image_hunt_prompts").insert({
      exercise_id: exerciseId,
      instruction: parsed.data.instructionEn,
      instruction_ta: parsed.data.instructionEn,
      instruction_translation: { en: parsed.data.instructionEn },
    });

    if (promptError) {
      throw new Error(promptError.message);
    }

    const targets = parseJsonField<
      Array<{ labelTa: string; en: string; x: number; y: number }>
    >(parsed.data.targets, "Targets");

    const { error: targetsError } = await supabase.from("image_hunt_targets").insert(
      targets.map((target) => ({
        exercise_id: exerciseId,
        label_ta: target.labelTa,
        label_translation: { en: target.en },
        coordinates: { x: target.x, y: target.y },
      })),
    );

    if (targetsError) {
      throw new Error(targetsError.message);
    }

    revalidatePath(`/${parsed.data.locale}/admin/image-hunt`);
    redirect(`/${parsed.data.locale}/admin/image-hunt`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deleteImageHuntAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();
    await supabase.from("image_hunt_exercises").delete().eq("id", id);
  }

  revalidatePath(`/${locale}/admin/image-hunt`);
}

export async function upsertDictionaryAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = dictionarySchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Dictionary entry");
  }

  try {
    const supabase = requireAdminClient();

    let entryId = parsed.data.id;
    const isNewEntry = !entryId;

    const entryPayload = {
      slug: parsed.data.slug,
      image_url: parsed.data.imageUrl || null,
      category: parsed.data.category,
      subcategory: parsed.data.subcategory,
      type: parsed.data.type,
      example: parsed.data.example,
    };

    if (entryId) {
      const { error } = await supabase.from("dictionary_entries").update(entryPayload).eq("id", entryId);

      if (error) {
        throw new Error(error.message);
      }

      const { error: deleteTranslationsError } = await supabase
        .from("dictionary_translations")
        .delete()
        .eq("entry_id", entryId);

      if (deleteTranslationsError) {
        throw new Error(deleteTranslationsError.message);
      }
    } else {
      const { data, error } = await supabase
        .from("dictionary_entries")
        .insert(entryPayload)
        .select("id")
        .single<{ id: string }>();

      if (error) {
        throw new Error(error.message);
      }

      entryId = data?.id;
    }

    if (!entryId) {
      throw new Error("Dictionary entry id was not created.");
    }

    const tamilSynonyms = parseDictionarySynonyms(parsed.data.tamilSynonyms).filter(
      (word) => word !== parsed.data.wordTa,
    );

    const { error: translationsError } = await supabase.from("dictionary_translations").insert([
      {
        entry_id: entryId,
        locale: "en",
        word: parsed.data.wordEn,
        description: null,
        is_primary: true,
      },
      {
        entry_id: entryId,
        locale: "ta",
        word: parsed.data.wordTa,
        description: parsed.data.descriptionTa,
        is_primary: true,
      },
      {
        entry_id: entryId,
        locale: "fr",
        word: parsed.data.wordFr,
        description: null,
        is_primary: true,
      },
      ...tamilSynonyms.map((word) => ({
        entry_id: entryId,
        locale: "ta" as const,
        word,
        description: parsed.data.descriptionTa,
        is_primary: false,
      })),
    ]);

    if (translationsError) {
      if (isNewEntry) {
        await supabase.from("dictionary_entries").delete().eq("id", entryId);
      }

      throw new Error(translationsError.message);
    }

    revalidatePath(`/${parsed.data.locale}/admin/dictionary`);
    redirect(`/${parsed.data.locale}/admin/dictionary`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deleteDictionaryAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();

    const { data: existingEntry } = await supabase
      .from("dictionary_entries")
      .select("slug")
      .eq("id", id)
      .maybeSingle<{ slug: string }>();

    await supabase.from("dictionary_translations").delete().eq("entry_id", id);
    await supabase.from("dictionary_entries").delete().eq("id", id);

    revalidatePath(`/${locale}/agarathi`);

    if (existingEntry?.slug) {
      revalidatePath(`/${locale}/agarathi/${existingEntry.slug}`);
    }
  }

  revalidatePath(`/${locale}/admin/dictionary`);
}

export async function upsertHomeSplashSlideAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = splashSlideSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Splash slide");
  }

  try {
    const supabase = requireAdminClient();
    const payload = {
      kind: parsed.data.kind,
      image_url: parsed.data.imageUrl,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive === "on",
    };

    if (parsed.data.id) {
      const { error } = await supabase.from("home_splash_slides").update(payload).eq("id", parsed.data.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("home_splash_slides").insert(payload);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidateSharedSplashPaths();
    redirect(`/${parsed.data.locale}/admin/splash`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deleteHomeSplashSlideAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();
    await supabase.from("home_splash_slides").delete().eq("id", id);
  }

  revalidateSharedSplashPaths();
  revalidatePath(`/${locale}/admin/splash`);
}

export async function moveHomeSplashSlideAction(formData: FormData) {
  const parsed = splashMoveSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success || !hasSupabaseEnv()) {
    return;
  }

  const supabase = requireAdminClient();

  const { data } = await supabase
    .from("home_splash_slides")
    .select("id, sort_order, created_at")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (!data || data.length < 2) {
    return;
  }

  const currentIndex = data.findIndex((slide) => slide.id === parsed.data.id);

  if (currentIndex === -1) {
    return;
  }

  const targetIndex =
    parsed.data.direction === "up"
      ? Math.max(0, currentIndex - 1)
      : Math.min(data.length - 1, currentIndex + 1);

  if (targetIndex === currentIndex) {
    return;
  }

  const reordered = [...data];
  const [moved] = reordered.splice(currentIndex, 1);
  reordered.splice(targetIndex, 0, moved);

  await Promise.all(
    reordered.map((slide, index) =>
      supabase.from("home_splash_slides").update({ sort_order: index }).eq("id", slide.id),
    ),
  );

  revalidateSharedSplashPaths();
  revalidatePath(`/${parsed.data.locale}/admin/splash`);
}
