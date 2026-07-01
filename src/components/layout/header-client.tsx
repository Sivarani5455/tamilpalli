"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";
import type { Locale } from "@/types";

import { LogoutButton } from "../auth/logout-button";
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
      },
      newBadge: "புதியது",
      currentPage: "நடப்பு பக்கம்",
    },
  },
};

type DesktopDropdown = "learning" | "games" | null;

function navTextClass(isTamil: boolean) {
  return isTamil ? "font-medium tracking-[0.01em]" : "font-medium";
}

export function HeaderClient({
  locale,
  isLoggedIn,
}: {
  locale: Locale;
  isLoggedIn: boolean;
}) {
  const pathname = usePathname();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState<DesktopDropdown>(null);
  const copy = headerCopy[locale];
  const isTamil = locale === "ta";

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
    <header className="sticky top-0 z-50 border-b border-[rgba(185,121,63,0.22)] bg-[#fff7ea]/92 backdrop-blur-xl">
      <div
        ref={rootRef}
        className="relative mx-auto flex min-h-[86px] w-full max-w-[120rem] items-center gap-5 px-4 sm:px-6 xl:px-8"
      >
        <Link href={`/${locale}`} className="shrink-0">
          <BrandMark compact />
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 xl:flex">
          <Link
            href={`/${locale}`}
            className={cn(
              "rounded-xl px-4 py-2 text-[0.98rem] text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
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
                "flex items-center gap-2 rounded-xl px-4 py-2 text-[0.98rem] text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
                desktopDropdown === "learning" && "bg-[#f4dfb6] text-[#2a1a11]",
                navTextClass(isTamil),
              )}
            >
              <span>{copy.dropdown.learning}</span>
              <span className={cn("text-xs transition", desktopDropdown === "learning" && "rotate-180")}>⌃</span>
            </button>

            {desktopDropdown === "learning" ? (
              <div className="absolute left-1/2 top-full z-50 w-[40rem] max-w-[calc(100vw-4rem)] -translate-x-1/2 pt-4">
                <div className="overflow-hidden rounded-[1.6rem] border border-[rgba(185,121,63,0.22)] bg-[#fff8ec] shadow-[0_30px_70px_-42px_rgba(74,51,36,0.38)]">
                  <div className="bg-[#f4dfb6]/45 px-7 py-7">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a6a4c]">
                      {copy.dropdown.learningEyebrow}
                    </p>
                    <p className="mt-5 max-w-sm text-[1.55rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--brand-ink)]">
                      {copy.dropdown.learningEmpty}
                    </p>
                    <p className="mt-4 max-w-sm text-sm leading-7 text-[#6f553d]">{copy.dropdown.learningHint}</p>
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
                "flex items-center gap-2 rounded-xl px-4 py-2 text-[0.98rem] text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
                desktopDropdown === "games" && "bg-[#f4dfb6] text-[#2a1a11]",
                navTextClass(isTamil),
              )}
            >
              <span>{copy.dropdown.games}</span>
              <span className={cn("text-xs transition", desktopDropdown === "games" && "rotate-180")}>⌃</span>
            </button>

            {desktopDropdown === "games" ? (
              <div className="absolute left-1/2 top-full z-50 w-[56rem] max-w-[calc(100vw-4rem)] -translate-x-1/2 pt-4">
                <div className="overflow-hidden rounded-[1.6rem] border border-[rgba(185,121,63,0.22)] bg-[#fff8ec] shadow-[0_30px_70px_-42px_rgba(74,51,36,0.38)]">
                  <div className="grid gap-0 md:grid-cols-[0.78fr_1.22fr]">
                    <div className="border-r border-[rgba(185,121,63,0.16)] bg-[#f4dfb6]/45 px-7 py-7">
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a6a4c]">
                        {copy.dropdown.gamesEyebrow}
                      </p>
                      <p className="mt-5 max-w-sm text-[1.55rem] font-semibold leading-tight tracking-[-0.02em] text-[var(--brand-ink)]">
                        {copy.dropdown.games}
                      </p>
                      <p className="mt-4 max-w-sm text-sm leading-7 text-[#6f553d]">{copy.dropdown.gamesHint}</p>
                    </div>

                    <div className="px-7 py-7">
                      <div className="mb-4 flex items-center justify-between gap-4">
                        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a6a4c]">
                          {copy.dropdown.gamesListTitle}
                        </p>
                        <span className="rounded-full bg-[#f4dfb6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a2e]">
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
                                "group flex items-start justify-between gap-4 rounded-[1.15rem] border px-5 py-4 transition",
                                isCurrentPage
                                  ? "border-[#d3a238] bg-[#fff7ea]"
                                  : "border-[rgba(185,121,63,0.18)] bg-[#fffdf8] hover:border-[#d3a238] hover:bg-[#fff7ea]",
                              )}
                            >
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f4dfb6] text-sm font-semibold text-[#8a5a2e]">
                                    {index + 1}
                                  </span>
                                  <h3 className="text-lg font-semibold text-[var(--brand-ink)] transition group-hover:text-[#8a5a2e]">
                                    {copy.games[gameItem.key]}
                                  </h3>
                                  {isCurrentPage ? (
                                    <span className="rounded-full bg-[#f4dfb6] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a5a2e]">
                                      {copy.dropdown.currentPage}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-3 pl-12 text-sm leading-6 text-[#6f553d]">
                                  {copy.dropdown.gameDescriptions[gameItem.key]}
                                </p>
                              </div>
                              <span className="pt-2 text-[#b9793f]/45 transition group-hover:text-[#8a5a2e]">→</span>
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

          <Link
            href={`/${locale}/agarathi`}
            className={cn(
              "rounded-xl px-4 py-2 text-[0.98rem] text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
              pathname === `/${locale}/agarathi` && "bg-[#f4dfb6] text-[#2a1a11]",
              navTextClass(isTamil),
            )}
          >
            {copy.agarathi}
          </Link>

          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "rounded-xl px-4 py-2 text-[0.98rem] text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
                pathname === `/${locale}${item.href}` && "bg-[#f4dfb6] text-[#2a1a11]",
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
                "rounded-xl px-4 py-2 text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
                isTamil ? "text-[0.98rem] font-medium tracking-[0.01em]" : "text-[0.98rem] font-medium",
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
            "ml-auto rounded-xl border border-[rgba(185,121,63,0.22)] bg-[#fff8ec] px-4 py-2 text-[#654632] shadow-sm transition hover:bg-[#f4dfb6] lg:hidden",
            isTamil ? "text-[0.98rem] font-medium tracking-[0.01em]" : "text-sm font-medium",
          )}
          onClick={() => setOpen((value) => !value)}
        >
          {copy.menu}
        </button>
      </div>

      <div className={cn("border-t border-[rgba(185,121,63,0.18)] bg-[#fff7ea]/98 lg:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto flex max-w-[120rem] flex-col gap-1 px-4 py-4 sm:px-6">
          <Link
            href={`/${locale}`}
            className={cn(
              "rounded-xl px-4 py-3 text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
              isTamil ? "text-[1rem] font-medium tracking-[0.01em]" : "text-sm font-medium",
            )}
            onClick={() => setOpen(false)}
          >
            {copy.nav.home}
          </Link>

          <div className="mt-2 rounded-xl border border-[rgba(185,121,63,0.18)] bg-[#f4dfb6]/45 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a6a4c]">
              {copy.dropdown.learningEyebrow}
            </p>
            <p className="mt-2 text-sm leading-6 text-[#6f553d]">{copy.dropdown.learningEmpty}</p>
          </div>

          <div className="mt-2 rounded-xl border border-[rgba(185,121,63,0.18)] bg-[#f4dfb6]/45 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#8a6a4c]">
              {copy.dropdown.gamesEyebrow}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {gameItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[#654632] transition hover:bg-[#fff8ec] hover:text-[#2a1a11]",
                    isTamil ? "text-[0.98rem] font-medium tracking-[0.01em]" : "text-sm font-medium",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {copy.games[item.key]}
                </Link>
              ))}
            </div>
          </div>

          <Link
            href={`/${locale}/agarathi`}
            className={cn(
              "mt-2 rounded-xl px-4 py-3 text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
              isTamil ? "text-[1rem] font-medium tracking-[0.01em]" : "text-sm font-medium",
            )}
            onClick={() => setOpen(false)}
          >
            {copy.agarathi}
          </Link>

          {navItems.slice(1).map((item) => (
            <Link
              key={item.href}
              href={`/${locale}${item.href}`}
              className={cn(
                "rounded-xl px-4 py-3 text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
                isTamil ? "text-[1rem] font-medium tracking-[0.01em]" : "text-sm font-medium",
              )}
              onClick={() => setOpen(false)}
            >
              {copy.nav[item.key]}
            </Link>
          ))}

          <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-[rgba(185,121,63,0.18)] pt-3">
            {!isLoggedIn ? (
              <Link
                href={`/${locale}/auth/login`}
                className={cn(
                  "rounded-xl px-4 py-2 text-[#654632] transition hover:bg-[#f4dfb6] hover:text-[#2a1a11]",
                  isTamil ? "text-[0.98rem] font-medium tracking-[0.01em]" : "text-sm font-medium",
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
    </header>
  );
}
