import { isPublicationAvailable } from "@/lib/publication";
import type { Locale } from "@/types";

export function PublicationStatus({
  publishDate,
  isActive = true,
  locale,
}: {
  publishDate?: string | null;
  isActive?: boolean;
  locale: Locale;
}) {
  const scheduled = isActive && !isPublicationAvailable(publishDate);
  const label = !isActive ? "Inactive" : scheduled ? "Planifié" : "Actif";
  const tone = !isActive
    ? "bg-[#fff5cf] text-[#9a6a2f]"
    : scheduled
      ? "bg-[#eee5ff] text-[#7c3aed]"
      : "bg-[#c6ff2e] text-[#180d2b]";
  const formattedDate = publishDate
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${publishDate}T00:00:00Z`))
    : null;

  return (
    <div className="mt-2 flex flex-wrap items-center gap-2">
      <span className={`rounded-full border-[2px] border-[#180d2b] px-3 py-1 text-[11px] font-black ${tone}`}>
        {label}
      </span>
      {formattedDate ? <span className="text-xs font-black text-[#7c3aed]">Publication : {formattedDate}</span> : null}
    </div>
  );
}
