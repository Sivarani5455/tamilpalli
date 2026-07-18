"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { savePictureSentenceScoreAction } from "@/app/[locale]/game-actions";
import { initialGameState } from "@/lib/action-states";
import type { Locale, PictureSentenceGame } from "@/types";

type RoundResult = { selected: Set<string>; timedOut: boolean } | null;

const labels = {
  en: { back: "Back", score: "Score", time: "Time", image: "Image", instruction: "Select every sentence that matches the picture.", validate: "Check my answers", next: "Next picture", timeout: "Time is up", correct: "Correct", wrong: "Incorrect", missed: "Missed", finished: "Gallery completed!", result: "Correct sentences selected", replay: "Play again", list: "Back to games" },
  fr: { back: "Retour", score: "Score", time: "Temps", image: "Image", instruction: "Sélectionnez toutes les phrases correspondant à l’image.", validate: "Valider mes réponses", next: "Image suivante", timeout: "Temps écoulé", correct: "Correcte", wrong: "Incorrecte", missed: "Oubliée", finished: "Galerie terminée !", result: "Bonnes phrases sélectionnées", replay: "Rejouer", list: "Retour aux jeux" },
  ta: { back: "திரும்பு", score: "மதிப்பெண்", time: "நேரம்", image: "படம்", instruction: "படத்திற்குப் பொருந்தும் எல்லா வாக்கியங்களையும் தேர்ந்தெடுக்கவும்.", validate: "பதில்களைச் சரிபார்", next: "அடுத்த படம்", timeout: "நேரம் முடிந்தது", correct: "சரி", wrong: "தவறு", missed: "விடுபட்டது", finished: "படத்தொகுப்பு முடிந்தது!", result: "தேர்ந்தெடுத்த சரியான வாக்கியங்கள்", replay: "மீண்டும் விளையாடு", list: "விளையாட்டுகளுக்குத் திரும்பு" },
} satisfies Record<Locale, Record<string, string>>;

function formatClock(seconds: number) {
  return `00:${String(seconds).padStart(2, "0")}`;
}

