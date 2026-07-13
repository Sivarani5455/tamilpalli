"use client";

import Image from "next/image";
import { type MouseEvent, useActionState, useEffect, useState } from "react";

import { saveImageHuntScoreAction } from "@/app/[locale]/game-actions";
import { initialGameState } from "@/lib/action-states";
import { celebrateCorrect, celebrateWrong } from "@/lib/game-celebrations";
import { Timer } from "@/components/shared/timer";
import type { ImageHuntExercise, ImageHuntProgress, Locale } from "@/types";

const MAX_IMAGE_HUNT_ERRORS = 3;

export function ImageHuntGame({
  exercise,
  initialProgress,
  locale,
}: {
  exercise: ImageHuntExercise;
  initialProgress?: ImageHuntProgress | null;
  locale: Locale;
}) {
  const validInitialFoundIds =
    initialProgress?.foundTargetIds.filter((targetId) => exercise.targets.some((target) => target.id === targetId)) ?? [];
  const initialTimeUsedSeconds = Math.min(initialProgress?.timeUsedSeconds ?? 0, exercise.timeLimitSeconds);
  const hasSavedProgress =
    validInitialFoundIds.length > 0 || (initialProgress?.wrongClicks ?? 0) > 0 || initialTimeUsedSeconds > 0;
  const timerStartSeconds = Math.max(exercise.timeLimitSeconds - initialTimeUsedSeconds, 0);
  const [timerInitialSeconds, setTimerInitialSeconds] = useState(timerStartSeconds);
  const [found, setFound] = useState<string[]>(validInitialFoundIds);
  const [hasInteracted, setHasInteracted] = useState(hasSavedProgress);
  const [isPaused, setIsPaused] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [feedbackWord, setFeedbackWord] = useState("");
  const [clickMarkers, setClickMarkers] = useState<Array<{
    id: number;
    x: number;
    y: number;
    ok: boolean;
  }>>([]);
  const [wrongClicks, setWrongClicks] = useState(Math.min(initialProgress?.wrongClicks ?? 0, MAX_IMAGE_HUNT_ERRORS));
  const [timeUsedSeconds, setTimeUsedSeconds] = useState(initialTimeUsedSeconds);
  const [state, formAction] = useActionState(saveImageHuntScoreAction, initialGameState);
  const currentTarget = exercise.targets.find((target) => !found.includes(target.id)) ?? null;
  const score = Math.max(found.length * 50 - wrongClicks * 10, 0);
  const hasFailed = wrongClicks >= MAX_IMAGE_HUNT_ERRORS;
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
    failed: locale === "fr" ? "Essai terminé" : locale === "ta" ? "முயற்சி முடிந்தது" : "Attempt over",
    failedMessage:
      locale === "fr"
        ? "Tu as atteint les 3 erreurs maximum."
        : locale === "ta"
          ? "அதிகபட்ச 3 பிழைகள் முடிந்துவிட்டன."
          : "You reached the maximum of 3 errors.",
    progress: locale === "fr" ? "Progression" : locale === "ta" ? "முன்னேற்றம்" : "Progress",
    score: locale === "fr" ? "Score" : locale === "ta" ? "மதிப்பெண்" : "Score",
    errors: locale === "fr" ? "Erreurs" : locale === "ta" ? "பிழைகள்" : "Errors",
    time: locale === "fr" ? "Temps" : locale === "ta" ? "நேரம்" : "Time",
    save: locale === "fr" ? "Sauvegarder" : locale === "ta" ? "சேமி" : "Save progress",
    saveProgress:
      locale === "fr"
        ? "Sauvegarder la partie"
        : locale === "ta"
          ? "விளையாட்டை சேமி"
          : "Save game",
    pause: locale === "fr" ? "Pause" : locale === "ta" ? "இடைநிறுத்து" : "Pause",
    resume: locale === "fr" ? "Reprendre" : locale === "ta" ? "தொடரவும்" : "Resume",
    feedback: locale === "fr" ? "Retour" : locale === "ta" ? "பதில்" : "Feedback",
    hint:
      locale === "fr"
        ? "Clique directement sur l'objet demande dans l'image."
        : locale === "ta"
          ? "படத்தில் கேட்கப்பட்ட பொருளை நேரடியாக தொடவும்."
          : "Tap directly on the requested object in the image.",
  };

  function handleImageClick(event: MouseEvent<HTMLButtonElement>) {
    if (!currentTarget || isPaused || hasFailed) {
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
      celebrateCorrect(locale);
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

    celebrateWrong(locale);
    const nextWrongClicks = Math.min(wrongClicks + 1, MAX_IMAGE_HUNT_ERRORS);
    setWrongClicks(nextWrongClicks);
    setFeedbackWord(currentLabel);
    setFeedback(
      nextWrongClicks >= MAX_IMAGE_HUNT_ERRORS
        ? labels.failedMessage
        : locale === "fr"
          ? "Ce n'est pas la bonne zone. Essaie encore."
          : locale === "ta"
            ? "இது சரியான பகுதி இல்லை. மீண்டும் முயற்சி செய்."
            : "That is not the right area. Try again.",
    );
  }

  useEffect(() => {
    if (isPaused || hasFailed) {
      return;
    }

    const timer = window.setInterval(() => {
      setTimeUsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [hasFailed, isPaused]);

  useEffect(() => {
    if (!hasInteracted || hasFailed || found.length >= exercise.targets.length) {
      return;
    }

    const payload = {
      exerciseId: exercise.id,
      score,
      totalTargets: exercise.targets.length,
      foundTargetIds: found,
      wrongClicks,
      hintsUsed: 0,
      timeUsedSeconds,
    };

    function saveSilently() {
      const body = JSON.stringify(payload);

      if (navigator.sendBeacon) {
        navigator.sendBeacon("/api/image-hunt/progress", new Blob([body], { type: "application/json" }));
        return;
      }

      void fetch("/api/image-hunt/progress", {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      });
    }

    function handleVisibilityChange() {
      if (document.visibilityState === "hidden") {
        saveSilently();
      }
    }

    window.addEventListener("pagehide", saveSilently);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("pagehide", saveSilently);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [exercise.id, exercise.targets.length, found, hasFailed, hasInteracted, score, timeUsedSeconds, wrongClicks]);

  useEffect(() => {
    if (!hasFailed) {
      return;
    }

    const resetTimer = window.setTimeout(() => {
      setFound([]);
      setFeedback("");
      setFeedbackWord("");
      setClickMarkers([]);
      setWrongClicks(0);
      setTimeUsedSeconds(0);
      setTimerInitialSeconds(exercise.timeLimitSeconds);
      setHasInteracted(false);
      setIsPaused(false);
    }, 2400);

    return () => window.clearTimeout(resetTimer);
  }, [exercise.timeLimitSeconds, hasFailed]);

  function renderProgressPanel(className = "") {
    return (
      <div className={`relative px-1 pb-2 pt-2 ${className}`}>
        <span className="absolute left-8 top-0 h-3 w-3 rotate-12 rounded-[0.25rem] bg-[#ffc43d]" />
        <span className="absolute right-8 top-1 h-2.5 w-2.5 rounded-full bg-[#7c3aed] sm:right-10 sm:top-2 sm:h-3 sm:w-3" />

        <div className="relative rounded-[1.35rem] border-[3px] border-[#180d2b] bg-white px-4 py-4 shadow-[7px_8px_0_#180d2b]">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-[#efe6ff] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#7c3aed] shadow-[3px_4px_0_#180d2b]">
              <span className="h-2 w-2 rounded-full bg-[#7c3aed]" />
              {labels.progress}
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-[#fff5cf] py-1 pl-3 pr-1 text-[0.68rem] font-black uppercase tracking-[0.12em] text-[#9a6a2f] shadow-[3px_4px_0_#180d2b]">
              <span>{labels.time}</span>
              <span className="font-mono text-xs tracking-normal text-[#1d1230]">
                <Timer key={timerInitialSeconds} initialSeconds={timerInitialSeconds} paused={isPaused || hasFailed} />
              </span>
              <button
                type="button"
                onClick={() => setIsPaused((current) => !current)}
                className={`flex h-7 w-7 items-center justify-center rounded-full border-[2px] border-[#180d2b] text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#180d2b] ${
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
            <div className="rotate-[-1deg] rounded-[1rem] border-[3px] border-[#180d2b] bg-[#e7fff3] px-3 py-3 shadow-[5px_6px_0_#180d2b]">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#14865f]">{labels.score}</p>
              <p className="mt-1 text-3xl font-black leading-none text-[#1d1230]">{score}</p>
            </div>
            <div className="rotate-[1deg] rounded-[1rem] border-[3px] border-[#180d2b] bg-[#ffe8ef] px-3 py-3 shadow-[5px_6px_0_#180d2b]">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.16em] text-[#e23c75]">{labels.errors}</p>
              <p className="mt-1 text-3xl font-black leading-none text-[#1d1230]">
                {wrongClicks}/{MAX_IMAGE_HUNT_ERRORS}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {exercise.targets.map((target, index) => {
              const done = found.includes(target.id);
              const isCurrent = index === found.length;

              return (
                <span
                  key={target.id}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-[3px] text-xs font-black transition ${
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

          <form action={formAction} className="mt-4 space-y-3">
            <input type="hidden" name="exerciseId" value={exercise.id} />
            <input type="hidden" name="score" value={score} />
            <input type="hidden" name="totalTargets" value={exercise.targets.length} />
            <input type="hidden" name="foundTargets" value={found.length} />
            <input type="hidden" name="foundTargetIds" value={found.join(",")} />
            <input type="hidden" name="wrongClicks" value={wrongClicks} />
            <input type="hidden" name="hintsUsed" value={0} />
            <input type="hidden" name="timeUsedSeconds" value={timeUsedSeconds} />
            <input type="hidden" name="path" value={`/${locale}/image-hunt/${exercise.id}`} />
            <button
              className="flex min-h-12 w-full items-center justify-center rounded-[1.1rem] border-[3px] border-[#180d2b] bg-[#19bf74] px-5 py-2.5 text-sm font-black text-white shadow-[5px_6px_0_#180d2b] transition hover:-translate-y-0.5 hover:shadow-[8px_9px_0_#180d2b] active:translate-y-0.5 active:shadow-[3px_4px_0_#180d2b]"
              aria-label={labels.saveProgress}
              title={labels.saveProgress}
            >
              <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none">
                <path
                  d="M5 5.8C5 4.8 5.8 4 6.8 4h8.8L19 7.4v10.8c0 1-.8 1.8-1.8 1.8H6.8c-1 0-1.8-.8-1.8-1.8V5.8Z"
                  fill="currentColor"
                  opacity="0.22"
                />
                <path
                  d="M5 5.8C5 4.8 5.8 4 6.8 4h8.8L19 7.4v10.8c0 1-.8 1.8-1.8 1.8H6.8c-1 0-1.8-.8-1.8-1.8V5.8Z"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
                <path d="M8 4v5h7V4.4M8 16h8" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
              </svg>
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
    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(18rem,0.65fr)]">
      <article className="space-y-3">
        <div
          className={`relative overflow-hidden rounded-[1.35rem] border-[3px] border-[#180d2b] bg-white px-4 py-4 shadow-[7px_8px_0_#180d2b] sm:px-6 sm:py-5 ${
            hasInteracted ? "hidden xl:block" : ""
          }`}
        >
          <span className="absolute right-20 top-[-0.35rem] h-3 w-3 rotate-12 rounded-[0.25rem] bg-[#ffc43d] sm:top-[-0.45rem] sm:h-4 sm:w-4" />
          <span className="absolute right-9 top-[-0.15rem] h-2.5 w-2.5 rounded-full bg-[#ff3b7d] sm:h-3 sm:w-3" />
          <span className="absolute bottom-[-0.65rem] left-16 h-3 w-11 -rotate-12 rounded-full bg-[#b7ff2a] sm:bottom-[-0.85rem] sm:h-4 sm:w-14" />
          <span className="absolute -right-2 -top-1 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#7c3aed] text-white shadow-[3px_4px_0_#180d2b]">
            <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
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
            <h1 className="truncate font-display text-[clamp(1.65rem,5vw,2.4rem)] font-black leading-tight text-[#24143d]">
                {exercise.title}
            </h1>
            <p className="mt-1 text-sm font-bold leading-5 text-[#7a6048]">
              {exercise.instruction[locale] ?? exercise.instruction.fr ?? exercise.instruction.en}
            </p>
          </div>

          <div className="relative mt-4 h-3 overflow-hidden rounded-full border-[2px] border-[#180d2b] bg-[#fff8ec]">
            <div
              className="h-full rounded-r-sm bg-[linear-gradient(90deg,#19bf74,#b7ff2a)] transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {hasInteracted ? renderProgressPanel("image-hunt-mobile-progress-enter xl:hidden") : null}

        <div className="rounded-[1.35rem] border border-[#ead5b8] bg-[#fff8ec] p-2 shadow-[0_24px_70px_-55px_rgba(74,51,36,0.48)] sm:p-3">
          <div className="relative mb-3 pt-3">
            <span className="absolute left-7 top-0 h-3 w-3 rotate-12 rounded-[0.25rem] bg-[#b7ff2a] sm:h-4 sm:w-4" />
            <span className="absolute right-20 top-1 h-2.5 w-2.5 rounded-full bg-[#7c3aed] sm:top-2 sm:h-3 sm:w-3" />
            <span className="absolute bottom-[-0.55rem] right-28 h-3 w-3 rotate-12 bg-[#19bf74] sm:bottom-[-0.75rem] sm:h-4 sm:w-4" />
            <span className="absolute -left-2 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ff3b7d] text-white shadow-[3px_4px_0_#180d2b]">
              <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="7" stroke="currentColor" strokeWidth="2.4" />
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2.4" />
                <circle cx="12" cy="12" r="1" fill="currentColor" />
              </svg>
            </span>

            <div className="relative rotate-[-0.8deg] rounded-[1.15rem] border-[3px] border-[#180d2b] bg-[#ffc83d] px-7 py-5 shadow-[6px_7px_0_#180d2b]">
              <p className="inline-flex rounded-full bg-[#24143d] px-3 py-1 text-[0.65rem] font-black uppercase tracking-[0.14em] text-white">
                {hasFailed ? labels.failed : currentTarget ? labels.goal : labels.complete}
              </p>
              <p className="mt-3 text-[clamp(1.45rem,4vw,2.15rem)] font-black leading-tight text-[#24143d]">
                {hasFailed ? (
                  labels.failedMessage
                ) : currentTarget ? (
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
            disabled={!currentTarget || isPaused || hasFailed}
            className="relative block aspect-[16/11] w-full overflow-hidden rounded-[1.25rem] border border-[#ead5b8] bg-[#f7ead7] shadow-inner transition duration-150 active:scale-[0.992] disabled:cursor-default disabled:opacity-75 sm:aspect-[16/9]"
          >
            {exercise.imageUrl ? (
              <Image
                src={exercise.imageUrl}
                alt=""
                fill
                sizes="(max-width: 1280px) calc(100vw - 48px), 70vw"
                className="object-cover"
              />
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
                  className={`absolute h-16 w-16 animate-ping rounded-full opacity-45 ${
                    marker.ok ? "bg-[#22c55e]/30" : "bg-[#f4a261]/30"
                  }`}
                />
                <span
                  className={`relative flex h-13 w-13 items-center justify-center rounded-full border-[3px] border-[#180d2b] text-3xl font-black text-white shadow-[5px_6px_0_#180d2b] sm:h-16 sm:w-16 sm:text-4xl ${
                    marker.ok
                      ? "bg-[#20bf74]"
                      : "bg-[#f4a261]"
                  }`}
                >
                  <span
                    className={`absolute inset-1.5 rounded-full border-2 border-dashed ${
                      marker.ok ? "border-[#b7ff2a]" : "border-[#ffe16c]"
                    }`}
                  />
                  <span className="relative -mt-0.5">{marker.ok ? "✓" : "×"}</span>
                </span>
              </span>
            ))}
          </button>

        </div>
      </article>

      <aside className="space-y-3 xl:sticky xl:top-6 xl:self-start">
        {renderProgressPanel("hidden xl:block")}

        <div className="relative min-h-[8rem] px-2 pb-2 pt-4">
          <span className="absolute left-3 top-7 h-3 w-3 rounded-full bg-[#f2c23d]" />
          <span className="absolute right-5 top-5 h-4 w-4 rounded-full bg-[#7c3aed]" />
          <span className="absolute bottom-3 left-12 h-2 w-10 rounded-full bg-[#9be15d]" />
          <span className="absolute bottom-7 right-1 h-5 w-5 rotate-45 rounded-[0.3rem] bg-[#ff4f78]" />

          <div
            className={`relative rotate-[-1.4deg] rounded-[1.35rem] border-[3px] bg-white px-5 py-5 shadow-[8px_9px_0_#180d2b] ${
              feedbackTone === "correct"
                ? "border-[#180d2b]"
                : feedbackTone === "wrong"
                  ? "border-[#3a2017] shadow-[8px_9px_0_#7c3a28]"
                  : "border-[#3a2017] shadow-[8px_9px_0_#d6b98b]"
            }`}
          >
            <div
              className={`absolute -left-5 -top-5 flex h-12 w-12 rotate-[8deg] items-center justify-center rounded-full border-[3px] border-[#180d2b] text-3xl font-black text-white shadow-[3px_4px_0_#180d2b] ${
                feedbackTone === "correct"
                  ? "bg-[#16c46b]"
                  : feedbackTone === "wrong"
                    ? "bg-[#c46f4d]"
                    : "bg-[#c88a2d]"
              }`}
            >
              {feedbackTone === "correct" ? "✓" : feedbackTone === "wrong" ? "×" : "!"}
            </div>

            <div className="pl-8">
              <p
                className={`font-display text-lg font-black leading-tight ${
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
                className={`mt-2 font-tamil text-[clamp(1.75rem,5vw,2.8rem)] font-black leading-none ${
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
