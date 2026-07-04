import { logoutAction } from "@/app/[locale]/auth/actions";
import type { Locale } from "@/types";

export function LogoutButton({ locale }: { locale: Locale }) {
  const label = locale === "ta" ? "வெளியேறு" : locale === "fr" ? "Déconnexion" : "Log out";

  return (
    <form action={logoutAction}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="rounded-full border-[3px] border-[#180d2b] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#ff3b6f] hover:text-white"
      >
        {label}
      </button>
    </form>
  );
}
