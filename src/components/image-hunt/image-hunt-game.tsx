"use client";

import { type MouseEvent, useActionState, useEffect, useState } from "react";

import { saveImageHuntScoreAction } from "@/app/[locale]/game-actions";
import { initialGameState } from "@/lib/action-states";
import { celebrateCorrect, celebrateWrong } from "@/lib/game-celebrations";
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
  const [hasInteracted, setHasInteracted] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackWord, setFeedbackWord] = useState("");
  const [clickMarkers, setClickMarkers] = useState<Array<{
    id: number;
    x: number;
    y: number;
    ok: boolean;
  }>>([]);
  const [wrongClicks, setWrongClicks] = useState(0);
  const [timeUsedSeconds, setTimeUsedSeconds] = useState(0);
  const [state, formAction] = useActionState(saveImageHuntScoreAction, initialGameState);
  const currentTarget = exercise.targets.find((target) => !found.includes(target.id)) ?? null;
  const score = Math.max(found.length * 50 - wrongClicks * 10, 0);
  const feedbackTone =
    feedback.includes("Bonne") || feedback.includes("Correct") || feedback.includes("சரி")
      ? "correct"
      : feedback
        ? "wrong"
        : "idle";
  const currentLabel = currentTarget
    ? currentTarget.translation[locale] ?? currentTarget.translation.fr ?? currentTarget.translation.en ?? currentTarget.labelTa
    : "";
  const progressPercent = exercise.targets.length > 0 ? (found.length / exercise.targets.length) * 100 : 0;
  const labels = {
    goal: locale === "fr" ? "Objectif" : locale === "ta" ? "இலக்கு" : "Target",
    complete: locale === "fr" ? "Termine" : locale === "ta" ? "முடிந்தது" : "Complete",
    tapPrefix: locale === "fr" ? "Clique sur" : locale === "ta" ? "தொடவும்" : "Tap",
    completeMessage:
      locale === "fr"
        ? "Toutes les zones ont ete trouvees."
        : locale === "ta"
          ? "எல்லா பகுதிகளும் கண்டுபிடிக்கப்பட்டன."
          : "Every target has been found.",
    progress: locale === "fr" ? "Progression" : locale === "ta" ? "முன்னேற்றம்" : "Progress",
    score: locale === "fr" ? "Score" : locale === "ta" ? "மதிப்பெண்" : "Score",
    errors: locale === "fr" ? "Erreurs" : locale === "ta" ? "பிழைகள்" : "Errors",
    time: locale === "fr" ? "Temps" : locale === "ta" ? "நேரம்" : "Time",
    save: locale === "fr" ? "Sauvegarder" : locale === "ta" ? "சேமி" : "Save progress",
    feedback: locale === "fr" ? "Retour" : locale === "ta" ? "பதில்" : "Feedback",
    hint:
      locale === "fr"
        ? "Clique directement sur l'objet demande dans l'image."
        : locale === "ta"
          ? "படத்தில் கேட்கப்பட்ட பொருளை நேரடியாக தொடவும்."
          : "Tap directly on the requested object in the image.",
  };

  function handleImageClick(event: MouseEvent<HTMLButtonElement>) {
    if (!currentTarget) {
      return;
    }

    setHasInteracted(true);

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    const halfWidth = Math.max(currentTarget.width / 2, 1);
    const halfHeight = Math.max(currentTarget.height / 2, 1);
    const normalizedDistance = (Math.abs(x - currentTarget.x) / halfWidth) ** 2 + (Math.abs(y - currentTarget.y) / halfHeight) ** 2;
    const isCorrect = normalizedDistance <= 1;

    setClickMarkers((current) => [
      ...current,
      {
        id: Date.now(),
        x,
        y,
        ok: isCorrect,
      },
    ]);

    if (isCorrect) {
      celebrateCorrect();
      setFound((current) => [...current, currentTarget.id]);
      setFeedbackWord(currentTarget.labelTa);
      setFeedback(
        locale === "fr"
          ? `Bonne reponse: ${currentTarget.labelTa}`
          : locale === "ta"
            ? `சரி: ${currentTarget.labelTa}`
            : `Correct: ${currentTarget.labelTa}`,
      );
      return;
    }

    celebrateWrong();
    setWrongClicks((current) => current + 1);
    setFeedbackWord(currentLabel);
    setFeedback(
      locale === "fr"
        ? "Ce n'est pas la bonne zone. Essaie encore."
        : locale === "ta"
          ? "இது சரியான பகுதி இல்லை. மீண்டும் முயற்சி செய்."
          : "That is not the right area. Try again.",
    );
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeUsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  function renderProgressPanel(className = "") {
    return (
      <div className={`relative px-2 pb-4 pt-4 ${className}`}>
        <span className="absolute left-10 top-0 h-4 w-4 rotate-12 rounded-[0.25rem] bg-[#ffc43d]" />
        <span className="absolute right-10 top-2 h-3 w-3 rounded-full bg-[#7c3aed]" />

        <div className="relative rounded-[1.7rem] border-[3px] border-[#180d2b] bg-white px-5 py-6 shadow-[10px_12px_0_#180d2b]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-[#efe6ff] px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed] shadow-[3px_4px_0_#180d2b]">
              <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
              {labels.progress}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-[#fff5cf] px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-[#9a6a2f] shadow-[3px_4px_0_#180d2b]">
              <span>{labels.time}</span>
              <span className="font-mono text-sm tracking-normal text-[#1d1230]">
                <Timer initialSeconds={exercise.timeLimitSeconds} />
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rotate-[-1deg] rounded-[1.15rem] border-[3px] border-[#180d2b] bg-[#e7fff3] px-4 py-4 shadow-[6px_7px_0_#180d2b]">
              <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#14865f]">{labels.score}</p>
              <p className="mt-2 text-4xl font-black leading-none text-[#1d1230]">{score}</p>
            </div>
            <div className="rotate-[1deg] rounded-[1.15rem] border-[3px] border-[#180d2b] bg-[#ffe8ef] px-4 py-4 shadow-[6px_7px_0_#180d2b]">
              <p className="text-[0.7rem] font-black uppercase tracking-[0.18em] text-[#e23c75]">{labels.errors}</p>
              <p className="mt-2 text-4xl font-black leading-none text-[#1d1230]">{wrongClicks}</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {exercise.targets.map((target, index) => {
              const done = found.includes(target.id);
              const isCurrent = index === found.length;

              return (
                <span
                  key={target.id}
                  className={`flex h-9 w-9 items-center justify-center rounded-full border-[3px] text-sm font-black transition ${
                    done
                      ? "border-[#180d2b] bg-[#20bf74] text-white shadow-[3px_4px_0_#180d2b]"
                      : isCurrent
                        ? "border-[#180d2b] bg-[#ffc43d] text-[#1d1230] shadow-[3px_4px_0_#180d2b]"
                        : "border-[#180d2b] bg-white text-[#1d1230]"
                  }`}
                >
                  {index + 1}
                </span>
              );
            })}
          </div>

          <form action={formAction} className="mt-6 space-y-3">
            <input type="hidden" name="exerciseId" value={exercise.id} />
            <input type="hidden" name="score" value={score} />
            <input type="hidden" name="totalTargets" value={exercise.targets.length} />
            <input type="hidden" name="foundTargets" value={found.length} />
            <input type="hidden" name="wrongClicks" value={wrongClicks} />
            <input type="hidden" name="hintsUsed" value={0} />
            <input type="hidden" name="timeUsedSeconds" value={timeUsedSeconds} />
            <input type="hidden" name="path" value={`/${locale}/image-hunt/${exercise.id}`} />
            <button className="min-h-14 w-full rounded-[1.25rem] border-[3px] border-[#180d2b] bg-[#19bf74] px-5 py-3 text-base font-black text-white shadow-[6px_7px_0_#180d2b] transition hover:-translate-y-0.5 hover:shadow-[8px_9px_0_#180d2b] active:translate-y-0.5 active:shadow-[3px_4px_0_#180d2b]">
              {labels.save}
            </button>
            {state.message ? (
              <p className={`text-xs font-bold leading-5 ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>
                {state.message}
              </p>
            ) : null}
          </form>
        </div>
      </div>
    );
  }

  return (
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.65fr)]">
      <article className="space-y-5">
        <div
          className={`relative overflow-hidden rounded-[1.7rem] border-[3px] border-[#180d2b] bg-white px-6 py-7 shadow-[10px_12px_0_#180d2b] sm:px-8 ${
            hasInteracted ? "hidden xl:block" : ""
          }`}
        >
          <span className="absolute right-20 top-[-0.45rem] h-4 w-4 rotate-12 rounded-[0.25rem] bg-[#ffc43d]" />
          <span className="absolute right-9 top-[-0.15rem] h-3 w-3 rounded-full bg-[#ff3b7d]" />
          <span className="absolute bottom-[-0.85rem] left-16 h-4 w-14 -rotate-12 rounded-full bg-[#b7ff2a]" />
          <span className="absolute -right-2 -top-1 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#7c3aed] text-white shadow-[4px_5px_0_#180d2b]">
            <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="none">
              <path
                d="M8.5 9.2a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0Z"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <path
                d="M5.7 19.2c1.2-3 3.3-4.4 6.3-4.4s5.1 1.4 6.3 4.4"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
            </svg>
          </span>

          <div className="relative min-w-0 pr-8">
            <h1 className="truncate font-display text-[clamp(2.1rem,5vw,3.35rem)] font-black leading-tight text-[#24143d]">
                {exercise.title}
            </h1>
            <p className="mt-1 text-base font-bold leading-6 text-[#7a6048]">
              {exercise.instruction[locale] ?? exercise.instruction.fr ?? exercise.instruction.en}
            </p>
          </div>

          <div className="relative mt-6 h-4 overflow-hidden rounded-full border-[2px] border-[#180d2b] bg-[#fff8ec]">
            <div
              className="h-full rounded-r-sm bg-[linear-gradient(90deg,#19bf74,#b7ff2a)] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {hasInteracted ? renderProgressPanel("image-hunt-mobile-progress-enter xl:hidden") : null}

        <div className="rounded-[1.75rem] border border-[#ead5b8] bg-[#fff8ec] p-3 shadow-[0_24px_70px_-55px_rgba(74,51,36,0.48)] sm:p-5">
          <div className="relative mb-5 pt-5">
            <span className="absolute left-7 top-0 h-4 w-4 rotate-12 rounded-[0.25rem] bg-[#b7ff2a]" />
            <span className="absolute right-20 top-2 h-3 w-3 rounded-full bg-[#7c3aed]" />
            <span className="absolute bottom-[-0.75rem] right-28 h-4 w-4 rotate-12 bg-[#19bf74]" />
            <span className="absolute -left-3 top-5 z-10 flex h-14 w-14 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ff3b7d] text-white shadow-[4px_5px_0_#180d2b]">
              <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2.4" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.4" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
            </span>

            <div className="relative rotate-[-0.8deg] rounded-[1.35rem] border-[3px] border-[#180d2b] bg-[#ffc83d] px-8 py-7 shadow-[9px_10px_0_#180d2b] sm:px-10">
              <p className="inline-flex rounded-full bg-[#24143d] px-4 py-1 text-xs font-black uppercase tracking-[0.16em] text-white">
                {currentTarget ? labels.goal : labels.complete}
              </p>
              <p className="mt-4 text-[clamp(1.8rem,5vw,3rem)] font-black leading-tight text-[#24143d]">
                {currentTarget ? (
                  <>
                    {labels.tapPrefix}: <span className="text-[#ff3b7d]">{currentLabel}</span>
                  </>
                ) : (
                  labels.completeMessage
                )}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleImageClick}
            disabled={!currentTarget}
            className="relative block aspect-[4/3] w-full overflow-hidden rounded-[1.55rem] border border-[#ead5b8] bg-[#f7ead7] shadow-inner transition duration-150 active:scale-[0.992] disabled:cursor-default sm:aspect-[16/10]"
          >
            {exercise.imageUrl ? (
              <img src={exercise.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(0deg,rgba(255,255,255,0.09)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.09)_1px,transparent_1px)] bg-[size:44px_44px]" />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(45,32,23,0.04),rgba(45,32,23,0.08))]" />
            {clickMarkers.map((marker) => (
              <span
                key={marker.id}
                className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
                style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
              >
                <span
                  className={`absolute h-16 w-16 animate-ping rounded-full opacity-70 ${
                    marker.ok ? "bg-[#22c55e]/35" : "bg-[#ef4444]/35"
                  }`}
                />
                <span
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white text-lg font-black text-white shadow-[0_12px_35px_-18px_rgba(0,0,0,0.8)] sm:h-12 sm:w-12 sm:text-xl ${
                    marker.ok ? "bg-[#16a34a]" : "bg-[#dc2626]"
                  }`}
                >
                  {marker.ok ? "✓" : "×"}
                </span>
              </span>
            ))}
          </button>

        </div>
      </article>

      <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
        {renderProgressPanel("hidden xl:block")}

        <div className="relative min-h-[10rem] px-2 pb-3 pt-5">
          <span className="absolute left-3 top-7 h-3 w-3 rounded-full bg-[#f2c23d]" />
          <span className="absolute right-5 top-5 h-4 w-4 rounded-full bg-[#7c3aed]" />
          <span className="absolute bottom-3 left-12 h-2 w-10 rounded-full bg-[#9be15d]" />
          <span className="absolute bottom-7 right-1 h-5 w-5 rotate-45 rounded-[0.3rem] bg-[#ff4f78]" />

          <div
            className={`relative rotate-[-1.4deg] rounded-[1.55rem] border-[3px] bg-white px-6 py-6 shadow-[12px_12px_0_#180d2b] ${
              feedbackTone === "correct"
                ? "border-[#180d2b]"
                : feedbackTone === "wrong"
                  ? "border-[#3a2017] shadow-[12px_12px_0_#7c3a28]"
                  : "border-[#3a2017] shadow-[12px_12px_0_#d6b98b]"
            }`}
          >
            <div
              className={`absolute -left-7 -top-6 flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-full border-[3px] border-[#180d2b] text-4xl font-black text-white shadow-[4px_5px_0_#180d2b] ${
                feedbackTone === "correct"
                  ? "bg-[#16c46b]"
                  : feedbackTone === "wrong"
                    ? "bg-[#c46f4d]"
                    : "bg-[#c88a2d]"
              }`}
            >
              {feedbackTone === "correct" ? "✓" : feedbackTone === "wrong" ? "×" : "!"}
            </div>

            <div className="pl-12">
              <p
                className={`font-display text-xl font-black leading-tight ${
                  feedbackTone === "correct"
                    ? "text-[#201238]"
                    : feedbackTone === "wrong"
                      ? "text-[#3a2017]"
                      : "text-[#5f4024]"
                }`}
              >
                {feedbackTone === "correct"
                  ? "Correct !"
                  : feedbackTone === "wrong"
                    ? locale === "fr"
                      ? "Presque !"
                      : locale === "ta"
                        ? "கிட்டத்தட்ட !"
                        : "Almost !"
                    : labels.feedback}
              </p>
              <div
                className={`mt-1 h-2 w-24 rounded-full ${
                  feedbackTone === "correct"
                    ? "bg-[repeating-linear-gradient(90deg,#f0bd28_0_10px,transparent_10px_14px)]"
                    : feedbackTone === "wrong"
                      ? "bg-[repeating-linear-gradient(90deg,#d9825e_0_10px,transparent_10px_14px)]"
                      : "bg-[repeating-linear-gradient(90deg,#d6b98b_0_10px,transparent_10px_14px)]"
                }`}
              />
              <p
                className={`mt-2 font-tamil text-[clamp(2.1rem,8vw,3.8rem)] font-black leading-none ${
                  feedbackTone === "correct"
                    ? "text-[#13885c]"
                    : feedbackTone === "wrong"
                      ? "text-[#a45536]"
                      : "text-[#684f38]"
                }`}
              >
                {feedbackWord || feedback || labels.hint}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
