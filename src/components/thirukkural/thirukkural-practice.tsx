"use client";

import { useState } from "react";

import { generateThirukkuralPractice, type ThirukkuralPracticeSet } from "@/lib/thirukkural-practice";
import type { Locale, ThirukkuralLesson } from "@/types";

function PracticeIcon({ mode }: { mode: "quiz" | "blanks" | "reconstruct" }) {
  if (mode === "quiz") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1A0B2E] bg-[#F1E9FE] text-[#7C3AED] shadow-[2px_2px_0_#1A0B2E]" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-4 w-4">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 16v-1M12 8a2.5 2.5 0 1 1 2 4c-.6.4-1 1-1 1.5" />
        </svg>
      </span>
    );
  }

  if (mode === "blanks") {
    return (
      <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1A0B2E] bg-[#DDF7F9] text-[#0C7C82] shadow-[2px_2px_0_#1A0B2E]" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-4 w-4">
          <path d="M4 6h16M4 12h10M4 18h6" />
        </svg>
      </span>
    );
  }

  return (
    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#1A0B2E] bg-[#FFE4EB] text-[#FF3D68] shadow-[2px_2px_0_#1A0B2E]" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" className="h-4 w-4">
        <path d="M3 12a9 9 0 1 1 3 6.7M3 16v-4h4" />
      </svg>
    </span>
  );
}

const copy = {
  en: {
    quiz: "Quick quiz", blanks: "Fill the kural", reconstruct: "Rebuild the kural", instruction: "Select the words in the correct order.",
    hole: "Blank", score: "Score", correct: "Correct", retry: "Try again", reset: "Reset", refresh: "New challenge",
    question: "Question", next: "Next question", finish: "See results", completed: "Challenge completed", finalScore: "Final score",
  },
  fr: {
    quiz: "Quiz rapide", blanks: "Complète le kural", reconstruct: "Reconstituer le kural", instruction: "Sélectionne les mots dans le bon ordre.",
    hole: "Trou", score: "Score", correct: "Correct", retry: "Essaie encore", reset: "Recommencer", refresh: "Nouveau défi",
    question: "Question", next: "Question suivante", finish: "Voir le résultat", completed: "Défi terminé", finalScore: "Score final",
  },
  ta: {
    quiz: "வினா", blanks: "குறளை நிரப்பு", reconstruct: "குறளை வரிசைப்படுத்துக", instruction: "சொற்களைச் சரியான வரிசையில் தேர்ந்தெடுக்கவும்.",
    hole: "இடைவெளி", score: "மதிப்பெண்", correct: "சரி", retry: "மீண்டும் முயற்சி", reset: "மீட்டமை", refresh: "புதிய பயிற்சி",
    question: "கேள்வி", next: "அடுத்த கேள்வி", finish: "முடிவைக் காண்க", completed: "பயிற்சி முடிந்தது", finalScore: "இறுதி மதிப்பெண்",
  },
} satisfies Record<Locale, {
  quiz: string;
  blanks: string;
  reconstruct: string;
  instruction: string;
  hole: string;
  score: string;
  correct: string;
  retry: string;
  reset: string;
  refresh: string;
  question: string;
  next: string;
  finish: string;
  completed: string;
  finalScore: string;
}>; 

