import { CategoryAccessForm } from "@/components/admin/management-forms";
import { getAdminCategoryAccess } from "@/lib/admin";
import { requireAdminUser } from "@/lib/auth";
import { getLocaleOrThrow } from "@/lib/i18n";

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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-5xl text-slate-950">Content Access</h1>
      <div className="mt-8 grid gap-6">
        {contentCategories.map((category) => (
          <article key={category.id} className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <h2 className="font-display text-3xl text-slate-950">{category.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{category.description}</p>
            <CategoryAccessForm locale={locale} category={category} />
          </article>
        ))}
      </div>
    </div>
  );
}
