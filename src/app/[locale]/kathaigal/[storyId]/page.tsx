import { notFound } from "next/navigation";

import { KathaigalStoryPage } from "@/components/kathaigal/kathaigal-story-page";
import { getKathaigalStory } from "@/lib/content";
import { getLocaleOrThrow } from "@/lib/i18n";
import { requireCategoryAccess } from "@/lib/permissions";

export default async function KathaigalStoryRoute({
  params,
}: {
  params: Promise<{ locale: string; storyId: string }>;
}) {
  const { locale: rawLocale, storyId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireCategoryAccess(locale, "kathaigal");
  const story = await getKathaigalStory(storyId);

  if (!story) {
    notFound();
  }

  return <KathaigalStoryPage story={story} locale={locale} />;
}
