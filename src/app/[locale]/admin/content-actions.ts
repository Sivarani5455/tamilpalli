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
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeLimitSeconds: z.coerce.number().int().positive(),
  questions: z.string().min(2),
});

const fillBlankQuestionSchema = z
  .object({
    sentenceTemplate: z.string().min(2),
    translationEn: z.string().min(1),
    translationFr: z.string().min(1),
    explanationEn: z.string().min(1),
    explanationFr: z.string().min(1),
    explanationTa: z.string().min(1),
    blanks: z
      .array(
        z.object({
          key: z.string().min(1),
          options: z.array(z.string().min(1)).min(2),
          correctAnswer: z.string().min(1),
        }),
      )
      .min(1),
  })
  .superRefine((question, context) => {
    question.blanks.forEach((blank, index) => {
      if (!blank.options.includes(blank.correctAnswer)) {
        context.addIssue({
          code: "custom",
          message: "Each correct answer must be one of its blank options.",
          path: ["blanks", index, "correctAnswer"],
        });
      }
    });
  });

const imageHuntSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  title: z.string().min(2),
  slug: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeLimitSeconds: z.coerce.number().int().positive(),
  imageUrl: z.string().optional().default(""),
  instructionEn: z.string().min(2),
  targets: z.string().min(2),
});

const nimishamSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeLimitSeconds: z.coerce.number().int().positive(),
  promptEn: z.string().min(2),
  promptFr: z.string().min(2),
  promptTa: z.string().min(2),
  words: z.string().min(2),
});

const nimishamWordSchema = z.object({
  id: z.string().min(1),
  word: z.string().min(1),
  translation: z
    .object({
      en: z.string().optional(),
      fr: z.string().optional(),
      ta: z.string().optional(),
    })
    .optional()
    .default({}),
  isCorrect: z.boolean(),
});

const dictionarySchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  slug: z.string().min(2),
  imageUrl: z.string().url().optional().or(z.literal("")),
  type: z.string().min(1),
  example: z.string().min(1),
  tamilSynonyms: z.string().optional().default(""),
  wordEn: z.string().min(1),
  wordTa: z.string().min(1),
  descriptionTa: z.string().min(1),
  wordFr: z.string().min(1),
});

const dictionaryCsvHeaders = [
  "english_word",
  "slug",
  "type",
  "example",
  "tamil_main_word",
  "french_word",
  "tamil_synonyms",
  "tamil_description",
  "image_url",
] as const;

