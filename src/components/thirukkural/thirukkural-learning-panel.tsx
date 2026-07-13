import type { Locale, ThirukkuralLesson } from "@/types";

const copy = {
  en: { porul: "Porul" },
  fr: { porul: "Porul" },
  ta: { porul: "பொருள்" },
} satisfies Record<Locale, { porul: string }>;

export function ThirukkuralLearningPanel({
  lesson,
  locale,
}: {
  lesson: ThirukkuralLesson;
  locale: Locale;
}) {
  const labels = copy[locale];

  return (
    <div id="learning-panel">
      <div className="relative py-7 sm:py-8">
        {lesson.kuralLines.map((line) => (
          <p key={line} className="font-tamil text-2xl font-bold leading-[1.65] text-[#1A0B2E] sm:text-[28px] sm:leading-[1.55]">
            {line}
          </p>
        ))}
      </div>

      <div className="rounded-[18px] border-[2.5px] border-[#1A0B2E] bg-white px-5 py-5 shadow-[5px_5px_0_#1A0B2E] sm:px-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-[#FFC93C]" aria-hidden="true">★</span>
          <p className="font-tamil text-xs font-bold uppercase tracking-[0.08em] text-[#C99300]">{labels.porul}</p>
        </div>
        <p className="mt-3 font-tamil text-base font-medium leading-8 text-[#3B2E4A] sm:text-[17px] sm:leading-9">
          {lesson.porul}
        </p>
      </div>
    </div>
  );
}
