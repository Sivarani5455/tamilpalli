"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { isAgarathiDailyQuizComplete } from "@/lib/agarathi-daily";
import { cn } from "@/lib/utils";
import type { DictionaryEntry, Locale } from "@/types";

import { LogoutButton } from "../auth/logout-button";
import { AgarathiGateModal } from "../dictionary/agarathi-gate-modal";
import { LanguageSwitcher } from "../navigation/language-switcher";
import { BrandMark } from "./brand-mark";

const navItems = [
  { href: "", key: "home" },
  { href: "/pricing", key: "pricing" },
  { href: "/dashboard", key: "dashboard" },
  { href: "/admin", key: "admin" },
] as const;

const gameItems = [
  { href: "/word-search", key: "wordSearch" },
  { href: "/fill-in-the-blanks", key: "fillBlanks" },
  { href: "/image-hunt", key: "imageHunt" },
  { href: "/nimisham", key: "nimisham" },
] as const;

type HeaderCopy = {
  login: string;
  menu: string;
  agarathi: string;
  nav: Record<(typeof navItems)[number]["key"], string>;
  games: Record<(typeof gameItems)[number]["key"], string>;
  dropdown: {
    learning: string;
    games: string;
    learningEyebrow: string;
    learningEmpty: string;
    learningHint: string;
    gamesEyebrow: string;
    gamesHint: string;
    gamesListTitle: string;
    gameDescriptions: Record<(typeof gameItems)[number]["key"], string>;
    newBadge: string;
    currentPage: string;
  };
};

const headerCopy: Record<Locale, HeaderCopy> = {
  en: {
    login: "Log in",
    menu: "Menu",
    agarathi: "Agarathi",
    nav: {
      home: "Home",
      pricing: "Pricing",
      dashboard: "Dashboard",
      admin: "Admin",
    },
    games: {
      wordSearch: "Word Search",
      fillBlanks: "Fill in the Blanks",
      imageHunt: "Image Hunt",
      nimisham: "Nimisham",
    },
    dropdown: {
      learning: "Learning",
      games: "Games",
      learningEyebrow: "Learning paths",
      learningEmpty: "New learning pages will appear here soon.",
      learningHint: "This space is ready for future lessons and structured practice.",
      gamesEyebrow: "Game formats",
      gamesHint: "Jump into interactive Tamil activities from one place.",
      gamesListTitle: "Available now",
      gameDescriptions: {
        wordSearch: "Interactive Tamil vocabulary grids.",
        fillBlanks: "Sentence completion with guided feedback.",
        imageHunt: "Visual identification with Tamil labels.",
        nimisham: "Timed word tapping by category.",
      },
      newBadge: "New",
      currentPage: "Current page",
    },
  },
  fr: {
    login: "Se connecter",
    menu: "Menu",
    agarathi: "Agarathi",
    nav: {
      home: "Accueil",
      pricing: "Tarifs",
      dashboard: "Tableau de bord",
      admin: "Admin",
    },
    games: {
      wordSearch: "Mots mêlés",
      fillBlanks: "Texte à trous",
      imageHunt: "Chasse aux images",
      nimisham: "Nimisham",
    },
    dropdown: {
      learning: "Learning",
      games: "Jeux",
      learningEyebrow: "Parcours",
      learningEmpty: "De nouvelles pages d'apprentissage apparaîtront ici bientôt.",
      learningHint: "Cet espace est prêt pour les prochains contenus d'apprentissage.",
      gamesEyebrow: "Formats de jeu",
      gamesHint: "Accédez rapidement aux activités tamoules interactives.",
      gamesListTitle: "Disponible maintenant",
      gameDescriptions: {
        wordSearch: "Grilles interactives de vocabulaire tamoul.",
        fillBlanks: "Complétion de phrases avec retours guidés.",
        imageHunt: "Repérage visuel avec libellés tamouls.",
        nimisham: "Course contre la montre avec mots tamouls.",
      },
      newBadge: "Nouveau",
      currentPage: "Page active",
    },
  },
  ta: {
    login: "உள்நுழை",
    menu: "பட்டியல்",
    agarathi: "அகராதி",
    nav: {
      home: "முகப்பு",
      pricing: "விலை திட்டங்கள்",
      dashboard: "டாஷ்போர்டு",
      admin: "நிர்வாகம்",
    },
    games: {
      wordSearch: "சொல் தேடல்",
      fillBlanks: "காலியிடங்களை நிரப்பு",
      imageHunt: "பட வேட்டை",
      nimisham: "நிமிடம்",
    },
    dropdown: {
      learning: "கற்றல்",
      games: "விளையாட்டுகள்",
      learningEyebrow: "கற்றல் பாதைகள்",
      learningEmpty: "புதிய கற்றல் பக்கங்கள் விரைவில் இங்கே தோன்றும்.",
      learningHint: "எதிர்கால பாடங்களுக்கும் பயிற்சிகளுக்கும் இந்த இடம் தயார்.",
      gamesEyebrow: "விளையாட்டு வடிவங்கள்",
      gamesHint: "ஒரே இடத்தில் இருந்து தமிழ் தொடர்பாடல் செயல்பாடுகளுக்குச் செல்லுங்கள்.",
      gamesListTitle: "இப்போது கிடைக்கும்",
      gameDescriptions: {
        wordSearch: "தமிழ் சொற்களுக்கான தொடர்பாடல் கட்டங்கள்.",
        fillBlanks: "வழிகாட்டும் பின்னூட்டத்துடன் வாக்கிய நிரப்பு.",
        imageHunt: "தமிழ் குறிச்சொற்களுடன் காட்சி அடையாளம் காணல்.",
        nimisham: "நேரத்துக்கு எதிராக சரியான சொற்களைத் தேர்வு செய்யுங்கள்.",
      },
      newBadge: "புதியது",
      currentPage: "நடப்பு பக்கம்",
    },
  },
};

