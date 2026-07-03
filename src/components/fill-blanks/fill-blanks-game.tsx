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
      <span key={`${key}-${match.index}`} className="mx-1 inline-flex min-w-14 justify-center rounded-lg bg-amber-200 px-2 py-0.5 font-semibold text-slate-950 sm:min-w-20 sm:rounded-xl sm:px-3 sm:py-1">
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
  const [isPaused, setIsPaused] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [timeUsedSeconds, setTimeUsedSeconds] = useState(0);
  const [state, formAction] = useActionState(saveFillBlankScoreAction, initialGameState);

  const question = exercise.questions[questionIndex] ?? exercise.questions[0];
  const blanks = getQuestionBlanks(question);
  const translation = getLocalizedValue(question.translation, locale);
  const explanation = getLocalizedValue(question.explanation, locale);
  const isCurrentCorrect = blanks.every((blank) => answers[blank.key] === blank.correctAnswer);
  const isLastQuestion = questionIndex >= exercise.questions.length - 1;
  const finalScore = Math.round((correctAnswers / Math.max(exercise.questions.length, 1)) * 100);
  const labels = {
    answer: locale === "fr" ? "Réponse" : locale === "ta" ? "பதில்" : "Answer",
    question: locale === "fr" ? "Question" : locale === "ta" ? "கேள்வி" : "Question",
    validate: locale === "fr" ? "Valider la réponse" : locale === "ta" ? "பதிலை சரிபார்" : "Validate answer",
    next: locale === "fr" ? "Question suivante" : locale === "ta" ? "அடுத்த கேள்வி" : "Next question",
    save: locale === "fr" ? "Enregistrer le résultat" : locale === "ta" ? "முடிவை சேமி" : "Save result",
    correct: locale === "fr" ? "Bonne réponse" : locale === "ta" ? "சரியான பதில்" : "Correct answer",
    incorrect: locale === "fr" ? "Réponse incorrecte" : locale === "ta" ? "தவறான பதில்" : "Incorrect answer",
    score: locale === "fr" ? "Score" : locale === "ta" ? "மதிப்பெண்" : "Score",
    errors: locale === "fr" ? "Erreurs" : locale === "ta" ? "பிழைகள்" : "Errors",
    time: locale === "fr" ? "Temps" : locale === "ta" ? "நேரம்" : "Time",
    pause: locale === "fr" ? "Pause" : locale === "ta" ? "இடைநிறுத்து" : "Pause",
    resume: locale === "fr" ? "Reprendre" : locale === "ta" ? "தொடரவும்" : "Resume",
    expected: locale === "fr" ? "Attendu" : locale === "ta" ? "எதிர்பார்த்த பதில்" : "Expected",
    pausedTitle: locale === "fr" ? "Pause" : locale === "ta" ? "இடைநிறுத்தம்" : "Paused",
    pausedText:
      locale === "fr"
        ? "La question et les réponses sont masquées."
        : locale === "ta"
          ? "கேள்வியும் பதில்களும் மறைக்கப்பட்டுள்ளன."
          : "The question and answers are hidden.",
    choose:
      locale === "fr"
        ? "Choisis une option pour voir l'explication."
        : locale === "ta"
          ? "விளக்கத்தைப் பார்க்க ஒரு விருப்பத்தைத் தேர்வு செய்."
          : "Choose an option to see the explanation.",
  };

  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeUsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  function handleValidate() {
    if (submitted || isPaused) {
      return;
    }

    setSubmitted(true);
    if (isCurrentCorrect) {
      setCorrectAnswers((current) => current + 1);
    } else {
      setWrongAnswers((current) => current + 1);
    }
  }

  function handleNextQuestion() {
    setQuestionIndex((current) => current + 1);
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <section className="relative mx-auto max-w-5xl">
      <span className="absolute left-10 top-[-1rem] hidden h-4 w-4 rotate-12 rounded-[0.25rem] bg-[#b7ff2a] sm:block" />
      <span className="absolute left-1/2 top-[-1.15rem] hidden h-3 w-3 rounded-full bg-[#ff3b6f] sm:block" />
      <span className="absolute bottom-[-0.8rem] right-16 hidden h-3 w-12 -rotate-12 rounded-full bg-[#7c3aed] sm:block" />

      <article className="relative rounded-[1.1rem] border-[2px] border-[#180d2b] bg-white px-3 py-3 shadow-[5px_6px_0_#180d2b] sm:rounded-[1.45rem] sm:border-[3px] sm:px-5 sm:py-4 sm:shadow-[8px_9px_0_#180d2b]">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.75fr)] lg:items-start">
          <div className="min-w-0">
            <div className="inline-flex items-center rounded-full border-[2px] border-[#180d2b] bg-[#efe6ff] px-2.5 py-0.5 text-[0.62rem] font-black uppercase tracking-[0.1em] text-[#7c3aed] shadow-[2px_3px_0_#180d2b] sm:border-[3px] sm:px-3 sm:py-1 sm:text-[0.68rem] sm:tracking-[0.14em] sm:shadow-[3px_4px_0_#180d2b]">
              {labels.question} {questionIndex + 1}/{exercise.questions.length}
            </div>
            <h2 className="mt-2 truncate font-display text-[clamp(1.45rem,8vw,2rem)] font-black leading-tight text-[#24143d] sm:mt-3 sm:text-[clamp(1.75rem,4vw,2.4rem)]">
              {exercise.title}
            </h2>
            <p className="mt-1 text-sm font-bold leading-5 text-[#5f4a3a] sm:mt-2 sm:text-lg sm:leading-6">{translation}</p>
          </div>

          <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-2.5 py-2.5 shadow-[3px_4px_0_#180d2b] sm:rounded-[1.2rem] sm:border-[3px] sm:px-3 sm:py-3 sm:shadow-[5px_6px_0_#180d2b]">
          <div className="mb-2 flex flex-wrap items-center justify-end gap-2 sm:mb-3">
            <div className="inline-flex items-center gap-1.5 rounded-full border-[2px] border-[#180d2b] bg-[#fff5cf] py-0.5 pl-2.5 pr-1 text-[0.62rem] font-black uppercase tracking-[0.08em] text-[#9a6a2f] shadow-[2px_3px_0_#180d2b] sm:gap-2 sm:border-[3px] sm:py-1 sm:pl-3 sm:text-[0.68rem] sm:tracking-[0.12em] sm:shadow-[3px_4px_0_#180d2b]">
              <span>{labels.time}</span>
              <span className="font-mono text-xs tracking-normal text-[#1d1230]">
                <Timer initialSeconds={exercise.timeLimitSeconds} paused={isPaused} />
              </span>
              <button
                type="button"
                onClick={() => setIsPaused((current) => !current)}
                className={`flex h-6 w-6 items-center justify-center rounded-full border-[2px] border-[#180d2b] text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#180d2b] sm:h-7 sm:w-7 ${
                  isPaused ? "bg-[#b7ff2a]" : "bg-white"
                }`}
                aria-label={isPaused ? labels.resume : labels.pause}
                title={isPaused ? labels.resume : labels.pause}
              >
                {isPaused ? (
                  <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7L8 5Z" />
                  </svg>
                ) : (
                  <svg aria-hidden="true" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rotate-[-1deg] rounded-[0.8rem] border-[2px] border-[#180d2b] bg-[#e7fff3] px-2.5 py-2 shadow-[3px_4px_0_#180d2b] sm:rounded-[0.95rem] sm:border-[3px] sm:px-3 sm:py-2.5 sm:shadow-[4px_5px_0_#180d2b]">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-[#14865f] sm:text-[0.62rem] sm:tracking-[0.16em]">{labels.score}</p>
              <p className="mt-0.5 text-xl font-black leading-none text-[#1d1230] sm:mt-1 sm:text-2xl">{finalScore}</p>
            </div>
            <div className="rotate-[1deg] rounded-[0.8rem] border-[2px] border-[#180d2b] bg-[#ffe8ef] px-2.5 py-2 shadow-[3px_4px_0_#180d2b] sm:rounded-[0.95rem] sm:border-[3px] sm:px-3 sm:py-2.5 sm:shadow-[4px_5px_0_#180d2b]">
              <p className="text-[0.58rem] font-black uppercase tracking-[0.12em] text-[#e23c75] sm:text-[0.62rem] sm:tracking-[0.16em]">{labels.errors}</p>
              <p className="mt-0.5 text-xl font-black leading-none text-[#1d1230] sm:mt-1 sm:text-2xl">{wrongAnswers}</p>
            </div>
          </div>
          </div>
        </div>

        {isPaused ? (
          <div className="mt-3 rounded-[1rem] border-[2px] border-[#180d2b] bg-[#fff5cf] px-4 py-5 text-center shadow-[4px_5px_0_#180d2b] sm:mt-4 sm:rounded-[1.25rem] sm:border-[3px] sm:px-5 sm:py-8 sm:shadow-[5px_6px_0_#180d2b]">
            <p className="font-display text-[clamp(1.6rem,8vw,2.25rem)] font-black leading-none text-[#24143d] sm:text-[clamp(2rem,5vw,3rem)]">{labels.pausedTitle}</p>
            <p className="mx-auto mt-3 max-w-md text-sm font-bold leading-6 text-[#6b5441]">{labels.pausedText}</p>
            <button
              type="button"
              onClick={() => setIsPaused(false)}
              className="mt-4 min-h-10 rounded-[0.9rem] border-[2px] border-[#180d2b] bg-[#c6ff2e] px-6 py-2 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#180d2b] sm:mt-5 sm:min-h-11 sm:rounded-[1rem] sm:border-[3px] sm:px-8 sm:py-2.5 sm:shadow-[4px_5px_0_#180d2b]"
            >
              {labels.resume}
            </button>
          </div>
        ) : (
          <>
            <p className="mt-3 rounded-[1rem] border-[2px] border-[#180d2b] bg-[#efe6ff] px-3 py-3 text-[clamp(1.15rem,6vw,1.55rem)] font-black leading-[1.35] text-[#24143d] shadow-[4px_5px_0_#180d2b] sm:mt-4 sm:rounded-[1.25rem] sm:border-[3px] sm:px-5 sm:py-4 sm:text-[clamp(1.45rem,4vw,2rem)] sm:leading-[1.45] sm:shadow-[5px_6px_0_#180d2b]">
              {renderSentenceWithBlanks(question.sentenceTemplate, blanks, answers)}
            </p>

            <div className="mt-3 space-y-3 sm:mt-4 sm:space-y-4">
              {blanks.map((blank) => (
                <div key={blank.key}>
                  <p className="mb-1.5 font-mono text-[0.65rem] font-black uppercase tracking-[0.18em] text-[#9a83b3] sm:mb-2 sm:text-xs sm:tracking-[0.22em]">[{blank.key}]</p>
                  <div className="grid gap-2 sm:grid-cols-2 sm:gap-3">
                    {blank.options.map((option) => (
                      <button
                        key={`${blank.key}-${option}`}
                        type="button"
                        onClick={() => setAnswers((current) => ({ ...current, [blank.key]: option }))}
                        disabled={submitted}
                        className={`min-h-10 rounded-[0.85rem] border-[2px] px-3 py-2 text-left text-sm font-black shadow-[3px_4px_0_#180d2b] transition disabled:cursor-default sm:min-h-12 sm:rounded-[0.95rem] sm:border-[3px] sm:px-5 sm:py-2.5 sm:text-base sm:shadow-[4px_5px_0_#180d2b] ${
                          answers[blank.key] === option
                            ? "border-[#180d2b] bg-[#c6ff2e] text-[#24143d]"
                            : "border-[#180d2b] bg-white text-[#24143d] hover:-translate-y-0.5 hover:bg-[#fff8ec]"
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
              className="mt-3 min-h-10 w-full rounded-[0.95rem] border-[2px] border-[#180d2b] bg-[#ffc43d] px-4 py-2 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-55 sm:mt-4 sm:min-h-12 sm:rounded-[1.1rem] sm:border-[3px] sm:px-5 sm:py-2.5 sm:shadow-[5px_6px_0_#180d2b]"
            >
              {labels.validate}
            </button>
            {submitted && !isLastQuestion ? (
              <button
                type="button"
                onClick={handleNextQuestion}
                className="mt-2 min-h-10 w-full rounded-[0.9rem] border-[2px] border-[#180d2b] bg-[#24143d] px-4 py-2 text-sm font-black text-white shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5 sm:mt-3 sm:min-h-11 sm:rounded-[1rem] sm:border-[3px] sm:px-5 sm:py-2.5 sm:shadow-[4px_5px_0_#180d2b]"
              >
                {labels.next}
              </button>
            ) : null}
            {submitted && isLastQuestion ? (
              <form action={formAction} className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
                <input type="hidden" name="exerciseId" value={exercise.id} />
                <input type="hidden" name="score" value={finalScore} />
                <input type="hidden" name="totalQuestions" value={exercise.questions.length} />
                <input type="hidden" name="correctAnswers" value={correctAnswers} />
                <input type="hidden" name="wrongAnswers" value={wrongAnswers} />
                <input type="hidden" name="attemptsCount" value={exercise.questions.length} />
                <input type="hidden" name="timeUsedSeconds" value={timeUsedSeconds} />
                <input type="hidden" name="path" value={`/${locale}/fill-in-the-blanks/${exercise.id}`} />
                <button className="min-h-10 w-full rounded-[0.9rem] border-[2px] border-[#180d2b] bg-[#24143d] px-4 py-2 text-sm font-black text-white shadow-[3px_4px_0_#180d2b] sm:min-h-11 sm:rounded-[1rem] sm:border-[3px] sm:px-5 sm:py-2.5 sm:shadow-[4px_5px_0_#180d2b]">
                  {labels.save}
                </button>
                {state.message ? <p className={`text-xs ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>{state.message}</p> : null}
              </form>
            ) : null}

            <aside className="mt-3 rounded-[1rem] border-[2px] border-[#180d2b] bg-[#fff8ec] p-3 shadow-[4px_5px_0_#180d2b] sm:mt-4 sm:rounded-[1.2rem] sm:border-[3px] sm:p-4 sm:shadow-[5px_6px_0_#180d2b]">
            {submitted ? (
              <div className="space-y-3">
                <p className={`text-lg font-black ${isCurrentCorrect ? "text-[#13885c]" : "text-[#c25f3f]"}`}>
                  {isCurrentCorrect ? labels.correct : labels.incorrect}
                </p>
                <p className="text-sm font-semibold leading-6 text-[#5f4a3a]">{explanation}</p>
                {!isCurrentCorrect ? (
                  <p className="text-sm font-semibold text-[#7a6048]">
                    {labels.expected}: {blanks.map((blank) => `${blank.key}: ${blank.correctAnswer}`).join(" · ")}
                  </p>
                ) : null}
              </div>
            ) : (
              <p className="text-sm font-semibold leading-6 text-[#7a6048]">{labels.choose}</p>
            )}
            </aside>
          </>
        )}
      </article>
    </section>
  );
}
