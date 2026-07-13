import { WordHuntAdminForm } from "@/components/admin/content-forms";
import { requireAdminUser } from "@/lib/auth";
import { getLocaleOrThrow } from "@/lib/i18n";

function ClockBadge() {
  return (
    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-[3px] border-[#180d2b] bg-[#ff3b6f] text-white shadow-[3px_4px_0_#180d2b]">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2.4"
      >
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v4l3 2" />
      </svg>
    </span>
  );
}

export default async function AdminWordHuntNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = getLocaleOrThrow(rawLocale);
  await requireAdminUser(locale);

  return (
    <div className="mx-auto max-w-7xl px-2 py-6 sm:px-4">
      <div className="flex min-w-0 items-center gap-4">
        <ClockBadge />
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7c3aed]">Admin</p>
          <h1 className="mt-1 font-display text-[clamp(1.9rem,4vw,2.6rem)] font-black leading-tight text-[#180d2b]">
            Create Word Hunt
          </h1>
        </div>
      </div>
      <WordHuntAdminForm locale={locale} />
    </div>
  );
}
