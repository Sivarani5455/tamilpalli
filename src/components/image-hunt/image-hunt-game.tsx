"use client";

import { useActionState, useEffect, useState } from "react";

import { saveImageHuntScoreAction } from "@/app/[locale]/game-actions";
import { initialGameState } from "@/lib/action-states";
import { Timer } from "@/components/shared/timer";
import type { ImageHuntExercise, Locale } from "@/types";

export function ImageHuntGame({
  exercise,
  locale,
}: {
  exercise: ImageHuntExercise;
  locale: Locale;
}) {
  const [found, setFound] = useState<string[]>([]);
  const [lastFound, setLastFound] = useState<string>("");
  const [timeUsedSeconds, setTimeUsedSeconds] = useState(0);
  const [state, formAction] = useActionState(saveImageHuntScoreAction, initialGameState);
  const score = found.length * 50;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeUsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
      <article className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-slate-950">{exercise.title}</h2>
            <p className="text-sm text-slate-500">{exercise.instruction[locale]}</p>
          </div>
          <div className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
            <Timer initialSeconds={exercise.timeLimitSeconds} />
          </div>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_left,_#f59e0b,_transparent_28%),radial-gradient(circle_at_bottom_right,_#22c55e,_transparent_30%),linear-gradient(135deg,_#0f172a,_#1e293b_45%,_#334155)]">
          <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:48px_48px]" />
          {exercise.targets.map((target) => (
            <button
              key={target.id}
              type="button"
              onClick={() => {
                if (!found.includes(target.id)) {
                  setFound((current) => [...current, target.id]);
                  setLastFound(`${target.labelTa} = ${target.translation[locale]}`);
                }
              }}
              className={`absolute h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 ${
                found.includes(target.id)
                  ? "border-emerald-300 bg-emerald-400/50"
                  : "border-white/80 bg-white/15 backdrop-blur"
              }`}
              style={{ left: `${target.x}%`, top: `${target.y}%` }}
              aria-label={target.translation[locale]}
            />
          ))}
        </div>
      </article>
      <aside className="space-y-4">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Progress</p>
          <p className="mt-3 text-4xl font-semibold text-slate-950">
            {found.length} / {exercise.targets.length}
          </p>
          <p className="mt-2 text-sm text-slate-500">Each correct tap reveals a learned Tamil word.</p>
          <form action={formAction} className="mt-4 space-y-3">
            <input type="hidden" name="exerciseId" value={exercise.id} />
            <input type="hidden" name="score" value={score} />
            <input type="hidden" name="totalTargets" value={exercise.targets.length} />
            <input type="hidden" name="foundTargets" value={found.length} />
            <input type="hidden" name="wrongClicks" value={0} />
            <input type="hidden" name="hintsUsed" value={0} />
            <input type="hidden" name="timeUsedSeconds" value={timeUsedSeconds} />
            <input type="hidden" name="path" value={`/${locale}/image-hunt/${exercise.id}`} />
            <button className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
              Save progress
            </button>
            {state.message ? <p className={`text-xs ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>{state.message}</p> : null}
          </form>
        </div>
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <h3 className="font-display text-2xl text-slate-950">Last word learned</h3>
          <p className="mt-4 text-sm text-slate-600">{lastFound || "Tap a target to reveal the latest Tamil word."}</p>
        </div>
      </aside>
    </section>
  );
}
