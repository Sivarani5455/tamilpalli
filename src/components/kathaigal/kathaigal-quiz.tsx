"use client";

import { useState } from "react";

import type { KathaigalQuestion, Locale } from "@/types";

const copy = {
  en: { title: "Reading quiz", correct: "Correct", wrong: "Try again", score: "Score" },
  fr: { title: "Quiz de lecture", correct: "Correct", wrong: "Essaie encore", score: "Score" },
  ta: { title: "வாசிப்பு வினா", correct: "சரி", wrong: "மீண்டும் முயற்சி", score: "மதிப்பெண்" },
} satisfies Record<Locale, { title: string; correct: string; wrong: string; score: string }>;

export function KathaigalQuiz({ questions, locale }: { questions: KathaigalQuestion[]; locale: Locale }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const labels = copy[locale];
  const answeredCount = questions.filter((question) => typeof answers[question.id] === "number").length;
  const correctCount = questions.filter((question) => answers[question.id] === question.correctChoiceIndex).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-[#ece9f5] bg-white p-5 shadow-[0_1px_2px_rgba(30,27,46,0.04),0_8px_24px_rgba(30,27,46,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2eeff] px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-[#7b5cfa] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#7b5cfa]">
          {labels.title}
        </span>
        <div className="rounded-full bg-[#faf9f6] px-3 py-1.5 text-xs font-black text-[#1e1b2e]">
            {labels.score} {correctCount}/{questions.length}
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ece9f5]">
        <div className="h-full rounded-full bg-[#2fae6b] transition-all duration-500" style={{ width: `${progressPercent}%` }} />
      </div>

      <div className="mt-5 space-y-3.5">
        {questions.map((question, questionIndex) => {
          const selected = answers[question.id];
          const answered = typeof selected === "number";
          const isCorrect = selected === question.correctChoiceIndex;

          return (
            <article key={question.id} className="rounded-2xl border border-[#ece9f5] bg-[#faf9f6] p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#f2eeff] text-xs font-black text-[#7b5cfa]">
                  {questionIndex + 1}
                </span>
                <h2 className="font-tamil text-[1rem] font-bold leading-7 text-[#1e1b2e]">
                  {question.questionTa}
                </h2>
              </div>
              <div className="mt-3 grid gap-2">
                {question.choices.map((choice, choiceIndex) => {
                  const isSelected = selected === choiceIndex;
                  const shouldShowCorrect = answered && choiceIndex === question.correctChoiceIndex;
                  const shouldShowWrong = isSelected && !isCorrect;

                  return (
                    <button
                      key={`${question.id}-${choiceIndex}`}
                      type="button"
                      onClick={() => setAnswers((current) => ({ ...current, [question.id]: choiceIndex }))}
                      className={`min-h-11 rounded-xl border px-3.5 py-2.5 text-left font-tamil text-[0.95rem] font-bold transition ${
                        shouldShowCorrect
                          ? "border-[#2fae6b]/30 bg-[#e9f8ef] text-[#1e1b2e]"
                          : shouldShowWrong
                            ? "border-[#ff6a5c]/30 bg-[#fff0ee] text-[#1e1b2e]"
                            : "border-[#ece9f5] bg-white text-[#1e1b2e] hover:border-[#7b5cfa]/40 hover:bg-[#f2eeff]"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>{choice}</span>
                        {shouldShowCorrect ? <span className="text-base text-[#2fae6b]">✓</span> : null}
                        {shouldShowWrong ? <span className="text-base text-[#ff6a5c]">×</span> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              {answered ? (
                <p className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-black ${isCorrect ? "bg-[#e9f8ef] text-[#2f7d54]" : "bg-[#fff0ee] text-[#b94a40]"}`}>
                  {isCorrect ? labels.correct : labels.wrong}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}
