import { PictureSentenceAdminForm } from "@/components/admin/picture-sentence-admin-form";
import { requireAdminUser } from "@/lib/auth";
import { getLocaleOrThrow } from "@/lib/i18n";

export default async function NewPictureSentencePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);

  return (
    <div className="mx-auto max-w-[92rem] px-3 py-6 sm:px-5 lg:py-10">
      <p className="text-xs font-black uppercase tracking-[0.2em] text-[#7c3aed]">Oviyam · Admin</p>
      <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.4rem)] font-black leading-none text-[#180d2b]">Créer படம் + வாக்கியம்</h1>
      <PictureSentenceAdminForm locale={locale} />
    </div>
  );
}
