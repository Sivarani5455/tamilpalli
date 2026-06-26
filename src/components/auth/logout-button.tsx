import { logoutAction } from "@/app/[locale]/auth/actions";
import type { Locale } from "@/types";

export function LogoutButton({ locale }: { locale: Locale }) {
  const label = locale === "ta" ? "வெளியேறு" : locale === "fr" ? "Déconnexion" : "Log out";

  return (
    <form action={logoutAction}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium uppercase tracking-[0.16em] text-slate-700 transition hover:border-slate-950 hover:bg-slate-950 hover:text-white"
      >
        {label}
      </button>
    </form>
  );
}
