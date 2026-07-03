import { CategoryAccessForm } from "@/components/admin/management-forms";
import { getAdminCategoryAccess } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";
import { getLocaleOrThrow } from "@/lib/i18n";

function AccessBadge() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ff3b6f] text-white shadow-[3px_4px_0_#180d2b]">
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="6" width="14" height="12" rx="2" />
        <path d="M8 10h8M8 14h5" />
      </svg>
    </span>
  );
}

export default async function AdminContentPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);
  const contentCategories = await getAdminCategoryAccess();

  return (
    <div className="mx-auto max-w-5xl px-2 py-6 sm:px-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7c3aed]">Admin</p>
          <h1 className="mt-1 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-tight text-[#180d2b]">
            Content Access
          </h1>
        </div>
        <span className="rounded-full border-[3px] border-[#180d2b] bg-[#c6ff2e] px-4 py-2 text-sm font-black text-[#180d2b] shadow-[3px_4px_0_#180d2b]">
          {contentCategories.length} categories
        </span>
      </div>

      <div className="mt-6 grid gap-4">
        {contentCategories.map((category) => (
          <article
            key={category.id}
            className="rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]"
          >
            <div className="flex min-w-0 items-start gap-4">
              <AccessBadge />
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate font-display text-2xl font-black leading-tight text-[#180d2b]">
                    {category.title}
                  </h2>
                  <span className="rounded-full border-[2px] border-[#180d2b] bg-[#efe6ff] px-3 py-1 text-xs font-black uppercase text-[#7c3aed]">
                    {category.type}
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold leading-6 text-[#8a6a9c]">{category.description}</p>
              </div>
            </div>
            <CategoryAccessForm locale={locale} category={category} />
          </article>
        ))}
      </div>
    </div>
  );
}
