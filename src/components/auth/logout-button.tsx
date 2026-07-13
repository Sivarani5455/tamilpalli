import { logoutAction } from "@/app/[locale]/auth/actions";
import type { Locale } from "@/types";

export function LogoutButton({ locale, variant = "default" }: { locale: Locale; variant?: "default" | "menu" | "header" }) {
  const label = locale === "ta" ? "வெளியேறு" : locale === "fr" ? "Déconnexion" : "Log out";

  return (
    <form action={logoutAction}>
      <input type="hidden" name="locale" value={locale} />
      <button
        type="submit"
        className={
          variant === "menu"
            ? "w-full rounded-[0.65rem] border border-white/55 px-3 py-2.5 text-xs font-medium text-[#e65b59] transition hover:bg-white/35"
            : variant === "header"
              ? "rounded-full border-[3px] border-[#180d2b] bg-white px-4 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-[#180d2b] shadow-[2px_2px_0_#180d2b] transition hover:bg-[#ffc43d]"
            : "rounded-full border-[3px] border-[#180d2b] bg-white px-4 py-2.5 text-xs font-black uppercase tracking-[0.16em] text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#ff3b6f] hover:text-white"
        }
      >
        {variant === "menu" ? `⇥  ${label}` : label}
      </button>
    </form>
  );
}
