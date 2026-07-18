"use client";

import { useActionState, useMemo, useState } from "react";

import { upsertPictureSentenceAction } from "@/app/[locale]/admin/content-actions";
import { initialCrudState } from "@/lib/action-states";
import type { Locale, PictureSentenceCard, PictureSentenceGame } from "@/types";

function createEmptyCards(): PictureSentenceCard[] {
  return Array.from({ length: 10 }, (_, cardIndex) => ({
    id: `image-${cardIndex + 1}`,
    imageUrl: "",
    imageAlt: "",
    choices: Array.from({ length: 10 }, (_, choiceIndex) => ({
      id: `image-${cardIndex + 1}-phrase-${choiceIndex + 1}`,
      text: "",
      isCorrect: false,
    })),
  }));
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function PictureSentenceAdminForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial?: PictureSentenceGame | null;
}) {
  const [state, action, pending] = useActionState(upsertPictureSentenceAction, initialCrudState);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [cards, setCards] = useState<PictureSentenceCard[]>(() => {
    if (!initial?.cards.length) {
      return createEmptyCards();
    }

    const emptyCards = createEmptyCards();
    return emptyCards.map((emptyCard, index) => {
      const card = initial.cards[index];

      if (!card) {
        return emptyCard;
      }

      return {
        ...emptyCard,
        ...card,
        choices: emptyCard.choices.map((emptyChoice, choiceIndex) => ({
          ...emptyChoice,
          ...card.choices[choiceIndex],
        })),
      };
    });
  });
  const activeCard = cards[activeCardIndex];
  const completedCards = useMemo(
    () => cards.filter((card) => card.imageUrl.trim() && card.imageAlt.trim() && card.choices.every((choice) => choice.text.trim()) && card.choices.some((choice) => choice.isCorrect)).length,
    [cards],
  );

  function updateCard(patch: Partial<PictureSentenceCard>) {
    setCards((current) => current.map((card, index) => index === activeCardIndex ? { ...card, ...patch } : card));
  }

  function updateChoice(choiceIndex: number, patch: Partial<PictureSentenceCard["choices"][number]>) {
    setCards((current) => current.map((card, cardIndex) => {
      if (cardIndex !== activeCardIndex) {
        return card;
      }

      return {
        ...card,
        choices: card.choices.map((choice, index) => index === choiceIndex ? { ...choice, ...patch } : choice),
      };
    }));
  }

  return (
    <form action={action} className="mt-6 space-y-5 pb-24">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={initial?.id ?? ""} />
      <input type="hidden" name="cards" value={JSON.stringify(cards)} readOnly />

      <section className="overflow-hidden rounded-[1.5rem] border-[3px] border-[#180d2b] bg-white shadow-[7px_8px_0_#180d2b]">
        <div className="grid gap-3 border-b-[3px] border-[#180d2b] bg-[#f2ebff] p-4 sm:grid-cols-3 sm:p-5">
          <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white p-3 shadow-[3px_4px_0_#180d2b]">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#7c3aed]">Images prêtes</p>
            <p className="mt-1 font-display text-2xl font-black text-[#180d2b]">{completedCards}/10</p>
          </div>
          <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white p-3 shadow-[3px_4px_0_#180d2b]">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#7c3aed]">Phrases</p>
            <p className="mt-1 font-display text-2xl font-black text-[#180d2b]">100</p>
          </div>
          <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-[#c6ff2e] p-3 shadow-[3px_4px_0_#180d2b]">
            <p className="text-[0.65rem] font-black uppercase tracking-[0.16em] text-[#180d2b]/65">Temps / image</p>
            <p className="mt-1 font-display text-2xl font-black text-[#180d2b]">30 s</p>
          </div>
        </div>

        <div className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5 lg:grid-cols-4">
          <label className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3 shadow-[3px_4px_0_#180d2b] lg:col-span-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#806793]">Titre</span>
            <input
              name="title"
              required
              value={title}
              onChange={(event) => {
                const nextTitle = event.target.value;
                setTitle(nextTitle);
                if (!slugTouched) setSlug(slugify(nextTitle));
              }}
              className="mt-2 w-full bg-transparent text-base font-black text-[#180d2b] outline-none"
              placeholder="Scènes de la vie quotidienne"
            />
          </label>
          <label className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3 shadow-[3px_4px_0_#180d2b]">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#806793]">Slug</span>
            <input
              name="slug"
              required
              value={slug}
              onChange={(event) => { setSlugTouched(true); setSlug(slugify(event.target.value)); }}
              className="mt-2 w-full bg-transparent font-mono text-sm font-bold text-[#180d2b] outline-none"
              placeholder="vie-quotidienne"
            />
          </label>
          <label className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3 shadow-[3px_4px_0_#180d2b]">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#806793]">Difficulté</span>
            <select name="difficulty" defaultValue={initial?.difficulty ?? "beginner"} className="mt-2 w-full bg-transparent text-sm font-black text-[#180d2b] outline-none">
              <option value="beginner">Débutant</option>
              <option value="intermediate">Intermédiaire</option>
              <option value="advanced">Avancé</option>
            </select>
          </label>
          <label className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3 shadow-[3px_4px_0_#180d2b] sm:col-span-2 lg:col-span-3">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#806793]">Description</span>
            <input name="description" required defaultValue={initial?.description ?? ""} className="mt-2 w-full bg-transparent text-sm font-semibold text-[#180d2b] outline-none" placeholder="Sélectionner toutes les phrases correspondant à chaque image." />
          </label>
          <label className="rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3 shadow-[3px_4px_0_#180d2b]">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-[#806793]">Publication</span>
            <input name="publishDate" type="date" defaultValue={initial?.publishDate ?? ""} className="mt-2 w-full bg-transparent text-sm font-bold text-[#180d2b] outline-none" />
          </label>
          <input type="hidden" name="timePerImageSeconds" value="30" />
        </div>
      </section>

      <section className="rounded-[1.5rem] border-[3px] border-[#180d2b] bg-[#fffaf0] p-3 shadow-[7px_8px_0_#180d2b] sm:p-5">
        <div className="flex gap-2 overflow-x-auto pb-3 [scrollbar-width:thin]">
          {cards.map((card, index) => {
            const complete = Boolean(card.imageUrl.trim() && card.choices.every((choice) => choice.text.trim()) && card.choices.some((choice) => choice.isCorrect));
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveCardIndex(index)}
                className={`min-w-12 rounded-full border-[2px] border-[#180d2b] px-3 py-2 text-xs font-black shadow-[2px_3px_0_#180d2b] ${activeCardIndex === index ? "bg-[#7c3aed] text-white" : complete ? "bg-[#c6ff2e] text-[#180d2b]" : "bg-white text-[#180d2b]"}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-2 grid gap-5 xl:grid-cols-[minmax(18rem,0.78fr)_minmax(0,1.22fr)]">
          <div className="space-y-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">Image {activeCardIndex + 1}/10</p>
              <h2 className="mt-1 font-display text-2xl font-black text-[#180d2b]">Visuel et accessibilité</h2>
            </div>
            <label className="block rounded-[1rem] border-[2px] border-[#180d2b] bg-white p-4 shadow-[3px_4px_0_#180d2b]">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#806793]">URL ou chemin de l’image</span>
              <input value={activeCard.imageUrl} onChange={(event) => updateCard({ imageUrl: event.target.value })} className="mt-2 w-full bg-transparent text-sm font-semibold text-[#180d2b] outline-none" placeholder="/images/scene-1.jpg ou https://…" />
            </label>
            <label className="block rounded-[1rem] border-[2px] border-[#180d2b] bg-white p-4 shadow-[3px_4px_0_#180d2b]">
              <span className="text-xs font-black uppercase tracking-[0.14em] text-[#806793]">Description de l’image</span>
              <input value={activeCard.imageAlt} onChange={(event) => updateCard({ imageAlt: event.target.value })} className="mt-2 w-full bg-transparent text-sm font-semibold text-[#180d2b] outline-none" placeholder="Une famille prépare le repas." />
            </label>
            <div className="aspect-[4/3] overflow-hidden rounded-[1.2rem] border-[3px] border-[#180d2b] bg-[#eee5ff] shadow-[5px_6px_0_#180d2b]">
              {activeCard.imageUrl.trim() ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={activeCard.imageUrl} alt={activeCard.imageAlt} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center text-sm font-bold text-[#806793]">L’aperçu apparaîtra ici.</div>
              )}
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ff3b6f]">10 phrases obligatoires</p>
            <h2 className="mt-1 font-display text-2xl font-black text-[#180d2b]">Cochez toutes les bonnes réponses</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {activeCard.choices.map((choice, index) => (
                <div key={choice.id} className={`rounded-[1rem] border-[2px] border-[#180d2b] p-3 shadow-[3px_4px_0_#180d2b] ${choice.isCorrect ? "bg-[#e4ffd0]" : "bg-white"}`}>
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#180d2b] text-xs font-black text-white">{index + 1}</span>
                    <label className="ml-auto flex cursor-pointer items-center gap-2 text-[0.68rem] font-black uppercase tracking-wide text-[#180d2b]">
                      Bonne réponse
                      <input type="checkbox" checked={choice.isCorrect} onChange={(event) => updateChoice(index, { isCorrect: event.target.checked })} className="h-5 w-5 accent-[#20bf73]" />
                    </label>
                  </div>
                  <textarea value={choice.text} onChange={(event) => updateChoice(index, { text: event.target.value })} className="mt-3 min-h-16 w-full resize-none bg-transparent font-tamil text-base font-bold leading-6 text-[#180d2b] outline-none" placeholder="தமிழ் வாக்கியம்…" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {state.message ? (
        <p className={`rounded-[1rem] border-[2px] px-4 py-3 text-sm font-black ${state.ok ? "border-[#20bf73] bg-[#dcfce7] text-[#047857]" : "border-[#ff3b6f] bg-[#ffe4ee] text-[#be123c]"}`} aria-live="polite">
          {state.message}
        </p>
      ) : null}

      <div className="sticky bottom-4 z-20 flex flex-col gap-3 rounded-[1.2rem] border-[3px] border-[#180d2b] bg-white/95 p-3 shadow-[6px_7px_0_#180d2b] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-bold text-[#806793]">{completedCards === 10 ? "Les 10 images sont prêtes." : `${10 - completedCards} image(s) à compléter.`}</p>
        <button disabled={pending} className="rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] px-7 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5 disabled:opacity-50">
          {pending ? "Enregistrement…" : initial ? "Mettre à jour le jeu" : "Créer le jeu"}
        </button>
      </div>
    </form>
  );
}
