import { notFound } from "next/navigation";

import { KathaigalAdminForm } from "@/components/admin/content-forms";
import { requireAdminUser } from "@/lib/auth";
import { getAdminKathaigalStory } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminKathaigalEditPage({
  params,
}: {
  params: Promise<{ locale: string; storyId: string }>;
}) {
  const { locale: rawLocale, storyId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const story = await getAdminKathaigalStory(storyId);

  if (!story) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl font-black text-[#180d2b]">Edit Kathaigal Story</h1>
      <KathaigalAdminForm locale={locale} initial={story} />
    </div>
  );
}
