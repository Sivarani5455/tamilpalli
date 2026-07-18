import Link from "next/link";

import type { Locale, PictureSentenceGame } from "@/types";

const copy = {
  en: { eyebrow: "Oviyam · Visual learning", title: "Picture + Sentence", body: "Observe each picture and select every Tamil sentence that describes it correctly.", play: "Start the game", empty: "New picture games are coming soon.", images: "images", seconds: "seconds per image" },
  fr: { eyebrow: "Oviyam · Apprentissage visuel", title: "Image + Phrase", body: "Observez chaque image et sélectionnez toutes les phrases tamoules qui la décrivent correctement.", play: "Commencer le jeu", empty: "De nouveaux jeux d’images arrivent bientôt.", images: "images", seconds: "secondes par image" },
  ta: { eyebrow: "ஓவியம் · காட்சிவழிக் கற்றல்", title: "படம் + வாக்கியம்", body: "ஒவ்வொரு படத்தையும் கவனித்து, அதற்குப் பொருந்தும் எல்லா வாக்கியங்களையும் தேர்ந்தெடுக்கவும்.", play: "விளையாட தொடங்கு", empty: "புதிய பட விளையாட்டுகள் விரைவில் வரும்.", images: "படங்கள்", seconds: "விநாடிகள் / படம்" },
} satisfies Record<Locale, Record<string, string>>;

export function PictureSentenceIndex({ games, locale }: { games: PictureSentenceGame[]; locale: Locale }) {
  const text = copy[locale];

  return (
    <main className="mx-auto max-w-[92rem] px-3 py-6 sm:px-5 lg:py-10">
      <section className="relative overflow-hidden rounded-[1.75rem] border-[3px] border-[#180d2b] bg-[#1b0b31] px-5 py-9 text-white shadow-[8px_9px_0_#ff78b7] sm:px-9 sm:py-12 lg:px-12">
        <span className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#ec4899]/35 blur-2xl" />
        <span className="absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-[#7c3aed]/30 blur-2xl" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#ff9dc9]">{text.eyebrow}</p>
          <h1 className="mt-4 font-tamil text-[clamp(2.4rem,7vw,5.4rem)] font-black leading-[0.95] tracking-[-0.04em]">{text.title}</h1>
          <p className="mt-5 max-w-2xl text-sm font-semibold leading-6 text-[#f3e8ff] sm:text-base">{text.body}</p>
        </div>
      </section>

      <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game, index) => (
          <article key={game.id} className="group overflow-hidden rounded-[1.4rem] border-[3px] border-[#180d2b] bg-white shadow-[7px_8px_0_#180d2b] transition hover:-translate-y-1">
            <div className="relative aspect-[16/9] overflow-hidden bg-[#f4eaff]">
              {game.cards[0]?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={game.cards[0].imageUrl} alt={game.cards[0].imageAlt} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center font-tamil text-6xl font-black text-[#7c3aed]">ப</div>
              )}
              <span className="absolute left-3 top-3 rounded-full border-[2px] border-[#180d2b] bg-[#ffc43d] px-3 py-1 text-xs font-black text-[#180d2b] shadow-[2px_3px_0_#180d2b]">#{String(index + 1).padStart(2, "0")}</span>
            </div>
            <div className="p-5">
              <h2 className="font-display text-2xl font-black leading-tight text-[#180d2b]">{game.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-[#806793]">{game.description}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-[#180d2b]">
                <span className="rounded-full bg-[#eee5ff] px-3 py-1.5">{game.cards.length} {text.images}</span>
                <span className="rounded-full bg-[#ffe0ef] px-3 py-1.5">{game.timePerImageSeconds} {text.seconds}</span>
              </div>
              <Link href={`/${locale}/oviyam/padam-vakkiyam/${game.id}`} className="mt-5 flex w-full items-center justify-between rounded-[1rem] border-[3px] border-[#180d2b] bg-[#c6ff2e] px-4 py-3 text-sm font-black text-[#180d2b] shadow-[4px_5px_0_#180d2b]">
                {text.play}<span aria-hidden="true">→</span>
              </Link>
            </div>
          </article>
        ))}
      </section>

      {games.length === 0 ? <p className="mt-10 rounded-[1.3rem] border-[3px] border-dashed border-[#806793] bg-white/70 p-10 text-center font-bold text-[#806793]">{text.empty}</p> : null}
    </main>
  );
}
