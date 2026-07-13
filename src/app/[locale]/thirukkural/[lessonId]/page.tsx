import { notFound, redirect } from "next/navigation";

import { getThirukkuralLessons } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function ThirukkuralLessonRoute({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const { locale: rawLocale, lessonId } = await params;
  const locale = getLocaleOrThrow(rawLocale);

  await requireCategoryAccess(locale, "thirukkural");
  const lessons = await getThirukkuralLessons();
  const lesson = lessons.find((entry) => entry.id === lessonId || entry.slug === lessonId);

  if (!lesson) {
    notFound();
  }

  redirect(`/${locale}/thirukkural?kural=${lesson.number}#learning-panel`);
}
