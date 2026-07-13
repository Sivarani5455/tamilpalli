import Link from "next/link";

import { normalizeImageUrl } from "@/lib/image-urls";
import type { KathaigalStory, Locale } from "@/types";

const copy = {
  en: {
    eyebrow: "Ilakiyam",
    title: "Kathaigal",
    subtitle: "Read Tamil stories with images after every paragraph.",
    open: "Open",
    empty: "No stories are available yet.",
  },
  fr: {
    eyebrow: "Ilakiyam",
    title: "Kathaigal",
    subtitle: "Lis des histoires en tamoul avec une image après chaque paragraphe.",
    open: "Ouvrir",
    empty: "Aucune histoire n'est disponible pour le moment.",
  },
  ta: {
    eyebrow: "இலக்கியம்",
    title: "கதைகள்",
    subtitle: "ஒவ்வொரு பத்தியின் பின்னரும் படங்களுடன் தமிழ் கதைகளை வாசிக்கவும்.",
    open: "திற",
    empty: "இப்போது கதைகள் எதுவும் இல்லை.",
  },
} satisfies Record<Locale, Record<string, string>>;

export function KathaigalIndex({ stories, locale }: { stories: KathaigalStory[]; locale: Locale }) {
  const labels = copy[locale];

  return (
    <main className="min-h-screen bg-[#fbf1e2] px-4 py-8 text-[#180d2b] sm:px-6">
      <section className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-[1.5rem] border-[3px] border-[#180d2b] bg-white p-6 shadow-[7px_8px_0_#180d2b] sm:p-8">
          <span className="absolute right-8 top-6 h-4 w-4 rounded-full bg-[#ff3b6f]" />
          <p className="inline-flex rounded-full border-2 border-[#180d2b] bg-[#eee5ff] px-4 py-1 text-xs font-black uppercase tracking-[0.22em] text-[#7c3aed] shadow-[2px_3px_0_#180d2b]">
            {labels.eyebrow}
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.4rem,7vw,4.8rem)] font-black leading-none tracking-[-0.03em] text-[#180d2b]">
            {labels.title}
          </h1>
          <p className="mt-4 max-w-2xl font-semibold leading-7 text-[#6f587f]">{labels.subtitle}</p>
        </div>

        {stories.length === 0 ? (
          <div className="mt-8 rounded-[1.25rem] border-[3px] border-dashed border-[#8a6a9c] bg-white p-8 text-center font-semibold text-[#6f587f]">
            {labels.empty}
          </div>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {stories.map((story) => (
              <Link
                key={story.id}
                href={`/${locale}/kathaigal/${story.id}`}
                className="group overflow-hidden rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white shadow-[6px_7px_0_#180d2b] transition hover:-translate-y-1"
              >
                {normalizeImageUrl(story.coverImageUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={normalizeImageUrl(story.coverImageUrl)} alt={story.title} loading="lazy" className="h-48 w-full border-b-[3px] border-[#180d2b] object-cover" />
                ) : (
                  <div className="h-48 border-b-[3px] border-[#180d2b] bg-[linear-gradient(135deg,#7c3aed,#ff3b6f,#ffc43d)]" />
                )}
                <div className="p-5">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7c3aed]">{story.difficulty}</p>
                  <h2 className="mt-2 font-tamil text-2xl font-black leading-tight text-[#180d2b]">{story.title}</h2>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold leading-6 text-[#6f587f]">{story.description}</p>
                  <span className="mt-5 inline-flex rounded-full border-[3px] border-[#180d2b] bg-[#ffc43d] px-5 py-2 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b]">
                    {labels.open}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
