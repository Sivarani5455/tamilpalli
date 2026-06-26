"use server";

import { revalidatePath } from "next/cache";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import type { AuthState } from "@/types";

async function getUserId() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = (await supabase?.auth.getUser()) ?? { data: { user: null } };

  return {
    supabase,
    userId: user?.id ?? null,
  };
}

export async function saveWordSearchScoreAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { ok: true, message: "Score saved in demo mode only. Configure Supabase to persist it." };
  }

  const { supabase, userId } = await getUserId();

  if (!supabase || !userId) {
    return { ok: false, message: "You must be logged in to save your score." };
  }

  await supabase.from("word_search_scores").insert({
    user_id: userId,
    grid_id: String(formData.get("gridId")),
    score: Number(formData.get("score") ?? 0),
    words_found: Number(formData.get("wordsFound") ?? 0),
    total_words: Number(formData.get("totalWords") ?? 0),
    time_used_seconds: Number(formData.get("timeUsedSeconds") ?? 0),
  });

  revalidatePath(String(formData.get("path") ?? "/"));
  return { ok: true, message: "Word Search score saved." };
}

export async function saveFillBlankScoreAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { ok: true, message: "Result saved in demo mode only. Configure Supabase to persist it." };
  }

  const { supabase, userId } = await getUserId();

  if (!supabase || !userId) {
    return { ok: false, message: "You must be logged in to save your result." };
  }

  await supabase.from("fill_blank_scores").insert({
    user_id: userId,
    exercise_id: String(formData.get("exerciseId")),
    score: Number(formData.get("score") ?? 0),
    total_questions: Number(formData.get("totalQuestions") ?? 0),
    correct_answers: Number(formData.get("correctAnswers") ?? 0),
    wrong_answers: Number(formData.get("wrongAnswers") ?? 0),
    attempts_count: Number(formData.get("attemptsCount") ?? 1),
    time_used_seconds: Number(formData.get("timeUsedSeconds") ?? 0),
  });

  revalidatePath(String(formData.get("path") ?? "/"));
  return { ok: true, message: "Fill in the Blanks result saved." };
}

export async function saveImageHuntScoreAction(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { ok: true, message: "Progress saved in demo mode only. Configure Supabase to persist it." };
  }

  const { supabase, userId } = await getUserId();

  if (!supabase || !userId) {
    return { ok: false, message: "You must be logged in to save your result." };
  }

  await supabase.from("image_hunt_scores").insert({
    user_id: userId,
    exercise_id: String(formData.get("exerciseId")),
    score: Number(formData.get("score") ?? 0),
    total_targets: Number(formData.get("totalTargets") ?? 0),
    found_targets: Number(formData.get("foundTargets") ?? 0),
    wrong_clicks: Number(formData.get("wrongClicks") ?? 0),
    hints_used: Number(formData.get("hintsUsed") ?? 0),
    time_used_seconds: Number(formData.get("timeUsedSeconds") ?? 0),
  });

  revalidatePath(String(formData.get("path") ?? "/"));
  return { ok: true, message: "Image Hunt score saved." };
}
