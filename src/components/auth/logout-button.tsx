import { logoutAction } from "@/app/[locale]/auth/actions";
import type { Locale } from "@/types";

export function LogoutButton({ locale }: { locale: Locale }) {
  const label = locale === "ta" ? "வெளியேறு" : locale === "fr" ? "Déconnexion" : "Log out";

  return (
    <form action={logoutAction}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="rounded-full border border-[rgba(185,121,63,0.24)] bg-[#fff7ea] px-4 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-[#654632] transition hover:border-[#8a5a2e] hover:bg-[#3a271b] hover:text-[#fff2dd]"
      >
        {label}
      </button>
    </form>
  );
}
