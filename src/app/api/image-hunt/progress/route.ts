import { NextResponse } from "next/server";

import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ImageHuntProgressPayload = {
  exerciseId?: string;
  score?: number;
  totalTargets?: number;
  foundTargetIds?: string[];
  wrongClicks?: number;
  hintsUsed?: number;
  timeUsedSeconds?: number;
};

export async function POST(request: Request) {
  if (!hasSupabaseEnv()) {
    return NextResponse.json({ ok: true });
  }

  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  let payload: ImageHuntProgressPayload;

  try {
    payload = (await request.json()) as ImageHuntProgressPayload;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  if (!payload.exerciseId) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const foundTargetIds = Array.from(new Set(payload.foundTargetIds?.filter(Boolean) ?? []));
  const wrongClicks = Math.max(Number(payload.wrongClicks ?? 0), 0);
  const totalTargets = Math.max(Number(payload.totalTargets ?? 0), 0);

  await supabase.from("image_hunt_scores").insert({
    user_id: user.id,
    exercise_id: payload.exerciseId,
    score: Math.max(Number(payload.score ?? 0), 0),
    total_targets: totalTargets,
    found_targets: foundTargetIds.length,
    wrong_clicks: wrongClicks,
    hints_used: Math.max(Number(payload.hintsUsed ?? 0), 0),
    time_used_seconds: Math.max(Number(payload.timeUsedSeconds ?? 0), 0),
  });

  if (foundTargetIds.length > 0) {
    await supabase.from("image_hunt_user_clicks").insert(
      foundTargetIds.map((targetId) => ({
        user_id: user.id,
        exercise_id: payload.exerciseId,
        target_id: targetId,
        clicked_x: 0,
        clicked_y: 0,
        is_correct: true,
      })),
    );
  }

  return NextResponse.json({ ok: true });
}
