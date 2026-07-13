"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { isAgarathiDailyQuizComplete } from "@/lib/agarathi-daily";
import { cn } from "@/lib/utils";
import type { DictionaryEntry, Locale } from "@/types";

import { LogoutButton } from "../auth/logout-button";
import { LanguageSwitcher } from "../navigation/language-switcher";
import { BrandMark } from "./brand-mark";

const AgarathiGateModal = dynamic(
  () => import("../dictionary/agarathi-gate-modal").then((module) => module.AgarathiGateModal),
  { ssr: false },
);

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
  { href: "/word-hunt", key: "wordHunt" },
  { href: "/kural-vettai", key: "kuralVettai" },
] as const;

const literatureItems = [
  { href: "/kathaigal", key: "kathaigal" },
  { href: "/thirukkural", key: "thirukkural" },
] as const;

type HeaderCopy = {
  login: string;
  menu: string;
  agarathi: string;
  nav: Record<(typeof navItems)[number]["key"], string>;
  games: Record<(typeof gameItems)[number]["key"], string>;
  literature: Record<(typeof literatureItems)[number]["key"], string>;
  dropdown: {
    learning: string;
    games: string;
    literature: string;
    learningEyebrow: string;
    learningEmpty: string;
    learningHint: string;
    gamesEyebrow: string;
    gamesHint: string;
    gamesListTitle: string;
    gameDescriptions: Record<(typeof gameItems)[number]["key"], string>;
    literatureEyebrow: string;
    literatureHint: string;
    literatureListTitle: string;
    literatureDescriptions: Record<(typeof literatureItems)[number]["key"], string>;
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
      wordHunt: "Word Hunt",
      kuralVettai: "Kural Vettai",
    },
    literature: {
      kathaigal: "Kathaigal",
      thirukkural: "Thirukkural",
    },
    dropdown: {
      learning: "Learning",
      games: "Nimisham",
      literature: "Ilakiyam",
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
        wordHunt: "Timed word tapping by category.",
        kuralVettai: "Memorize and rebuild 10 kurals against the clock.",
      },
      literatureEyebrow: "Tamil literature",
      literatureHint: "Read illustrated Tamil stories and literary practice pages.",
      literatureListTitle: "Stories",
      literatureDescriptions: {
        kathaigal: "Tamil stories with images after every paragraph.",
        thirukkural: "Learn kurals with porul, quiz and fill-in practice.",
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
      wordHunt: "Chasse aux mots",
      kuralVettai: "Kural Vettai",
    },
    literature: {
      kathaigal: "Kathaigal",
      thirukkural: "Thirukkural",
    },
    dropdown: {
      learning: "Learning",
      games: "Nimisham",
      literature: "Ilakiyam",
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
        wordHunt: "Course contre la montre avec mots tamouls.",
        kuralVettai: "Mémorisez puis reconstituez 10 kurals contre la montre.",
      },
      literatureEyebrow: "Littérature tamoule",
      literatureHint: "Lis des histoires illustrées en tamoul et des pages littéraires.",
      literatureListTitle: "Histoires",
      literatureDescriptions: {
        kathaigal: "Histoires tamoules avec une image après chaque paragraphe.",
        thirukkural: "Apprendre les kurals avec porul, quiz et textes à trous.",
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
      wordHunt: "சொல் வேட்டை",
      kuralVettai: "குறள் வேட்டை",
    },
    literature: {
      kathaigal: "கதைகள்",
      thirukkural: "திருக்குறள்",
    },
    dropdown: {
      learning: "கற்றல்",
      games: "Nimisham",
      literature: "இலக்கியம்",
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
        wordHunt: "நேரத்துக்கு எதிராக சரியான சொற்களைத் தேர்வு செய்யுங்கள்.",
        kuralVettai: "10 குறள்களை மனப்பாடம் செய்து நேரத்திற்குள் மீண்டும் அமைக்கவும்.",
      },
      literatureEyebrow: "தமிழ் இலக்கியம்",
      literatureHint: "படங்களுடன் தமிழ் கதைகள் மற்றும் இலக்கியப் பயிற்சிகளை வாசிக்கவும்.",
      literatureListTitle: "கதைகள்",
      literatureDescriptions: {
        kathaigal: "ஒவ்வொரு பத்தியின் பின்னரும் படங்களுடன் தமிழ் கதைகள்.",
        thirukkural: "பொருள், வினா, இடைவெளி நிரப்புதலுடன் குறளை கற்போம்.",
      },
      newBadge: "புதியது",
      currentPage: "நடப்பு பக்கம்",
    },
  },
};

