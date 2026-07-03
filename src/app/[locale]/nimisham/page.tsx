import Link from "next/link";

import { getNimishamExercises } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function NimishamIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "nimisham");
  const exercises = await getNimishamExercises();
  const title = locale === "ta" ? "நிமிடம்" : "Nimisham";
  const subtitle =
    locale === "fr"
      ? "Clique sur un maximum de bons mots avant la fin du temps."
      : locale === "ta"
        ? "நேரம் முடிவதற்கு முன் சரியான சொற்களைத் தொடுங்கள்."
        : "Tap as many matching Tamil words as you can before time runs out.";

  return (
    <div className="mx-auto max-w-[120rem] px-4 py-10 sm:px-6 xl:px-8">
      <div className="rounded-[1.75rem] border border-[rgba(185,121,63,0.22)] bg-[#fff8ec]/95 p-6 shadow-[0_20px_50px_-38px_rgba(74,51,36,0.34)] sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#9a6a2f]">Games</p>
        <h1 className="mt-2 font-display text-5xl text-[var(--brand-ink)]">{title}</h1>
        <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#6f553d]">{subtitle}</p>
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {exercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/${locale}/nimisham/${exercise.id}`}
              className="rounded-[1.4rem] border border-[rgba(185,121,63,0.2)] bg-[#fff7ea] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#d3a238] hover:bg-[#fffdf8]"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-[#8a6a4c]">{exercise.difficulty}</p>
              <h2 className="mt-2 font-display text-3xl text-[var(--brand-ink)]">{exercise.title}</h2>
              <p className="mt-3 text-sm text-[#6f553d]">
                {exercise.words.length} words · {exercise.words.filter((word) => word.isCorrect).length} targets · {exercise.timeLimitSeconds}s
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