export function ThirukkuralPractice({
  initialPractice,
  practicePool,
  locale,
  mode,
}: {
  initialPractice: ThirukkuralPracticeSet;
  practicePool: ThirukkuralLesson[];
  locale: Locale;
  mode: "quiz" | "blanks" | "reconstruct";
}) {
  const [practice, setPractice] = useState(initialPractice);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [blankAnswers, setBlankAnswers] = useState<Record<string, string>>({});
  const [reconstructionAnswers, setReconstructionAnswers] = useState<Record<string, number[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const labels = copy[locale];
  const { quiz, fillBlanks, reconstructions } = practice;
  const score = quiz.filter((question) => quizAnswers[question.id] === question.correctChoiceIndex).length;
  const blankScore = fillBlanks.filter((exercise) =>
    exercise.blanks.every((blank) => blankAnswers[blank.id] === blank.answer),
  ).length;
  const reconstructionScore = reconstructions.filter((exercise) => {
    const selectedWords = (reconstructionAnswers[exercise.id] ?? []).map((index) => exercise.scrambledWords[index]);
    return selectedWords.length === exercise.correctWords.length && selectedWords.every((word, index) => word === exercise.correctWords[index]);
  }).length;

  function createNewChallenge() {
    const currentSignature = JSON.stringify(practice);
    let nextPractice = practice;

    for (let attempt = 0; attempt < 5 && JSON.stringify(nextPractice) === currentSignature; attempt += 1) {
      nextPractice = generateThirukkuralPractice(practicePool, 20);
    }

    setPractice(nextPractice);
    setQuizAnswers({});
    setBlankAnswers({});
    setReconstructionAnswers({});
    setCurrentIndex(0);
    setIsFinished(false);
  }

  function advance(total: number) {
    if (currentIndex >= total - 1) {
      setIsFinished(true);
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  const finalScore = mode === "quiz" ? score : mode === "blanks" ? blankScore : reconstructionScore;
  const totalQuestions = mode === "quiz" ? quiz.length : mode === "blanks" ? fillBlanks.length : reconstructions.length;

  return (
    <section className="space-y-4 lg:space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={createNewChallenge}
          className="rounded-full border-[2.5px] border-[#1A0B2E] bg-[#FFC93C] px-4 py-2 text-sm font-bold text-[#1A0B2E] shadow-[3px_3px_0_#1A0B2E] transition duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E] lg:px-3.5 lg:py-1.5 lg:text-xs"
        >
          {labels.refresh}
        </button>
      </div>

      {isFinished ? (
        <div className="rounded-[20px] border-[2.5px] border-[#1A0B2E] bg-white p-7 text-center shadow-[5px_5px_0_#1A0B2E] sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[2.5px] border-[#1A0B2E] bg-[#FFC93C] text-3xl shadow-[3px_3px_0_#1A0B2E]" aria-hidden="true">
            ★
          </div>
          <h3 className="mt-5 font-tamil text-2xl font-bold text-[#1A0B2E]">{labels.completed}</h3>
          <p className="mt-3 text-lg font-bold text-[#7C3AED]">
            {labels.finalScore}: {finalScore}/{totalQuestions}
          </p>
          <button
            type="button"
            onClick={createNewChallenge}
            className="mt-6 rounded-full border-[2.5px] border-[#1A0B2E] bg-[#7C3AED] px-5 py-2.5 font-tamil text-sm font-bold text-white shadow-[3px_3px_0_#1A0B2E] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E]"
          >
            {labels.refresh}
          </button>
        </div>
      ) : null}

      {!isFinished && mode === "quiz" && quiz.length ? (
        <div className="rounded-[20px] border-[2.5px] border-[#1A0B2E] bg-white p-4 shadow-[5px_5px_0_#1A0B2E] sm:p-5 lg:p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <PracticeIcon mode="quiz" />
              <span className="sr-only">{labels.quiz}</span>
              <p className="mt-1 text-xs font-bold text-[#9A8CB0]">{labels.question} {currentIndex + 1}/{quiz.length}</p>
            </div>
            <span className="rounded-full border-2 border-[#1A0B2E] bg-[#F1E9FE] px-3 py-1 text-xs font-bold text-[#7C3AED]">
              {labels.score} {score}/{quiz.length}
            </span>
          </div>
          <div className="mt-4 space-y-4 lg:mt-2 lg:space-y-2">
            {quiz.slice(currentIndex, currentIndex + 1).map((question) => {
              const selected = quizAnswers[question.id];

              return (
                <article key={question.id} className="rounded-2xl border-2 border-[#1A0B2E] bg-[#FFF7EC] p-4 shadow-[3px_3px_0_#1A0B2E] lg:p-3">
                  <h3 className="whitespace-pre-line font-tamil text-lg font-bold leading-8 text-[#6D28D9] lg:text-base lg:leading-7">
                    {currentIndex + 1}. {question.question}
                  </h3>
                  <div className="mt-3 grid gap-2 lg:mt-2 lg:gap-1.5">
                    {question.choices.map((choice, choiceIndex) => {
                      const isSelected = selected === choiceIndex;
                      const isCorrect = choiceIndex === question.correctChoiceIndex;
                      const showCorrect = typeof selected === "number" && isCorrect;
                      const showWrong = isSelected && !isCorrect;

                      return (
                        <button
                          key={`${question.id}-${choiceIndex}`}
                          type="button"
                          onClick={() => setQuizAnswers((current) => ({ ...current, [question.id]: choiceIndex }))}
                          className={`min-h-12 whitespace-pre-line rounded-xl border-2 border-[#1A0B2E] px-4 py-3 text-left font-tamil text-base font-bold leading-7 shadow-[2px_2px_0_#1A0B2E] transition lg:min-h-0 lg:px-3 lg:py-2 lg:text-sm lg:leading-6 ${
                            showCorrect
                              ? "bg-[#DDF8E9] text-[#0C7C4B]"
                              : showWrong
                                ? "bg-[#FFE4EB] text-[#B21F46]"
                                : "bg-white text-[#3B2E4A] hover:-translate-y-0.5 hover:bg-[#F1E9FE]"
                          }`}
                        >
                          {choice}
                        </button>
                      );
                    })}
                  </div>
                  {typeof selected === "number" ? (
                    <div className="mt-5 flex justify-end lg:mt-3">
                      <button
                        type="button"
                        onClick={() => advance(quiz.length)}
                        className="rounded-full border-[2.5px] border-[#1A0B2E] bg-[#7C3AED] px-5 py-2.5 font-tamil text-sm font-bold text-white shadow-[3px_3px_0_#1A0B2E] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E]"
                      >
                        {currentIndex === quiz.length - 1 ? labels.finish : labels.next} →
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {!isFinished && mode === "blanks" && fillBlanks.length ? (
        <div className="rounded-[20px] border-[2.5px] border-[#1A0B2E] bg-white p-4 shadow-[5px_5px_0_#1A0B2E] sm:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <PracticeIcon mode="blanks" />
              <span className="sr-only">{labels.blanks}</span>
              <p className="mt-1 text-xs font-bold text-[#9A8CB0]">{labels.question} {currentIndex + 1}/{fillBlanks.length}</p>
            </div>
            <span className="rounded-full border-2 border-[#1A0B2E] bg-[#DDF7F9] px-3 py-1 text-xs font-bold text-[#0C7C82]">
              {labels.score} {blankScore}/{fillBlanks.length}
            </span>
          </div>
          <div className="mt-4 space-y-4">
            {fillBlanks.slice(currentIndex, currentIndex + 1).map((exercise) => {
              const isComplete = exercise.blanks.every((blank) => Boolean(blankAnswers[blank.id]));
              const isCorrect = isComplete && exercise.blanks.every((blank) => blankAnswers[blank.id] === blank.answer);

              return (
                <article key={exercise.id} className="rounded-2xl border-2 border-[#1A0B2E] bg-[#FFF7EC] p-4 shadow-[3px_3px_0_#1A0B2E]">
                  <p className="whitespace-pre-line font-tamil text-lg font-bold leading-8 text-[#1A0B2E]">{exercise.template}</p>
                  <div className="mt-4 space-y-3">
                    {exercise.blanks.map((blank, blankIndex) => {
                      const selected = blankAnswers[blank.id];
                      const selectedIsCorrect = selected === blank.answer;

                      return (
                        <div key={blank.id} className="rounded-xl border-2 border-[#1A0B2E] bg-white p-3">
                          <p className="mb-2 font-tamil text-xs font-bold text-[#2f6f62]">
                            {labels.hole} {blankIndex + 1}
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {blank.options.map((option) => (
                              <button
                                key={`${blank.id}-${option}`}
                                type="button"
                                onClick={() => setBlankAnswers((current) => ({ ...current, [blank.id]: option }))}
                                className={`min-h-11 rounded-full border-2 border-[#1A0B2E] px-4 py-2 font-tamil text-sm font-bold shadow-[2px_2px_0_#1A0B2E] transition ${
                                  selected === option
                                    ? selectedIsCorrect
                                      ? "bg-[#17A6B2] text-white"
                                      : "bg-[#FF3D68] text-white"
                                    : "bg-white text-[#3B2E4A] hover:-translate-y-0.5 hover:bg-[#DDF7F9]"
                                }`}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {isComplete ? (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <p className={`text-sm font-bold ${isCorrect ? "text-[#2f6f62]" : "text-[#b44e43]"}`}>
                        {isCorrect ? labels.correct : labels.retry}
                      </p>
                      <button
                        type="button"
                        onClick={() => advance(fillBlanks.length)}
                        className="rounded-full border-[2.5px] border-[#1A0B2E] bg-[#17A6B2] px-5 py-2.5 font-tamil text-sm font-bold text-white shadow-[3px_3px_0_#1A0B2E] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E]"
                      >
                        {currentIndex === fillBlanks.length - 1 ? labels.finish : labels.next} →
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}

      {!isFinished && mode === "reconstruct" && reconstructions.length ? (
        <div className="rounded-[20px] border-[2.5px] border-[#1A0B2E] bg-white p-4 shadow-[5px_5px_0_#1A0B2E] sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <PracticeIcon mode="reconstruct" />
              <span className="sr-only">{labels.reconstruct}</span>
              <p className="mt-1 font-tamil text-sm text-[#3B2E4A]">{labels.instruction}</p>
              <p className="mt-1 text-xs font-bold text-[#9A8CB0]">{labels.question} {currentIndex + 1}/{reconstructions.length}</p>
            </div>
            <span className="rounded-full border-2 border-[#1A0B2E] bg-[#FFE4EB] px-3 py-1 text-xs font-bold text-[#B21F46]">
              {labels.score} {reconstructionScore}/{reconstructions.length}
            </span>
          </div>

          <div className="mt-4 space-y-4">
            {reconstructions.slice(currentIndex, currentIndex + 1).map((exercise) => {
              const selectedIndices = reconstructionAnswers[exercise.id] ?? [];
              const selectedWords = selectedIndices.map((index) => exercise.scrambledWords[index]);
              const isComplete = selectedWords.length === exercise.correctWords.length;
              const isCorrect = isComplete && selectedWords.every((word, index) => word === exercise.correctWords[index]);

              return (
                <article key={exercise.id} className="rounded-2xl border-2 border-[#1A0B2E] bg-[#FFF7EC] p-4 shadow-[3px_3px_0_#1A0B2E]">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-[#FF3D68]">{String(currentIndex + 1).padStart(2, "0")}</p>
                    {selectedIndices.length ? (
                      <button
                        type="button"
                        onClick={() => setReconstructionAnswers((current) => ({ ...current, [exercise.id]: [] }))}
                        className="rounded-full border-2 border-[#1A0B2E] bg-white px-3 py-1 text-xs font-bold text-[#3B2E4A] transition hover:bg-[#FFE4EB]"
                      >
                        {labels.reset}
                      </button>
                    ) : null}
                  </div>

                  <div
                    className={`mt-3 min-h-20 rounded-xl border-2 border-dashed border-[#1A0B2E] p-3 transition ${
                      isComplete
                        ? isCorrect
                          ? "bg-[#DDF8E9]"
                          : "bg-[#FFE4EB]"
                        : "bg-white"
                    }`}
                    aria-live="polite"
                  >
                    <div className="flex flex-wrap gap-2">
                      {selectedIndices.map((wordIndex, selectedPosition) => (
                        <button
                          key={`${exercise.id}-selected-${wordIndex}`}
                          type="button"
                          onClick={() => setReconstructionAnswers((current) => ({
                            ...current,
                            [exercise.id]: selectedIndices.filter((_, index) => index !== selectedPosition),
                          }))}
                          className="rounded-lg border-2 border-[#1A0B2E] bg-[#FF3D68] px-3 py-2 font-tamil text-sm font-bold text-white shadow-[2px_2px_0_#1A0B2E]"
                          title={labels.reset}
                        >
                          {exercise.scrambledWords[wordIndex]}
                        </button>
                      ))}
                    </div>
                    {isComplete ? (
                      <p className={`mt-3 text-sm font-bold ${isCorrect ? "text-[#2f6f62]" : "text-[#b44e43]"}`}>
                        {isCorrect ? labels.correct : labels.retry}
                      </p>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {exercise.scrambledWords.map((word, wordIndex) => {
                      const isSelected = selectedIndices.includes(wordIndex);

                      return (
                        <button
                          key={`${exercise.id}-word-${wordIndex}`}
                          type="button"
                          disabled={isSelected || isCorrect}
                          onClick={() => setReconstructionAnswers((current) => ({
                            ...current,
                            [exercise.id]: [...selectedIndices, wordIndex],
                          }))}
                          className="rounded-full border-2 border-[#1A0B2E] bg-white px-3 py-2 font-tamil text-sm font-bold text-[#3B2E4A] shadow-[2px_2px_0_#1A0B2E] transition hover:-translate-y-0.5 hover:bg-[#FFE4EB] disabled:cursor-default disabled:opacity-30"
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                  {isComplete ? (
                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={() => advance(reconstructions.length)}
                        className="rounded-full border-[2.5px] border-[#1A0B2E] bg-[#FF3D68] px-5 py-2.5 font-tamil text-sm font-bold text-white shadow-[3px_3px_0_#1A0B2E] transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#1A0B2E]"
                      >
                        {currentIndex === reconstructions.length - 1 ? labels.finish : labels.next} →
                      </button>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}
