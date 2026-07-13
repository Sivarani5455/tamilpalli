import Link from "next/link";

import { DeleteContentButton } from "@/components/admin/delete-content-button";
import { PublicationStatus } from "@/components/admin/publication-status";
import { requireAdminUser } from "@/lib/auth";
import { getAdminKathaigalStories } from "@/lib/content-admin";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function AdminKathaigalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const stories = await getAdminKathaigalStories();

  return (
    <div className="mx-auto max-w-5xl px-2 py-6 sm:px-4">
      <div className="flex items-center justify-between gap-4">
        <h1 className="font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-tight text-[#180d2b]">
          Kathaigal Admin
        </h1>
        <Link
          href={`/${locale}/admin/kathaigal/new`}
          className="inline-flex items-center gap-2 rounded-full border-[3px] border-[#180d2b] bg-[#180d2b] px-5 py-3 text-sm font-black text-white shadow-[4px_5px_0_#ffc43d] transition hover:-translate-y-0.5"
        >
          <span className="text-[#ffc43d]">+</span>
          New story
        </Link>
      </div>

      <div className="mt-6 grid gap-4">
        {stories.map((story) => (
          <article key={story.id} className="rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h2 className="truncate font-tamil text-2xl font-black leading-tight text-[#180d2b]">{story.title}</h2>
                <p className="mt-1 text-sm font-semibold text-[#8a6a9c]">
                  {story.paragraphs.length} paragraphs · {story.difficulty}
                </p>
                <PublicationStatus publishDate={story.publishDate} isActive={story.isActive} locale={locale} />
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/${locale}/admin/kathaigal/${story.id}/edit`}
                  className="rounded-full border-[3px] border-[#180d2b] bg-white px-5 py-2.5 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5"
                >
                  Edit
                </Link>
                <DeleteContentButton
                  locale={locale}
                  id={story.id}
                  kind="kathaigal"
                  className="rounded-full border-[3px] border-[#ff3b6f] bg-white px-5 py-2.5 text-sm font-black text-[#ff3b6f] shadow-[3px_4px_0_#ff3b6f] transition hover:-translate-y-0.5"
                />
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