type DesktopDropdown = "learning" | "games" | null;

function navTextClass(isTamil: boolean) {
  return isTamil ? "font-black tracking-[0.01em]" : "font-black";
}

export function HeaderClient({
  locale,
  isLoggedIn,
  dictionaryEntries,
}: {
  locale: Locale;
  isLoggedIn: boolean;
  dictionaryEntries: DictionaryEntry[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [agarathiModalOpen, setAgarathiModalOpen] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState<DesktopDropdown>(null);
  const copy = headerCopy[locale];
  const isTamil = locale === "ta";

  function openAgarathiGate() {
    if (dictionaryEntries.length === 0 || isAgarathiDailyQuizComplete()) {
      router.push(`/${locale}/agarathi`);
      return;
    }

    setAgarathiModalOpen(true);
  }

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setDesktopDropdown(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b-[3px] border-[#180d2b] bg-[#fbf1e2]/95 backdrop-blur-xl">
      <div
        ref={rootRef}
        className="relative mx-auto flex min-h-[88px] w-full max-w-[120rem] items-center gap-5 px-4 sm:px-6 xl:px-8"
      >
        <Link href={`/${locale}`} className="shrink-0">
          <BrandMark compact />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
          <Link
            href={`/${locale}`}
            className={cn(
              "rounded-full border-2 border-transparent px-4 py-2 text-[0.98rem] text-[#180d2b] transition hover:-translate-y-0.5 hover:border-[#180d2b] hover:bg-[#ffc43d] hover:shadow-[2px_3px_0_#180d2b]",
              navTextClass(isTamil),
            )}
          >
            {copy.nav.home}
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setDesktopDropdown("learning")}
            onMouseLeave={() => setDesktopDropdown((current) => (current === "learning" ? null : current))}
          >
            <button
              type="button"
              onClick={() => setDesktopDropdown((current) => (current === "learning" ? null : "learning"))}
              className={cn(
                "flex items-center gap-2 rounded-full border-2 border-transparent px-4 py-2 text-[0.98rem] text-[#180d2b] transition hover:-translate-y-0.5 hover:border-[#180d2b] hover:bg-[#c6ff2e] hover:shadow-[2px_3px_0_#180d2b]",
                desktopDropdown === "learning" && "border-[#180d2b] bg-[#c6ff2e] shadow-[2px_3px_0_#180d2b]",
                navTextClass(isTamil),
              )}
            >
              <span>{copy.dropdown.learning}</span>
              <span className={cn("text-xs transition", desktopDropdown === "learning" && "rotate-180")}>⌃</span>
            </button>

            {desktopDropdown === "learning" ? (
              <div className="absolute left-1/2 top-full z-50 w-[40rem] max-w-[calc(100vw-4rem)] -translate-x-1/2 pt-4">
                <div className="overflow-hidden rounded-[1.35rem] border-[3px] border-[#180d2b] bg-white shadow-[7px_8px_0_#180d2b]">
                  <div className="bg-[#eee5ff] px-7 py-7">
                    <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7c3aed]">
                      {copy.dropdown.learningEyebrow}
                    </p>
                    <p className="mt-5 max-w-sm text-[1.55rem] font-black leading-tight tracking-[-0.02em] text-[#180d2b]">
                      {copy.dropdown.learningEmpty}
                    </p>
                    <p className="mt-4 max-w-sm text-sm font-semibold leading-7 text-[#6f587f]">{copy.dropdown.learningHint}</p>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div
            className="relative"
            onMouseEnter={() => setDesktopDropdown("games")}
            onMouseLeave={() => setDesktopDropdown((current) => (current === "games" ? null : current))}
          >
            <button
              type="button"
              onClick={() => setDesktopDropdown((current) => (current === "games" ? null : "games"))}
              className={cn(
                "flex items-center gap-2 rounded-full border-2 border-transparent px-4 py-2 text-[0.98rem] text-[#180d2b] transition hover:-translate-y-0.5 hover:border-[#180d2b] hover:bg-[#ffc43d] hover:shadow-[2px_3px_0_#180d2b]",
                desktopDropdown === "games" && "border-[#180d2b] bg-[#ffc43d] shadow-[2px_3px_0_#180d2b]",
                navTextClass(isTamil),
              )}
            >
              <span>{copy.dropdown.games}</span>
              <span className={cn("text-xs transition", desktopDropdown === "games" && "rotate-180")}>⌃</span>
            </button>

            {desktopDropdown === "games" ? (
              <div className="absolute left-1/2 top-full z-50 w-[56rem] max-w-[calc(100vw-4rem)] -translate-x-1/2 pt-4">
                <div className="overflow-hidden rounded-[1.35rem] border-[3px] border-[#180d2b] bg-white shadow-[7px_8px_0_#180d2b]">
                  <div className="grid gap-0 md:grid-cols-[0.78fr_1.22fr]">
                    <div className="border-r-[3px] border-[#180d2b] bg-[#fff2cf] px-7 py-7">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff9f1c]">
                        {copy.dropdown.gamesEyebrow}
                      </p>
                      <p className="mt-5 max-w-sm text-[1.55rem] font-black leading-tight tracking-[-0.02em] text-[#180d2b]">
                        {copy.dropdown.games}
                      </p>
                      <p className="mt-4 max-w-sm text-sm font-semibold leading-7 text-[#6f587f]">{copy.dropdown.gamesHint}</p>
                    </div>

                    <div className="px-7 py-7">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="text-xs font-black uppercase tracking-[0.24em] text-[#8a6a9c]">
                          {copy.dropdown.gamesListTitle}
                        </p>
                        <span className="rounded-full border-2 border-[#180d2b] bg-[#c6ff2e] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#180d2b] shadow-[2px_3px_0_#180d2b]">
                          {copy.dropdown.newBadge}
                        </span>
                      </div>

                      <div className="grid gap-3">
                        {gameItems.map((gameItem, index) => {
                          const targetHref = `/${locale}${gameItem.href}`;
                          const isCurrentPage = pathname === targetHref;

                          return (
                            <Link
                              key={gameItem.href}
                              href={targetHref}
                              onClick={() => setDesktopDropdown(null)}
                              className={cn(
                                "group flex items-start justify-between gap-4 rounded-[1rem] border-[3px] px-5 py-4 shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5",
                                isCurrentPage
                                  ? "border-[#180d2b] bg-[#eee5ff]"
                                  : "border-[#180d2b] bg-[#fff8ec] hover:bg-white",
                              )}
                            >
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#180d2b] bg-[#20bf73] text-sm font-black text-white">
                                    {index + 1}
                                  </span>
                                  <h3 className="text-lg font-black text-[#180d2b] transition group-hover:text-[#7c3aed]">
                                    {copy.games[gameItem.key]}
                                  </h3>
                                  {isCurrentPage ? (
                                    <span className="rounded-full bg-[#ffc43d] px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#180d2b]">
                                      {copy.dropdown.currentPage}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-3 pl-12 text-sm font-semibold leading-6 text-[#6f587f]">
                                  {copy.dropdown.gameDescriptions[gameItem.key]}
                                </p>
                              </div>
                              <span className="pt-2 text-[#7c3aed] transition group-hover:translate-x-1">→</span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => {
              setDesktopDropdown(null);
              openAgarathiGate();
            }}
            className={cn(
              "rounded-full border-2 border-transparent px-4 py-2 text-[0.98rem] text-[#180d2b] transition hover:-translate-y-0.5 hover:border-[#180d2b] hover:bg-[#20bf73] hover:text-white hover:shadow-[2px_3px_0_#180d2b]",
              pathname === `/${locale}/agarathi` && "border-[#180d2b] bg-[#20bf73] text-white shadow-[2px_3px_0_#180d2b]",
              navTextClass(isTamil),
            )}
          >
            {copy.agarathi}
          </button>

          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "rounded-full border-2 border-transparent px-4 py-2 text-[0.98rem] text-[#180d2b] transition hover:-translate-y-0.5 hover:border-[#180d2b] hover:bg-[#ffc43d] hover:shadow-[2px_3px_0_#180d2b]",
                pathname === `/${locale}${item.href}` && "border-[#180d2b] bg-[#ffc43d] shadow-[2px_3px_0_#180d2b]",
                navTextClass(isTamil),
              )}
            >
              {copy.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden items-center gap-3 lg:flex">
          {!isLoggedIn ? (
            <Link
              href={`/${locale}/auth/login`}
              className={cn(
                "rounded-full border-2 border-[#180d2b] bg-white px-4 py-2 text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#c6ff2e]",
                isTamil ? "text-[0.98rem] font-black tracking-[0.01em]" : "text-[0.98rem] font-black",
              )}
            >
              {copy.login}
            </Link>
          ) : null}

          <LanguageSwitcher locale={locale} />

          {isLoggedIn ? <LogoutButton locale={locale} /> : null}
        </div>

        <button
          type="button"
          className={cn(
            "ml-auto rounded-full border-[3px] border-[#180d2b] bg-white px-4 py-2 text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#ffc43d] lg:hidden",
            isTamil ? "text-[0.98rem] font-black tracking-[0.01em]" : "text-sm font-black",
          )}
          onClick={() => setOpen((value) => !value)}
        >
          {copy.menu}
        </button>
      </div>

      <div className={cn("border-t-[3px] border-[#180d2b] bg-[#fbf1e2] lg:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto flex max-w-[120rem] flex-col gap-1 px-4 py-4 sm:px-6">
          <Link
            href={`/${locale}`}
            className={cn(
              "rounded-[1rem] border-2 border-[#180d2b] bg-white px-4 py-3 text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#ffc43d]",
              isTamil ? "text-[1rem] font-black tracking-[0.01em]" : "text-sm font-black",
            )}
            onClick={() => setOpen(false)}
          >
            {copy.nav.home}
          </Link>

          <div className="mt-2 rounded-[1rem] border-[3px] border-[#180d2b] bg-[#eee5ff] px-4 py-3 shadow-[3px_4px_0_#180d2b]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7c3aed]">
              {copy.dropdown.learningEyebrow}
            </p>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#6f587f]">{copy.dropdown.learningEmpty}</p>
          </div>

          <div className="mt-2 rounded-[1rem] border-[3px] border-[#180d2b] bg-[#fff2cf] px-4 py-3 shadow-[3px_4px_0_#180d2b]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#ff9f1c]">
              {copy.dropdown.gamesEyebrow}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {gameItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[#180d2b] transition hover:bg-white",
                    isTamil ? "text-[0.98rem] font-black tracking-[0.01em]" : "text-sm font-black",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {copy.games[item.key]}
                </Link>
              ))}
            </div>
          </div>

          <button
            type="button"
            className={cn(
              "mt-2 rounded-[1rem] border-2 border-[#180d2b] bg-white px-4 py-3 text-left text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#20bf73] hover:text-white",
              isTamil ? "text-[1rem] font-black tracking-[0.01em]" : "text-sm font-black",
            )}
            onClick={() => {
              setOpen(false);
              openAgarathiGate();
            }}
          >
            {copy.agarathi}
          </button>

          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "rounded-[1rem] border-2 border-[#180d2b] bg-white px-4 py-3 text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#ffc43d]",
                isTamil ? "text-[1rem] font-black tracking-[0.01em]" : "text-sm font-black",
              )}
              onClick={() => setOpen(false)}
            >
              {copy.nav[item.key]}
            </Link>
          ))}

          <div className="mt-2 flex flex-wrap items-center gap-3 border-t-[3px] border-[#180d2b] pt-4">
            {!isLoggedIn ? (
              <Link
                href={`/${locale}/auth/login`}
                className={cn(
                  "rounded-full border-2 border-[#180d2b] bg-white px-4 py-2 text-[#180d2b] shadow-[2px_3px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#c6ff2e]",
                  isTamil ? "text-[0.98rem] font-black tracking-[0.01em]" : "text-sm font-black",
                )}
                onClick={() => setOpen(false)}
              >
                {copy.login}
              </Link>
            ) : null}

            <LanguageSwitcher locale={locale} />

            {isLoggedIn ? <LogoutButton locale={locale} /> : null}
          </div>
        </div>
      </div>
      <AgarathiGateModal
        entries={dictionaryEntries}
        locale={locale}
        open={agarathiModalOpen}
        onClose={() => setAgarathiModalOpen(false)}
      />
    </header>
  );
}
