"use client";

import { useActionState, useEffect, useState } from "react";
import type { ReactNode } from "react";

import { saveFillBlankScoreAction } from "@/app/[locale]/game-actions";
import { initialGameState } from "@/lib/action-states";
import { Timer } from "@/components/shared/timer";
import type { FillBlankExercise, Locale } from "@/types";

function getQuestionBlanks(question: FillBlankExercise["questions"][number]) {
  return question.blanks?.length
    ? question.blanks
    : [
        {
          key: "blank_1",
          options: question.options,
          correctAnswer: question.correctAnswer,
        },
      ];
}

function getLocalizedValue(values: Partial<Record<Locale, string>>, locale: Locale) {
  return values[locale] ?? values.en ?? values.fr ?? values.ta ?? "";
}

function renderSentenceWithBlanks(
  sentence: string,
  blanks: ReturnType<typeof getQuestionBlanks>,
  answers: Record<string, string>,
) {
  const nodes: ReactNode[] = [];
  const pattern = /\[([a-zA-Z0-9_-]+)\]|_{2,}/g;
  let lastIndex = 0;
  let legacyBlankIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(sentence)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(sentence.slice(lastIndex, match.index));
    }

    const key = match[1] ?? blanks[legacyBlankIndex]?.key ?? "blank_1";
    legacyBlankIndex += match[1] ? 0 : 1;
    nodes.push(
      <span key={`${key}-${match.index}`} className="mx-1 inline-flex min-w-20 justify-center rounded-xl bg-amber-200 px-3 py-1 font-semibold text-slate-950">
        {answers[key] || "___"}
      </span>,
    );
    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < sentence.length) {
    nodes.push(sentence.slice(lastIndex));
  }

  return nodes;
}

export function FillBlanksGame({
  exercise,
  locale,
}: {
  exercise: FillBlankExercise;
  locale: Locale;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeUsedSeconds, setTimeUsedSeconds] = useState(0);
  const [state, formAction] = useActionState(saveFillBlankScoreAction, initialGameState);

  const question = exercise.questions[questionIndex] ?? exercise.questions[0];
  const blanks = getQuestionBlanks(question);
  const translation = getLocalizedValue(question.translation, locale);
  const explanation = getLocalizedValue(question.explanation, locale);
  const isCurrentCorrect = blanks.every((blank) => answers[blank.key] === blank.correctAnswer);
  const isLastQuestion = questionIndex >= exercise.questions.length - 1;
  const finalScore = Math.round((correctAnswers / Math.max(exercise.questions.length, 1)) * 100);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeUsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  function handleValidate() {
    if (submitted) {
      return;
    }

    setSubmitted(true);
    if (isCurrentCorrect) {
      setCorrectAnswers((current) => current + 1);
    }
  }

  function handleNextQuestion() {
    setQuestionIndex((current) => current + 1);
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <section className="grid gap-6 lg:grid-cols-[1.3fr_0.8fr]">
      <article className="rounded-[2rem] border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl text-slate-950">{exercise.title}</h2>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
              Question {questionIndex + 1}/{exercise.questions.length}
            </p>
            <p className="text-sm text-slate-500">{translation}</p>
          </div>
          <div className="rounded-full bg-slate-950 px-4 py-2 text-sm text-white">
            <Timer initialSeconds={exercise.timeLimitSeconds} />
          </div>
        </div>
        <p className="mt-8 rounded-3xl bg-slate-100 p-6 text-2xl leading-10 text-slate-900">
          {renderSentenceWithBlanks(question.sentenceTemplate, blanks, answers)}
        </p>
        <div className="mt-6 space-y-5">
          {blanks.map((blank) => (
            <div key={blank.key}>
              <p className="mb-2 font-mono text-xs uppercase tracking-[0.18em] text-slate-400">[{blank.key}]</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {blank.options.map((option) => (
                  <button
                    key={`${blank.key}-${option}`}
                    type="button"
                    onClick={() => setAnswers((current) => ({ ...current, [blank.key]: option }))}
                    disabled={submitted}
                    className={`rounded-2xl border px-4 py-4 text-left transition disabled:cursor-default ${
                      answers[blank.key] === option
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={handleValidate}
          disabled={submitted || blanks.some((blank) => !answers[blank.key])}
          className="mt-6 rounded-full bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950"
        >
          Validate answer
        </button>
        {submitted && !isLastQuestion ? (
          <button
            type="button"
            onClick={handleNextQuestion}
            className="ml-3 mt-6 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white"
          >
            Next question
          </button>
        ) : null}
        {submitted && isLastQuestion ? (
          <form action={formAction} className="mt-4 space-y-3">
            <input type="hidden" name="exerciseId" value={exercise.id} />
            <input type="hidden" name="score" value={finalScore} />
            <input type="hidden" name="totalQuestions" value={exercise.questions.length} />
            <input type="hidden" name="correctAnswers" value={correctAnswers} />
            <input type="hidden" name="wrongAnswers" value={exercise.questions.length - correctAnswers} />
            <input type="hidden" name="attemptsCount" value={exercise.questions.length} />
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
            <p className={`text-lg font-semibold ${isCurrentCorrect ? "text-emerald-700" : "text-rose-600"}`}>
              {isCurrentCorrect ? "Correct answer" : "Incorrect answer"}
            </p>
            <p className="text-sm text-slate-600">{explanation}</p>
            {!isCurrentCorrect ? (
              <p className="text-sm text-slate-500">
                Expected: {blanks.map((blank) => `${blank.key}: ${blank.correctAnswer}`).join(" · ")}
              </p>
            ) : null}
          </div>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Choose an option to receive pedagogical feedback.</p>
        )}
      </aside>
    </section>
  );
}