const dictionaryCsvRowSchema = z.object({
  english_word: z.string().min(1),
  slug: z.string().min(2),
  type: z.string().min(1),
  example: z.string().min(1),
  tamil_main_word: z.string().min(1),
  french_word: z.string().min(1),
  tamil_synonyms: z.string().optional().default(""),
  tamil_description: z.string().min(1),
  image_url: z.string().url().optional().or(z.literal("")),
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

function parseCsvLine(line: string) {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (inQuotes) {
    throw new Error("CSV invalide: guillemet non ferme.");
  }

  values.push(current.trim());
  return values;
}

function parseDictionaryCsv(text: string) {
  const normalizedText = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("Le CSV doit contenir une ligne d'en-tete et au moins un mot.");
  }

  const headers = parseCsvLine(lines[0]);
  const expectedHeaders = [...dictionaryCsvHeaders];

  if (headers.length !== expectedHeaders.length || headers.some((header, index) => header !== expectedHeaders[index])) {
    throw new Error(`Format CSV invalide. En-tete attendu: ${expectedHeaders.join(", ")}`);
  }

  return lines.slice(1).map((line, lineIndex) => {
    const values = parseCsvLine(line);

    if (values.length !== expectedHeaders.length) {
      throw new Error(`Ligne ${lineIndex + 2}: ${expectedHeaders.length} colonnes attendues, ${values.length} recues.`);
    }

    const rawRow = Object.fromEntries(expectedHeaders.map((header, index) => [header, values[index]]));
    const parsed = dictionaryCsvRowSchema.safeParse(rawRow);

    if (!parsed.success) {
      throw new Error(`Ligne ${lineIndex + 2}: ${parsed.error.issues[0]?.message ?? "donnees invalides"}.`);
    }

    return parsed.data;
  });
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
    const words = parseJsonField<unknown[]>(parsed.data.words, "Words");

    if (!Array.isArray(words)) {
      throw new Error("Words must be a JSON array.");
    }

    if (words.length % 2 !== 0) {
      throw new Error(
        `Word Search grids must use an even number of Tamil source words. Current total: ${words.length}.`,
      );
    }

    const payload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      time_limit_seconds: parsed.data.timeLimitSeconds,
      grid_data: parseJsonField<string[][]>(parsed.data.gridData, "Grid data"),
      words,
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

  let parsedQuestions: Array<z.infer<typeof fillBlankQuestionSchema>>;

  try {
    const rawQuestions = JSON.parse(parsed.data.questions) as unknown;
    const questionList = z.array(fillBlankQuestionSchema).min(1).safeParse(rawQuestions);

    if (!questionList.success) {
      return stateError(questionList.error.issues[0]?.message ?? "Invalid questions.");
    }

    parsedQuestions = questionList.data;
  } catch {
    return stateError("Invalid questions.");
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Fill in the Blanks exercise");
  }

  try {
    const supabase = requireAdminClient();

    const exercisePayload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.title,
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

    for (const [questionIndex, questionInput] of parsedQuestions.entries()) {
      const { data: question, error: questionError } = await supabase
        .from("fill_blank_questions")
        .insert({
          exercise_id: exerciseId,
          sentence_template: questionInput.sentenceTemplate,
          sentence_translation: {
            en: questionInput.translationEn,
            fr: questionInput.translationFr,
          },
          explanation: {
            en: questionInput.explanationEn,
            fr: questionInput.explanationFr,
            ta: questionInput.explanationTa,
          },
          order_index: questionIndex,
        })
        .select("id")
        .single<{ id: string }>();

      if (questionError) {
        throw new Error(questionError.message);
      }

      const { error: optionsError } = await supabase.from("fill_blank_options").insert(
        questionInput.blanks.flatMap((blank) =>
          blank.options.map((option, index) => ({
            question_id: question?.id,
            blank_key: blank.key,
            option_text: option,
            is_correct: option === blank.correctAnswer,
            order_index: index,
          })),
        ),
      );

      if (optionsError) {
        throw new Error(optionsError.message);
      }
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
      description: parsed.data.title,
      image_url: parsed.data.imageUrl || null,
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
      Array<{ labelTa: string; en: string; fr?: string; x: number; y: number; radius?: number; width?: number; height?: number }>
    >(parsed.data.targets, "Targets");

    const { error: targetsError } = await supabase.from("image_hunt_targets").insert(
      targets.map((target) => ({
        exercise_id: exerciseId,
        label_ta: target.labelTa,
        label_translation: { en: target.en, fr: target.fr || target.en, ta: target.labelTa },
        coordinates: {
          x: target.x,
          y: target.y,
          radius: target.radius ?? Math.max(target.width ?? 20, target.height ?? 20) / 2,
          width: target.width ?? (target.radius ?? 10) * 2,
          height: target.height ?? (target.radius ?? 10) * 2,
        },
      })),
    );

    if (targetsError) {
      throw new Error(targetsError.message);
    }

    revalidatePath(`/${parsed.data.locale}/admin/image-hunt`);
    revalidatePath(`/${parsed.data.locale}/image-hunt`);
    revalidatePath(`/${parsed.data.locale}/image-hunt/${exerciseId}`);
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

export async function upsertNimishamAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = nimishamSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  let words: Array<z.infer<typeof nimishamWordSchema>>;

  try {
    const rawWords = JSON.parse(parsed.data.words) as unknown;
    const wordList = z.array(nimishamWordSchema).min(1).safeParse(rawWords);

    if (!wordList.success) {
      return stateError(wordList.error.issues[0]?.message ?? "Invalid words.");
    }

    words = wordList.data.map((word, index) => ({
      ...word,
      id: word.id || `word-${index + 1}`,
      translation: {
        en: word.translation.en || word.word,
        fr: word.translation.fr || word.translation.en || word.word,
        ta: word.translation.ta || word.word,
      },
    }));
  } catch {
    return stateError("Invalid words JSON.");
  }

  if (!words.some((word) => word.isCorrect)) {
    return stateError("At least one word must be marked correct.");
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Nimisham exercise");
  }

  try {
    const supabase = requireAdminClient();
    const payload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      time_limit_seconds: parsed.data.timeLimitSeconds,
      prompt_translation: {
        en: parsed.data.promptEn,
        fr: parsed.data.promptFr,
        ta: parsed.data.promptTa,
      },
      words,
      is_active: true,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("nimisham_exercises")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("nimisham_exercises").insert(payload);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath(`/${parsed.data.locale}/admin/nimisham`);
    revalidatePath(`/${parsed.data.locale}/nimisham`);
    redirect(`/${parsed.data.locale}/admin/nimisham`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deleteNimishamAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();
    await supabase.from("nimisham_exercises").delete().eq("id", id);
  }

  revalidatePath(`/${locale}/admin/nimisham`);
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

export async function importDictionaryCsvAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const locale = String(formData.get("locale") ?? "en");
  const file = formData.get("csvFile");

  if (!(file instanceof File) || file.size === 0) {
    return stateError("Ajoutez un fichier CSV a importer.");
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return stateError("Le fichier doit etre un CSV.");
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Dictionary CSV import");
  }

  try {
    const rows = parseDictionaryCsv(await file.text());

    if (rows.length === 0) {
      return stateError("Le CSV ne contient aucun mot a importer.");
    }

    const seenSlugs = new Set<string>();
    const duplicateSlug = rows.find((row) => {
      if (seenSlugs.has(row.slug)) {
        return true;
      }

      seenSlugs.add(row.slug);
      return false;
    })?.slug;

    if (duplicateSlug) {
      return stateError(`Le slug "${duplicateSlug}" apparait plusieurs fois dans le CSV.`);
    }

    const supabase = requireAdminClient();
    let importedCount = 0;
    let updatedCount = 0;
    let createdCount = 0;

    for (const row of rows) {
      const entryPayload = {
        slug: row.slug,
        image_url: row.image_url || null,
        type: row.type,
        example: row.example,
      };

      const { data: existingEntry, error: existingEntryError } = await supabase
        .from("dictionary_entries")
        .select("id")
        .eq("slug", row.slug)
        .maybeSingle<{ id: string }>();

      if (existingEntryError) {
        throw new Error(existingEntryError.message);
      }

      let entryId = existingEntry?.id;
      const isNewEntry = !entryId;

      if (entryId) {
        const { error: updateError } = await supabase
          .from("dictionary_entries")
          .update(entryPayload)
          .eq("id", entryId);

        if (updateError) {
          throw new Error(updateError.message);
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
        throw new Error(`Impossible de creer l'entree "${row.slug}".`);
      }

      const tamilSynonyms = parseDictionarySynonyms(row.tamil_synonyms).filter(
        (word) => word !== row.tamil_main_word,
      );

      const { error: translationsError } = await supabase.from("dictionary_translations").insert([
        {
          entry_id: entryId,
          locale: "en",
          word: row.english_word,
          description: null,
          is_primary: true,
        },
        {
          entry_id: entryId,
          locale: "ta",
          word: row.tamil_main_word,
          description: row.tamil_description,
          is_primary: true,
        },
        {
          entry_id: entryId,
          locale: "fr",
          word: row.french_word,
          description: null,
          is_primary: true,
        },
        ...tamilSynonyms.map((word) => ({
          entry_id: entryId,
          locale: "ta" as const,
          word,
          description: row.tamil_description,
          is_primary: false,
        })),
      ]);

      if (translationsError) {
        if (isNewEntry) {
          await supabase.from("dictionary_entries").delete().eq("id", entryId);
        }

        throw new Error(`Erreur sur "${row.slug}": ${translationsError.message}`);
      }

      importedCount += 1;
      createdCount += isNewEntry ? 1 : 0;
      updatedCount += isNewEntry ? 0 : 1;
    }

    revalidatePath(`/${locale}/admin/dictionary`);
    revalidatePath(`/${locale}/agarathi`);

    return {
      ok: true,
      message: `${importedCount} mot${importedCount > 1 ? "s" : ""} importe${importedCount > 1 ? "s" : ""}: ${createdCount} cree${createdCount > 1 ? "s" : ""}, ${updatedCount} mis a jour.`,
    };
  } catch (error) {
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
