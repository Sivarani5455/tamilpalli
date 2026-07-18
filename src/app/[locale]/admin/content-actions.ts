"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { normalizeImageUrl } from "@/lib/image-urls";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { AuthState } from "@/types";

const publicationDateSchema = z.union([
  z.literal(""),
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid publication date"),
]);

const wordSearchSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeLimitSeconds: z.coerce.number().int().positive(),
  publishDate: publicationDateSchema,
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
  publishDate: publicationDateSchema,
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
  publishDate: publicationDateSchema,
  imageUrl: z.string().optional().default(""),
  instructionEn: z.string().min(2),
  targets: z.string().min(2),
});

const pictureSentenceSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timePerImageSeconds: z.coerce.number().int().min(5).max(300),
  publishDate: publicationDateSchema,
  cards: z.string().min(2),
});

const pictureSentenceCardSchema = z.object({
  id: z.string().min(1),
  imageUrl: z.string().trim().min(1),
  imageAlt: z.string().trim().min(1),
  choices: z
    .array(
      z.object({
        id: z.string().min(1),
        text: z.string().trim().min(1),
        isCorrect: z.boolean(),
      }),
    )
    .length(10),
}).refine((card) => card.choices.some((choice) => choice.isCorrect), {
  message: "Chaque image doit avoir au moins une bonne phrase.",
  path: ["choices"],
});

const wordHuntSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  timeLimitSeconds: z.coerce.number().int().positive(),
  publishDate: publicationDateSchema,
  promptEn: z.string().min(2),
  promptFr: z.string().min(2),
  promptTa: z.string().min(2),
  words: z.string().min(2),
});

const wordHuntWordSchema = z.object({
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

const kathaigalSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  title: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(2),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  publishDate: publicationDateSchema,
  coverImageUrl: z.string().optional().default(""),
  paragraphs: z.string().min(2),
  questions: z.string().optional().default("[]"),
});

const kathaigalParagraphSchema = z.object({
  id: z.string().min(1),
  textTa: z.string().min(2),
  imageUrl: z.string().min(1),
  imageAlt: z
    .object({
      en: z.string().optional(),
      fr: z.string().optional(),
      ta: z.string().optional(),
    })
    .optional()
    .default({}),
});

const kathaigalQuestionSchema = z.object({
  id: z.string().min(1),
  questionTa: z.string().min(2),
  choices: z.array(z.string().min(1)).length(4),
  correctChoiceIndex: z.coerce.number().int().min(0).max(3),
});

const thirukkuralSchema = z.object({
  id: z.string().optional(),
  locale: z.string(),
  number: z.coerce.number().int().positive(),
  title: z.string().min(2),
  slug: z.string().min(2),
  section: z.string().optional().default(""),
  chapter: z.string().optional().default(""),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]),
  kuralLines: z.string().min(2),
  porul: z.string().min(2),
  quiz: z.string().optional().default("[]"),
  fillBlanks: z.string().optional().default("[]"),
});

const thirukkuralQuizSchema = z.object({
  id: z.string().min(1),
  question: z.string().min(2),
  choices: z.array(z.string().min(1)).length(4),
  correctChoiceIndex: z.coerce.number().int().min(0).max(3),
});

const thirukkuralFillBlankSchema = z.object({
  id: z.string().min(1),
  template: z.string().min(2),
  answer: z.string().min(1),
  options: z.array(z.string().min(1)).min(2),
});

const thirukkuralCsvHeaders = [
  "number",
  "title",
  "section",
  "chapter",
  "difficulty",
  "line_1",
  "line_2",
  "porul",
] as const;