export function PictureSentenceGame({ game, locale }: { game: PictureSentenceGame; locale: Locale }) {
  const text = labels[locale];
  const [cardIndex, setCardIndex] = useState(0);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedRef = useRef<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(game.timePerImageSeconds);
  const [roundResult, setRoundResult] = useState<RoundResult>(null);
  const [score, setScore] = useState(0);
  const [correctSelected, setCorrectSelected] = useState(0);
  const [timeUsed, setTimeUsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saveState, saveAction] = useActionState(savePictureSentenceScoreAction, initialGameState);
  const scoreFormRef = useRef<HTMLFormElement | null>(null);
  const hasSavedRef = useRef(false);
  const card = game.cards[cardIndex];
  const totalCorrect = useMemo(() => game.cards.reduce((total, item) => total + item.choices.filter((choice) => choice.isCorrect).length, 0), [game.cards]);

  const finishRound = useCallback((timedOut = false) => {
    if (roundResult || finished || !card) return;
    const selected = new Set(selectedRef.current);
    const rightSelections = card.choices.filter((choice) => choice.isCorrect && selected.has(choice.id)).length;
    const wrongSelections = card.choices.filter((choice) => !choice.isCorrect && selected.has(choice.id)).length;
    const allCorrect = card.choices.every((choice) => choice.isCorrect === selected.has(choice.id));
    setCorrectSelected((current) => current + rightSelections);
    setScore((current) => current + Math.max(0, rightSelections * 100 - wrongSelections * 50 + (allCorrect ? 200 : 0)));
    setTimeUsed((current) => current + (game.timePerImageSeconds - timeLeft));
    setRoundResult({ selected, timedOut });
  }, [card, finished, game.timePerImageSeconds, roundResult, timeLeft]);

  useEffect(() => {
    if (finished && !hasSavedRef.current) {
      hasSavedRef.current = true;
      scoreFormRef.current?.requestSubmit();
    }
  }, [finished]);

  useEffect(() => {
    if (finished || roundResult || !card) return;

    const timer = window.setTimeout(() => setTimeLeft((current) => Math.max(0, current - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [card, finished, roundResult, timeLeft]);

  useEffect(() => {
    if (timeLeft !== 0 || roundResult || finished || !card) return;
    finishRound(true);
  }, [timeLeft, roundResult, finished, card, finishRound]);

  if (!card) return null;

  function toggleChoice(id: string) {
    if (roundResult || finished) return;
    const next = selectedRef.current.includes(id) ? selectedRef.current.filter((item) => item !== id) : [...selectedRef.current, id];
    selectedRef.current = next;
    setSelectedIds(next);
  }

  function nextCard() {
    if (cardIndex >= game.cards.length - 1) {
      setFinished(true);
      return;
    }
    selectedRef.current = [];
    setSelectedIds([]);
    setRoundResult(null);
    setCardIndex((current) => current + 1);
    setTimeLeft(game.timePerImageSeconds);
  }

  const timerPercent = (timeLeft / game.timePerImageSeconds) * 100;

  return (
    <main className="mx-auto max-w-[96rem] px-2 py-4 sm:px-4 lg:px-6 lg:py-7">
      <section className="overflow-hidden rounded-[1.5rem] border-[3px] border-[#180d2b] bg-[#fffaf0] shadow-[8px_9px_0_#180d2b]">
        <header className="border-b-[3px] border-[#180d2b] bg-[#1b0b31] p-3 text-white sm:p-4 lg:px-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link href={`/${locale}/oviyam/padam-vakkiyam`} className="flex h-10 w-10 items-center justify-center rounded-full border-[2px] border-white/70 bg-white/10 text-lg font-black" aria-label={text.back}>←</Link>
            <div className="min-w-0 flex-1">
              <p className="text-[0.62rem] font-black uppercase tracking-[0.2em] text-[#ff9dc9]">Oviyam · படம் + வாக்கியம்</p>
              <h1 className="mt-1 truncate font-display text-lg font-black sm:text-2xl">{game.title}</h1>
            </div>
            <div className="flex gap-2">
              <div className="rounded-[0.8rem] border-2 border-white/25 bg-white/10 px-3 py-2">
                <p className="text-[0.55rem] font-black uppercase tracking-wider text-[#ff9dc9]">{text.score}</p>
                <p className="text-lg font-black tabular-nums">{score}</p>
              </div>
              <div className={`rounded-[0.8rem] border-2 px-3 py-2 ${timeLeft <= 8 ? "border-[#ff5f6d] bg-[#ff5f6d]" : "border-white/25 bg-white/10"}`}>
                <p className="text-[0.55rem] font-black uppercase tracking-wider text-white/75">{text.time}</p>
                <p className="text-lg font-black tabular-nums">{formatClock(timeLeft)}</p>
              </div>
            </div>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
            <div className={`h-full rounded-full transition-[width] duration-500 ${timeLeft <= 8 ? "bg-[#ff5f6d]" : "bg-[#c6ff2e]"}`} style={{ width: `${timerPercent}%` }} />
          </div>
        </header>

        <div className="grid gap-4 p-3 sm:p-5 lg:grid-cols-[minmax(20rem,0.85fr)_minmax(0,1.15fr)] lg:gap-6 lg:p-6">
          <div>
            <div className="mb-3 flex items-center justify-between gap-3">
              <span className="rounded-full border-[2px] border-[#180d2b] bg-[#ffc43d] px-3 py-1.5 text-xs font-black text-[#180d2b] shadow-[2px_3px_0_#180d2b]">{text.image} {cardIndex + 1}/10</span>
              <div className="flex gap-1.5">{game.cards.map((item, index) => <span key={item.id} className={`h-2.5 rounded-full transition-all ${index === cardIndex ? "w-6 bg-[#ec4899]" : index < cardIndex ? "w-2.5 bg-[#20bf73]" : "w-2.5 bg-[#d7c9df]"}`} />)}</div>
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[1.25rem] border-[3px] border-[#180d2b] bg-[#eee5ff] shadow-[6px_7px_0_#180d2b] sm:aspect-[16/10] lg:aspect-[4/3]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={card.imageUrl} alt={card.imageAlt} className="h-full w-full object-cover" />
              <div className="absolute inset-x-3 bottom-3 rounded-[0.85rem] bg-[#180d2b]/85 px-3 py-2 text-xs font-bold text-white backdrop-blur sm:text-sm">{card.imageAlt}</div>
            </div>
            <div className="mt-4 rounded-[1rem] border-[2px] border-[#180d2b] bg-[#eee5ff] p-3 text-sm font-black leading-5 text-[#180d2b] shadow-[3px_4px_0_#180d2b]">{text.instruction}</div>
          </div>

          <div className="flex min-w-0 flex-col">
            <div className="grid gap-2.5 sm:grid-cols-2 lg:gap-3">
              {card.choices.map((choice, index) => {
                const selected = selectedIds.includes(choice.id);
                const feedback = roundResult ? choice.isCorrect ? selected ? "correct" : "missed" : selected ? "wrong" : "neutral" : "neutral";
                return (
                  <button
                    key={choice.id}
                    type="button"
                    onClick={() => toggleChoice(choice.id)}
                    disabled={Boolean(roundResult)}
                    className={`group flex min-h-[4.4rem] items-start gap-3 rounded-[1rem] border-[2px] border-[#180d2b] p-3 text-left shadow-[3px_4px_0_#180d2b] transition active:translate-y-0.5 ${feedback === "correct" ? "bg-[#20bf73] text-white" : feedback === "wrong" ? "bg-[#ff5f6d] text-white" : feedback === "missed" ? "bg-[#ffc43d] text-[#180d2b]" : selected ? "bg-[#7c3aed] text-white" : "bg-white text-[#180d2b] hover:bg-[#f7efff]"}`}
                  >
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-black ${selected || feedback === "correct" || feedback === "wrong" ? "border-white bg-white/15" : "border-[#180d2b] bg-[#fffaf0]"}`}>{selected ? "✓" : index + 1}</span>
                    <span className="font-tamil text-[0.98rem] font-bold leading-6 sm:text-base">{choice.text}</span>
                  </button>
                );
              })}
            </div>

            {roundResult ? (
              <div className="mt-4 flex flex-col gap-3 rounded-[1rem] border-[3px] border-[#180d2b] bg-white p-3 shadow-[4px_5px_0_#180d2b] sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm font-black text-[#180d2b]">{roundResult.timedOut ? text.timeout : `${text.correct}: ${card.choices.filter((choice) => choice.isCorrect && roundResult.selected.has(choice.id)).length}/${card.choices.filter((choice) => choice.isCorrect).length}`}</p>
                <button type="button" onClick={nextCard} className="rounded-full border-[3px] border-[#180d2b] bg-[#c6ff2e] px-6 py-2.5 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b]">{cardIndex === game.cards.length - 1 ? text.finished : text.next}</button>
              </div>
            ) : (
              <button type="button" onClick={() => finishRound(false)} disabled={selectedIds.length === 0} className="mt-4 rounded-[1rem] border-[3px] border-[#180d2b] bg-[#ec4899] px-6 py-3.5 text-sm font-black text-white shadow-[5px_6px_0_#180d2b] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-[#cdbfd3]">{text.validate} · {selectedIds.length}</button>
            )}
          </div>
        </div>
      </section>

      {finished ? (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#180d2b]/70 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-[1.7rem] border-[3px] border-[#180d2b] bg-white p-6 text-center shadow-[9px_10px_0_#ff78b7] sm:p-8">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] text-3xl shadow-[4px_5px_0_#180d2b]">✦</span>
            <h2 className="mt-5 font-display text-4xl font-black leading-none text-[#180d2b]">{text.finished}</h2>
            <p className="mt-4 text-sm font-bold text-[#806793]">{text.result}: {correctSelected}/{totalCorrect}</p>
            <p className="mt-3 text-6xl font-black text-[#7c3aed]">{score}</p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button type="button" onClick={() => window.location.reload()} className="rounded-[1rem] border-[3px] border-[#180d2b] bg-[#ffc43d] px-4 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b]">{text.replay}</button>
              <Link href={`/${locale}/oviyam/padam-vakkiyam`} className="rounded-[1rem] border-[3px] border-[#180d2b] bg-white px-4 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b]">{text.list}</Link>
            </div>
            {saveState.message ? <p className="mt-4 text-xs font-bold text-[#806793]">{saveState.message}</p> : null}
          </div>
        </div>
      ) : null}

      <form ref={scoreFormRef} action={saveAction} className="hidden">
        <input type="hidden" name="gameId" value={game.id} />
        <input type="hidden" name="score" value={score} />
        <input type="hidden" name="correctChoices" value={correctSelected} />
        <input type="hidden" name="totalCorrectChoices" value={totalCorrect} />
        <input type="hidden" name="completedImages" value={game.cards.length} />
        <input type="hidden" name="timeUsedSeconds" value={timeUsed} />
        <input type="hidden" name="path" value={`/${locale}/oviyam/padam-vakkiyam/${game.id}`} />
      </form>
    </main>
  );
}