type DesktopDropdown = "learning" | "games" | "literature" | null;

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
    <header className="sticky top-0 z-50 border-b-[3px] border-[#180d2b] bg-[#fbf1e2] xl:bg-[#fbf1e2]/95 xl:backdrop-blur-xl">
      <div
        ref={rootRef}
        className="relative mx-auto flex min-h-[72px] w-full max-w-[120rem] items-center gap-3 px-4 sm:min-h-[88px] sm:gap-5 sm:px-6 xl:px-8"
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

          <div
            className="relative"
            onMouseEnter={() => setDesktopDropdown("literature")}
            onMouseLeave={() => setDesktopDropdown((current) => (current === "literature" ? null : current))}
          >
            <button
              type="button"
              onClick={() => setDesktopDropdown((current) => (current === "literature" ? null : "literature"))}
              className={cn(
                "flex items-center gap-2 rounded-full border-2 border-transparent px-4 py-2 text-[0.98rem] text-[#180d2b] transition hover:-translate-y-0.5 hover:border-[#180d2b] hover:bg-[#eee5ff] hover:shadow-[2px_3px_0_#180d2b]",
                desktopDropdown === "literature" && "border-[#180d2b] bg-[#eee5ff] shadow-[2px_3px_0_#180d2b]",
                navTextClass(isTamil),
              )}
            >
              <span>{copy.dropdown.literature}</span>
              <span className={cn("text-xs transition", desktopDropdown === "literature" && "rotate-180")}>⌃</span>
            </button>

            {desktopDropdown === "literature" ? (
              <div className="absolute left-1/2 top-full z-50 w-[44rem] max-w-[calc(100vw-4rem)] -translate-x-1/2 pt-4">
                <div className="overflow-hidden rounded-[1.35rem] border-[3px] border-[#180d2b] bg-white shadow-[7px_8px_0_#180d2b]">
                  <div className="grid gap-0 md:grid-cols-[0.82fr_1.18fr]">
                    <div className="border-r-[3px] border-[#180d2b] bg-[#eee5ff] px-7 py-7">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7c3aed]">
                        {copy.dropdown.literatureEyebrow}
                      </p>
                      <p className="mt-5 max-w-sm text-[1.55rem] font-black leading-tight tracking-[-0.02em] text-[#180d2b]">
                        {copy.dropdown.literature}
                      </p>
                      <p className="mt-4 max-w-sm text-sm font-semibold leading-7 text-[#6f587f]">{copy.dropdown.literatureHint}</p>
                    </div>
                    <div className="px-7 py-7">
                      <p className="mb-4 text-xs font-black uppercase tracking-[0.24em] text-[#8a6a9c]">
                        {copy.dropdown.literatureListTitle}
                      </p>
                      <div className="grid gap-3">
                        {literatureItems.map((item, index) => {
                          const targetHref = `/${locale}${item.href}`;
                          const isCurrentPage = pathname === targetHref;

                          return (
                            <Link
                              key={item.href}
                              href={targetHref}
                              onClick={() => setDesktopDropdown(null)}
                              className={cn(
                                "group flex items-start justify-between gap-4 rounded-[1rem] border-[3px] border-[#180d2b] px-5 py-4 shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5",
                                isCurrentPage ? "bg-[#eee5ff]" : "bg-[#fff8ec] hover:bg-white",
                              )}
                            >
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#180d2b] bg-[#7c3aed] text-sm font-black text-white">
                                    {index + 1}
                                  </span>
                                  <h3 className="text-lg font-black text-[#180d2b] transition group-hover:text-[#7c3aed]">
                                    {copy.literature[item.key]}
                                  </h3>
                                </div>
                                <p className="mt-3 pl-12 text-sm font-semibold leading-6 text-[#6f587f]">
                                  {copy.dropdown.literatureDescriptions[item.key]}
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
            "ml-auto rounded-full border-[3px] border-[#180d2b] bg-white px-4 py-2 text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#ffc43d] xl:hidden",
            isTamil ? "text-[0.98rem] font-black tracking-[0.01em]" : "text-sm font-black",
          )}
          onClick={() => setOpen((value) => !value)}
        >
          {copy.menu}
        </button>
      </div>

      <div className={cn("max-h-[calc(100dvh-72px)] overflow-y-auto overscroll-contain border-t-[3px] border-[#180d2b] bg-[#fbf1e2] sm:max-h-[calc(100dvh-88px)] xl:hidden", open ? "block" : "hidden")}>
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

          <div className="mt-2 rounded-[1rem] border-[3px] border-[#180d2b] bg-[#eee5ff] px-4 py-3 shadow-[3px_4px_0_#180d2b]">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#7c3aed]">
              {copy.dropdown.literature}
            </p>
            <div className="mt-2 flex flex-col gap-1">
              {literatureItems.map((item) => (
                <Link
                  key={item.href}
                  href={`/${locale}${item.href}`}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[#180d2b] transition hover:bg-white",
                    isTamil ? "text-[0.98rem] font-black tracking-[0.01em]" : "text-sm font-black",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {copy.literature[item.key]}
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
      {agarathiModalOpen ? (
        <AgarathiGateModal
          entries={dictionaryEntries}
          locale={locale}
          open
          onClose={() => setAgarathiModalOpen(false)}
        />
      ) : null}
    </header>
  );
}
