"use client";

import { useActionState, useEffect, useState } from "react";

import { saveFillBlankScoreAction } from "@/app/[locale]/game-actions";
import { initialGameState } from "@/lib/action-states";
import { Timer } from "@/components/shared/timer";
import type { FillBlankExercise, Locale } from "@/types";

export function FillBlanksGame({
  exercise,
  locale,
}: {
  exercise: FillBlankExercise;
  locale: Locale;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [timeUsedSeconds, setTimeUsedSeconds] = useState(0);
  const [state, formAction] = useActionState(saveFillBlankScoreAction, initialGameState);

  const question = exercise.questions[0];
  const isCorrect = selected === question.correctAnswer;
  const score = submitted && isCorrect ? 100 : 0;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeUsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
      <article className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-slate-950">{exercise.title}</h2>
            <p className="text-sm text-slate-500">{question.translation[locale]}</p>
          </div>
          <div className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
            <Timer initialSeconds={exercise.timeLimitSeconds} />
          </div>
        </div>
        <p className="mt-8 rounded-3xl bg-slate-100 p-6 text-2xl text-slate-900">
          {question.sentenceTemplate}
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {question.options.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSelected(option)}
              className={`rounded-2xl border px-4 py-4 text-left ${
                selected === option
                  ? "border-slate-950 bg-slate-950 text-white"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          className="mt-6 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Validate answer
        </button>
        {submitted ? (
          <form action={formAction} className="mt-4 space-y-3">
            <input type="hidden" name="exerciseId" value={exercise.id} />
            <input type="hidden" name="score" value={score} />
            <input type="hidden" name="totalQuestions" value={1} />
            <input type="hidden" name="correctAnswers" value={isCorrect ? 1 : 0} />
            <input type="hidden" name="wrongAnswers" value={isCorrect ? 0 : 1} />
            <input type="hidden" name="attemptsCount" value={1} />
            <input type="hidden" name="timeUsedSeconds" value={timeUsedSeconds} />
            <input type="hidden" name="path" value={`/${locale}/fill-in-the-blanks/${exercise.id}`} />
            <button className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
              Save result
            </button>
            {state.message ? <p className={`text-xs ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>{state.message}</p> : null}
          </form>
        ) : null}
      </article>
      <aside className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <h3 className="font-display text-2xl text-slate-950">Feedback</h3>
        {submitted ? (
          <div className="mt-4 space-y-3">
            <p className={`text-lg font-semibold ${isCorrect ? "text-emerald-700" : "text-rose-600"}`}>
              {isCorrect ? "Correct answer" : "Incorrect answer"}
            </p>
            <p className="text-sm text-slate-600">{question.explanation[locale]}</p>
            {!isCorrect ? (
              <p className="text-sm text-slate-500">Expected: {question.correctAnswer}</p>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Choose an option to receive pedagogical feedback.</p>
        )}
      </aside>
    </section>
  );
}
