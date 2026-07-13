import Link from "next/link";

import { KathaigalQuiz } from "@/components/kathaigal/kathaigal-quiz";
import { normalizeImageUrl } from "@/lib/image-urls";
import type { KathaigalStory, Locale } from "@/types";

const copy = {
  en: { back: "Stories", story: "Story", chapters: "Chapters", quiz: "Quiz", start: "Start reading", chapter: "Chapter" },
  fr: { back: "Histoires", story: "Histoire", chapters: "Chapitres", quiz: "Quiz", start: "Commencer", chapter: "Chapitre" },
  ta: { back: "கதைகள்", story: "கதை", chapters: "பகுதிகள்", quiz: "வினாடி வினா", start: "படிக்க தொடங்கு", chapter: "பகுதி" },
} satisfies Record<Locale, { back: string; story: string; chapters: string; quiz: string; start: string; chapter: string }>;

export function KathaigalStoryPage({ story, locale }: { story: KathaigalStory; locale: Locale }) {
  const labels = copy[locale];
  const coverImageUrl = normalizeImageUrl(story.coverImageUrl);
  const firstImageUrl = coverImageUrl || normalizeImageUrl(story.paragraphs[0]?.imageUrl);

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 py-7 text-[#1e1b2e] sm:px-6">
      <article className="mx-auto flex max-w-[29rem] flex-col gap-3.5">
        <Link
          href={`/${locale}/kathaigal`}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#ece9f5] bg-white px-3.5 py-2 text-xs font-extrabold text-[#6b6580] shadow-[0_8px_24px_rgba(30,27,46,0.06)] transition hover:-translate-y-0.5"
        >
          ← {labels.back}
        </Link>

        <header className="rounded-2xl border border-[#ece9f5] bg-white p-5 shadow-[0_1px_2px_rgba(30,27,46,0.04),0_8px_24px_rgba(30,27,46,0.06)]">
          <div className="flex items-start gap-3.5">
            <div className="relative h-[84px] w-[84px] shrink-0 overflow-hidden rounded-xl bg-[linear-gradient(150deg,#f5b12e,#ff6a5c)]">
              {firstImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={firstImageUrl} alt={story.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full w-full place-items-center font-tamil text-4xl font-black text-white">க</div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f2eeff] px-2.5 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-[#7b5cfa] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#7b5cfa]">
                {labels.story}
              </span>
              <h1 className="mt-1.5 text-balance font-tamil text-[1.45rem] font-black leading-[1.28] text-[#1e1b2e]">
                {story.title}
              </h1>
              <p className="mt-1 line-clamp-2 text-[0.78rem] font-semibold leading-5 text-[#6b6580]">
                {story.description}
              </p>
            </div>
          </div>

          <div className="mt-3.5 flex gap-2">
            <div className="flex-1 rounded-[0.65rem] border border-[#ece9f5] bg-[#faf9f6] px-2 py-2 text-center">
              <span className="block text-[0.95rem] font-black leading-tight text-[#ff6a5c]">{story.paragraphs.length}</span>
              <span className="text-[0.55rem] font-bold uppercase tracking-[0.06em] text-[#6b6580]">{labels.chapters}</span>
            </div>
            <div className="flex-1 rounded-[0.65rem] border border-[#ece9f5] bg-[#faf9f6] px-2 py-2 text-center">
              <span className="block text-[0.95rem] font-black leading-tight text-[#2fae6b]">{story.questions.length}</span>
              <span className="text-[0.55rem] font-bold uppercase tracking-[0.06em] text-[#6b6580]">{labels.quiz}</span>
            </div>
            <div className="flex-1 rounded-[0.65rem] border border-[#ece9f5] bg-[#faf9f6] px-2 py-2 text-center">
              <span className="block text-[0.95rem] font-black leading-tight text-[#3e8ede]">{story.difficulty.slice(0, 1).toUpperCase()}</span>
              <span className="text-[0.55rem] font-bold uppercase tracking-[0.06em] text-[#6b6580]">{story.difficulty}</span>
            </div>
          </div>

          <a
            href="#chapter-1"
            className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1e1b2e] px-4 py-3 text-[0.85rem] font-extrabold text-white transition hover:opacity-85"
          >
            {labels.start} →
          </a>
        </header>

        <div className="flex flex-col gap-3.5">
          {story.paragraphs.map((paragraph, index) => {
            const imageUrl = normalizeImageUrl(paragraph.imageUrl);

            return (
              <section
                id={`chapter-${index + 1}`}
                key={paragraph.id}
                className="flex gap-3.5 rounded-2xl border border-[#ece9f5] bg-white p-[18px] shadow-[0_1px_2px_rgba(30,27,46,0.04),0_8px_24px_rgba(30,27,46,0.06)]"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-[#f2eeff] text-xs font-black text-[#7b5cfa]">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-[0.04em] text-[#6b6580]">
                      {labels.chapter} {index + 1}
                    </span>
                  </div>
                  <p className="m-0 font-tamil text-[0.95rem] font-semibold leading-[1.75] text-[#1e1b2e]">
                    {paragraph.textTa}
                  </p>
                </div>
                <div className="relative h-16 w-16 shrink-0 self-start overflow-hidden rounded-[0.65rem] bg-[linear-gradient(160deg,#2fae6b,#3e8ede)]">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt={paragraph.imageAlt[locale] || paragraph.imageAlt.ta || story.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center font-tamil text-2xl font-black text-white">க</div>
                  )}
                </div>
              </section>
            );
          })}
        </div>

        <footer className="px-2 pt-1 text-center text-[0.7rem] font-bold text-[#6b6580]">
          {story.title} · {labels.story}
        </footer>

        <KathaigalQuiz questions={story.questions} locale={locale} />
      </article>
    </main>
  );
}
