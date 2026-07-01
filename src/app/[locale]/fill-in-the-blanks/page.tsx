import Link from "next/link";

import { getFillBlankExercises } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function FillBlanksIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "fill-in-the-blanks");
  const fillBlankExercises = await getFillBlankExercises();
  const title =
    locale === "ta" ? "காலியிடங்களை நிரப்புக" : locale === "fr" ? "Texte à trous" : "Fill in the Blanks";
  const exerciseLabel =
    locale === "ta"
      ? "விளக்கம் மற்றும் கருத்துகளுடன் கேள்விகள்"
      : locale === "fr"
        ? "questions avec explications et retours pédagogiques."
        : "question set with feedback-ready explanations.";

  return (
    <div className="mx-auto max-w-[120rem] px-4 py-10 sm:px-6 xl:px-8">
      <div className="rounded-[1.75rem] border border-[rgba(185,121,63,0.22)] bg-[#fff8ec]/95 p-6 shadow-[0_20px_50px_-38px_rgba(74,51,36,0.34)] sm:p-8">
        <h1 className="font-display text-5xl text-[var(--brand-ink)]">{title}</h1>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {fillBlankExercises.map((exercise) => (
            <Link
              key={exercise.id}
              href={`/${locale}/fill-in-the-blanks/${exercise.id}`}
              className="rounded-[1.4rem] border border-[rgba(185,121,63,0.2)] bg-[#fff7ea] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#d3a238] hover:bg-[#fffdf8]"
            >
              <p className="text-sm uppercase tracking-[0.3em] text-[#8a6a4c]">{exercise.difficulty}</p>
              <h2 className="mt-2 font-display text-3xl text-[var(--brand-ink)]">{exercise.title}</h2>
              <p className="mt-3 text-sm text-[#6f553d]">
                {exercise.questions.length} {exerciseLabel}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
