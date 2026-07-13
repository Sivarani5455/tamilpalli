import { notFound } from "next/navigation";

import { ThirukkuralAdminForm } from "@/components/admin/thirukkural-form";
import { requireAdminUser } from "@/lib/auth";
import { getAdminThirukkuralLesson } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminThirukkuralEditPage({
  params,
}: {
  params: Promise<{ locale: string; lessonId: string }>;
}) {
  const { locale: rawLocale, lessonId } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const lesson = await getAdminThirukkuralLesson(lessonId);

  if (!lesson) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-2 py-6 sm:px-4">
      <h1 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black text-[#180d2b]">
        Edit Thirukkural
      </h1>
      <ThirukkuralAdminForm locale={locale} initial={lesson} />
    </div>
  );
}