const thirukkuralCsvRowSchema = z.object({
  number: z.coerce.number().int().min(1).max(1330),
  title: z.string().optional().default(""),
  section: z.string().optional().default(""),
  chapter: z.string().optional().default(""),
  difficulty: z.union([z.enum(["beginner", "intermediate", "advanced"]), z.literal("")]),
  line_1: z.string().min(1),
  line_2: z.string().min(1),
  porul: z.string().min(2),
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

function parseThirukkuralCsv(text: string) {
  const normalizedText = text.replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const lines = normalizedText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error("Le CSV doit contenir une ligne d'en-tete et au moins un kural.");
  }

  const headers = parseCsvLine(lines[0]);
  const expectedHeaders = [...thirukkuralCsvHeaders];

  if (headers.length !== expectedHeaders.length || headers.some((header, index) => header !== expectedHeaders[index])) {
    throw new Error(`Format CSV invalide. En-tete attendu: ${expectedHeaders.join(", ")}`);
  }

  return lines.slice(1).map((line, index) => {
    const lineNumber = index + 2;
    const values = parseCsvLine(line);

    if (values.length !== expectedHeaders.length) {
      throw new Error(`Ligne ${lineNumber}: ${expectedHeaders.length} colonnes attendues, ${values.length} recues.`);
    }

    const rawRow = Object.fromEntries(expectedHeaders.map((header, valueIndex) => [header, values[valueIndex]]));
    const parsed = thirukkuralCsvRowSchema.safeParse(rawRow);

    if (!parsed.success) {
      throw new Error(`Ligne ${lineNumber}: ${parsed.error.issues[0]?.message ?? "donnees invalides"}.`);
    }

    return {
      number: parsed.data.number,
      title: parsed.data.title.trim() || `குறள் ${parsed.data.number}`,
      slug: `thirukkural-${parsed.data.number}`,
      section: parsed.data.section.trim(),
      chapter: parsed.data.chapter.trim(),
      difficulty: parsed.data.difficulty || "beginner",
      kural_lines: [parsed.data.line_1.trim(), parsed.data.line_2.trim()],
      porul: parsed.data.porul.trim(),
      is_active: true,
    };
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
      publish_date: parsed.data.publishDate || null,
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
    revalidatePath(`/${parsed.data.locale}/word-search`);
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
      publish_date: parsed.data.publishDate || null,
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
    revalidatePath(`/${parsed.data.locale}/fill-in-the-blanks`);
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
      publish_date: parsed.data.publishDate || null,
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

export async function upsertPictureSentenceAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = pictureSentenceSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  let cards: Array<z.infer<typeof pictureSentenceCardSchema>>;

  try {
    const rawCards = parseJsonField<unknown>(parsed.data.cards, "Images et phrases");
    const parsedCards = z.array(pictureSentenceCardSchema).length(10).safeParse(rawCards);

    if (!parsedCards.success) {
      return stateError(parsedCards.error.issues[0]?.message ?? "Les 10 images sont obligatoires.");
    }

    cards = parsedCards.data.map((card) => ({
      ...card,
      imageUrl: normalizeImageUrl(card.imageUrl),
    }));
  } catch (error) {
    return stateError(error);
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Picture + Sentence game");
  }

  try {
    const supabase = requireAdminClient();
    const payload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      time_per_image_seconds: parsed.data.timePerImageSeconds,
      cards,
      publish_date: parsed.data.publishDate || null,
      is_active: true,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("picture_sentence_games")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("picture_sentence_games").insert(payload);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath(`/${parsed.data.locale}/admin/padam-vakkiyam`);
    revalidatePath(`/${parsed.data.locale}/oviyam/padam-vakkiyam`);
    redirect(`/${parsed.data.locale}/admin/padam-vakkiyam`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deletePictureSentenceAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();
    await supabase.from("picture_sentence_games").delete().eq("id", id);
  }

  revalidatePath(`/${locale}/admin/padam-vakkiyam`);
  revalidatePath(`/${locale}/oviyam/padam-vakkiyam`);
}

export async function upsertWordHuntAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = wordHuntSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  let words: Array<z.infer<typeof wordHuntWordSchema>>;

  try {
    const rawWords = JSON.parse(parsed.data.words) as unknown;
    const wordList = z.array(wordHuntWordSchema).min(1).safeParse(rawWords);

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
    return missingSupabaseState("Word Hunt exercise");
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
      publish_date: parsed.data.publishDate || null,
      is_active: true,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("word_hunt_exercises")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("word_hunt_exercises").insert(payload);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath(`/${parsed.data.locale}/admin/word-hunt`);
    revalidatePath(`/${parsed.data.locale}/word-hunt`);
    redirect(`/${parsed.data.locale}/admin/word-hunt`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deleteWordHuntAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();
    await supabase.from("word_hunt_exercises").delete().eq("id", id);
  }

  revalidatePath(`/${locale}/admin/word-hunt`);
}

export async function upsertKathaigalAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = kathaigalSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  let paragraphs: Array<z.infer<typeof kathaigalParagraphSchema>>;

  try {
    const rawParagraphs = JSON.parse(parsed.data.paragraphs) as unknown;
    const paragraphList = z.array(kathaigalParagraphSchema).min(1).safeParse(rawParagraphs);

    if (!paragraphList.success) {
      return stateError(paragraphList.error.issues[0]?.message ?? "Invalid paragraphs.");
    }

    paragraphs = paragraphList.data.map((paragraph, index) => ({
      ...paragraph,
      id: paragraph.id || `paragraph-${index + 1}`,
      imageUrl: normalizeImageUrl(paragraph.imageUrl),
      imageAlt: {
        en: paragraph.imageAlt.en || parsed.data.title,
        fr: paragraph.imageAlt.fr || paragraph.imageAlt.en || parsed.data.title,
        ta: paragraph.imageAlt.ta || parsed.data.title,
      },
    }));
  } catch {
    return stateError("Invalid paragraphs JSON.");
  }

  let questions: Array<z.infer<typeof kathaigalQuestionSchema>>;

  try {
    const rawQuestions = JSON.parse(parsed.data.questions) as unknown;
    const questionList = z.array(kathaigalQuestionSchema).safeParse(rawQuestions);

    if (!questionList.success) {
      return stateError(questionList.error.issues[0]?.message ?? "Invalid questions.");
    }

    questions = questionList.data.map((question, index) => ({
      ...question,
      id: question.id || `question-${index + 1}`,
      choices: question.choices.map((choice) => choice.trim()),
    }));
  } catch {
    return stateError("Invalid questions JSON.");
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Kathaigal story");
  }

  try {
    const supabase = requireAdminClient();
    const payload = {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description,
      difficulty: parsed.data.difficulty,
      cover_image_url: normalizeImageUrl(parsed.data.coverImageUrl) || null,
      paragraphs,
      questions,
      publish_date: parsed.data.publishDate || null,
      is_active: true,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("kathaigal_stories")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("kathaigal_stories").insert(payload);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath(`/${parsed.data.locale}/admin/kathaigal`);
    revalidatePath(`/${parsed.data.locale}/kathaigal`);
    redirect(`/${parsed.data.locale}/admin/kathaigal`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deleteKathaigalAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();
    await supabase.from("kathaigal_stories").delete().eq("id", id);
  }

  revalidatePath(`/${locale}/admin/kathaigal`);
}

export async function upsertThirukkuralAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const parsed = thirukkuralSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return stateError(parsed.error.issues[0]?.message);
  }

  let quiz: Array<z.infer<typeof thirukkuralQuizSchema>>;
  let fillBlanks: Array<z.infer<typeof thirukkuralFillBlankSchema>>;

  try {
    const quizList = z.array(thirukkuralQuizSchema).safeParse(JSON.parse(parsed.data.quiz) as unknown);

    if (!quizList.success) {
      return stateError(quizList.error.issues[0]?.message ?? "Invalid quiz.");
    }

    quiz = quizList.data.map((question, index) => ({
      ...question,
      id: question.id || `quiz-${index + 1}`,
      choices: question.choices.map((choice) => choice.trim()),
    }));
  } catch {
    return stateError("Invalid quiz JSON.");
  }

  try {
    const fillBlankList = z.array(thirukkuralFillBlankSchema).safeParse(JSON.parse(parsed.data.fillBlanks) as unknown);

    if (!fillBlankList.success) {
      return stateError(fillBlankList.error.issues[0]?.message ?? "Invalid fill blank exercises.");
    }

    fillBlanks = fillBlankList.data.map((exercise, index) => ({
      ...exercise,
      id: exercise.id || `blank-${index + 1}`,
      options: exercise.options.map((option) => option.trim()),
    }));
  } catch {
    return stateError("Invalid fill blanks JSON.");
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Thirukkural lesson");
  }

  try {
    const supabase = requireAdminClient();
    const payload = {
      number: parsed.data.number,
      title: parsed.data.title,
      slug: parsed.data.slug,
      section: parsed.data.section,
      chapter: parsed.data.chapter,
      difficulty: parsed.data.difficulty,
      kural_lines: parsed.data.kuralLines
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean),
      porul: parsed.data.porul,
      quiz,
      fill_blanks: fillBlanks,
      is_active: true,
    };

    if (parsed.data.id) {
      const { error } = await supabase
        .from("thirukkural_lessons")
        .update(payload)
        .eq("id", parsed.data.id);

      if (error) {
        throw new Error(error.message);
      }
    } else {
      const { error } = await supabase.from("thirukkural_lessons").insert(payload);

      if (error) {
        throw new Error(error.message);
      }
    }

    revalidatePath(`/${parsed.data.locale}/admin/thirukkural`);
    revalidatePath(`/${parsed.data.locale}/thirukkural`);
    redirect(`/${parsed.data.locale}/admin/thirukkural`);
  } catch (error) {
    if (isRedirectLikeError(error)) {
      throw error;
    }

    return stateError(error);
  }
}

export async function deleteThirukkuralAction(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const locale = String(formData.get("locale") ?? "en");

  if (hasSupabaseEnv()) {
    const supabase = requireAdminClient();
    await supabase.from("thirukkural_lessons").delete().eq("id", id);
  }

  revalidatePath(`/${locale}/admin/thirukkural`);
}

export async function importThirukkuralCsvAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const file = formData.get("csvFile");

  if (!(file instanceof File) || file.size === 0) {
    return stateError("Ajoutez un fichier CSV a importer.");
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return stateError("Le fichier doit etre un CSV.");
  }

  if (file.size > 10 * 1024 * 1024) {
    return stateError("Le fichier CSV ne doit pas depasser 10 Mo.");
  }

  if (!hasSupabaseEnv()) {
    return missingSupabaseState("Thirukkural CSV import");
  }

  try {
    const rows = parseThirukkuralCsv(await file.text());
    const seenNumbers = new Set<number>();
    const duplicate = rows.find((row) => {
      if (seenNumbers.has(row.number)) {
        return true;
      }

      seenNumbers.add(row.number);
      return false;
    });

    if (duplicate) {
      return stateError(`Le kural numero ${duplicate.number} apparait plusieurs fois dans le CSV.`);
    }

    const supabase = requireAdminClient();
    const batchSize = 100;

    for (let index = 0; index < rows.length; index += batchSize) {
      const { error } = await supabase
        .from("thirukkural_lessons")
        .upsert(rows.slice(index, index + batchSize), { onConflict: "number" });

      if (error) {
        throw new Error(error.message);
      }
    }

    for (const locale of ["en", "ta", "fr"] as const) {
      revalidatePath(`/${locale}/admin/thirukkural`);
      revalidatePath(`/${locale}/thirukkural`);
    }

    return {
      ok: true,
      message: `${rows.length} kural${rows.length > 1 ? "s" : ""} importe${rows.length > 1 ? "s" : ""} ou mis a jour.`,
    };
  } catch (error) {
    return stateError(error);
  }
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
