"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { isAgarathiDailyQuizComplete } from "@/lib/agarathi-daily";
import { appName, localeLabels, locales } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { DictionaryEntry, Locale } from "@/types";

import { LogoutButton } from "../auth/logout-button";
import { LanguageSwitcher } from "../navigation/language-switcher";

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

const gameItemIcons: Record<(typeof gameItems)[number]["key"], MobileNavIconKind> = {
  wordSearch: "search",
  fillBlanks: "fill",
  imageHunt: "image",
  wordHunt: "letters",
  kuralVettai: "target",
};

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

function MobileFlameIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13.5 3.5c.5 3-1.8 4.2-1.8 6.4 0 1.1.7 1.9 1.7 1.9 1.4 0 2.3-1.3 2.1-3.1 1.8 1.6 3 3.7 3 6a6.5 6.5 0 0 1-13 0c0-3.6 2-6.7 5.4-9-.2 2.3.5 3.6 1.5 4.1-.2-2.1.1-4.3 1.1-6.3Z" />
    </svg>
  );
}

function MobileBellIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  );
}

function MobileSearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </svg>
  );
}

function MobileMenuIcon({ open }: { open: boolean }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M7 8h10" />
          <path d="M7 12h10" />
          <path d="M7 16h10" />
        </>
      )}
    </svg>
  );
}

type MobileNavIconKind = "home" | "target" | "search" | "fill" | "image" | "letters" | "books" | "book" | "tag" | "grid" | "shield";

function MobileNavIcon({ kind }: { kind: MobileNavIconKind }) {
  const common = "h-4 w-4 shrink-0";

  if (kind === "home") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m4 11 8-7 8 7" /><path d="M6.5 10v10h11V10" /><path d="M10 20v-6h4v6" /></svg>;
  }

  if (kind === "target") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="1" /></svg>;
  }

  if (kind === "search") {
    return <MobileSearchIcon />;
  }

  if (kind === "fill") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M7 5H4v14h3" /><path d="M17 5h3v14h-3" /><path d="M9 9h6" /><path d="M9 15h6" /></svg>;
  }

  if (kind === "image") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="9" r="1.5" /><path d="m5 18 5-5 3 3 2-2 4 4" /></svg>;
  }

  if (kind === "letters") {
    return <span aria-hidden="true" className="w-4 shrink-0 text-center font-mono text-[9px] font-black">Abc</span>;
  }

  if (kind === "books" || kind === "book") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h6a2 2 0 0 1 2 2v12a2 2 0 0 0-2-2H4Z" /><path d="M20 5h-6a2 2 0 0 0-2 2v12a2 2 0 0 1 2-2h6Z" /></svg>;
  }

  if (kind === "tag") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 13 13 20 4 11V4h7Z" /><circle cx="8.5" cy="8.5" r="1" /></svg>;
  }

  if (kind === "grid") {
    return <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" className={common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6Z" /><path d="m9 12 2 2 4-4" /></svg>;
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
  const [mobileMenuSection, setMobileMenuSection] = useState<"games" | "literature" | null>("games");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState("");
  const [streakDays, setStreakDays] = useState(1);
  const [agarathiModalOpen, setAgarathiModalOpen] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState<DesktopDropdown>(null);
  const copy = headerCopy[locale];
  const isTamil = locale === "ta";
  const mobileLabels =
    locale === "fr"
      ? { streak: "jours consécutifs", notifications: "Notifications", search: "Rechercher", placeholder: "Rechercher un contenu…", noResults: "Aucun contenu trouvé" }
      : locale === "ta"
        ? { streak: "தொடர்ச்சியான நாட்கள்", notifications: "அறிவிப்புகள்", search: "தேடல்", placeholder: "உள்ளடக்கத்தைத் தேடுங்கள்…", noResults: "உள்ளடக்கம் இல்லை" }
        : { streak: "day streak", notifications: "Notifications", search: "Search", placeholder: "Search content…", noResults: "No content found" };
  const mobileMenuLabels =
    locale === "fr"
      ? { heading: "Apprendre le tamoul", learning: "Parcours d’apprentissage", soon: "Bientôt disponibles ici.", games: "Mini-jeux", literature: "Littérature", quick: "Accès rapide" }
      : locale === "ta"
        ? { heading: "தமிழ்க் கற்றல்", learning: "கற்றல் பாதைகள்", soon: "விரைவில் இங்கே கிடைக்கும்.", games: "சிறு விளையாட்டுகள்", literature: "இலக்கியம்", quick: "விரைவு அணுகல்" }
        : { heading: "Learn Tamil", learning: "Learning paths", soon: "Available here soon.", games: "Mini-games", literature: "Literature", quick: "Quick access" };
  const mobileSearchItems = [
    { href: "", label: copy.nav.home },
    ...gameItems.map((item) => ({ href: item.href, label: copy.games[item.key] })),
    ...literatureItems.map((item) => ({ href: item.href, label: copy.literature[item.key] })),
    { href: "/agarathi", label: copy.agarathi },
    { href: "/pricing", label: copy.nav.pricing },
    ...(isLoggedIn ? [{ href: "/dashboard", label: copy.nav.dashboard }] : []),
  ];
  const normalizedMobileSearch = mobileSearchQuery.trim().toLocaleLowerCase(locale);
  const mobileSearchResults = normalizedMobileSearch
    ? mobileSearchItems.filter((item) => item.label.toLocaleLowerCase(locale).includes(normalizedMobileSearch))
    : [];

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
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const storageKey = "kalvikoodam-daily-streak";
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    let count = 1;

    try {
      const saved = JSON.parse(window.localStorage.getItem(storageKey) ?? "null") as { count?: number; lastVisit?: string } | null;
      count = Math.max(1, Number(saved?.count) || 1);

      if (saved?.lastVisit && saved.lastVisit !== today) {
        const [year, month, day] = saved.lastVisit.split("-").map(Number);
        const lastVisitDay = Date.UTC(year, month - 1, day) / 86_400_000;
        const todayDay = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000;
        count = todayDay - lastVisitDay === 1 ? count + 1 : 1;
      }

      window.localStorage.setItem(storageKey, JSON.stringify({ count, lastVisit: today }));
    } catch {}

    const frame = window.requestAnimationFrame(() => setStreakDays(count));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-[#180d2b]/15 bg-[#fbf1e2]/95 backdrop-blur-xl">
      <div
        ref={rootRef}
        className="relative mx-auto flex min-h-[64px] w-full max-w-[120rem] items-center gap-3 px-2 sm:min-h-[72px] sm:px-6 xl:min-h-[62px] xl:gap-2 xl:px-8"
      >
        <div className="mx-auto flex w-full max-w-[48rem] items-center gap-1 rounded-[1.1rem] border border-white/80 bg-white/70 p-1.5 shadow-[0_8px_24px_-18px_rgba(24,13,43,0.7)] backdrop-blur-xl sm:gap-2 sm:p-2 xl:hidden">
          <Link href={`/${locale}`} className="flex min-w-0 flex-1 items-center gap-1.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-[#180d2b] bg-[#ffc43d] font-tamil text-base font-black leading-none text-[#180d2b] sm:h-9 sm:w-9 sm:text-lg">
              அ
            </span>
            <span className="truncate font-display text-[0.82rem] font-black leading-none text-[#180d2b] sm:text-base">{appName}</span>
          </Link>

          <div className="flex shrink-0 items-center gap-1">
            <span
              className="inline-flex h-8 items-center gap-1 rounded-full bg-[#241a13] px-2 text-[0.72rem] font-black tabular-nums text-[#ffc43d]"
              aria-label={`${streakDays} ${mobileLabels.streak}`}
              title={`${streakDays} ${mobileLabels.streak}`}
            >
              <MobileFlameIcon />
              {streakDays}
            </span>

            <Link
              href={`/${locale}/dashboard`}
              className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#180d2b]/10 bg-[#fffaf0] text-[#180d2b] transition hover:bg-white"
              aria-label={mobileLabels.notifications}
              onClick={() => setOpen(false)}
            >
              <MobileBellIcon />
              <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#ef4444] ring-1 ring-white" />
            </Link>

            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#180d2b]/10 bg-[#fffaf0] text-[#180d2b] transition hover:bg-white"
              aria-label={mobileLabels.search}
              aria-expanded={mobileSearchOpen}
              onClick={() => {
                setOpen(false);
                setMobileSearchOpen((current) => !current);
              }}
            >
              <MobileSearchIcon />
            </button>
          </div>

          <button
            type="button"
            className="ml-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#211936] text-white transition hover:bg-[#30234c]"
            aria-label={copy.menu}
            aria-expanded={open}
            onClick={() => {
              setMobileSearchOpen(false);
              setOpen((value) => !value);
            }}
          >
            <MobileMenuIcon open={open} />
          </button>
        </div>

        <Link href={`/${locale}`} className="hidden shrink-0 items-center gap-2 xl:flex" onClick={() => setDesktopDropdown(null)}>
          <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#180d2b] bg-[#ffc43d] font-tamil text-base font-black leading-none text-[#180d2b]">
            அ
          </span>
          <span className="font-display text-sm font-black leading-none text-[#180d2b]">{appName}</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-start gap-1 xl:flex">
          <Link
            href={`/${locale}`}
            className={cn(
              "rounded-lg px-3 py-2 text-sm text-[#180d2b] transition hover:bg-white/75",
              pathname === `/${locale}` && "bg-white/75",
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
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#180d2b] transition hover:bg-white/75",
                desktopDropdown === "learning" && "bg-white/75",
                navTextClass(isTamil),
              )}
            >
              <span>{copy.dropdown.learning}</span>
              <span className={cn("text-[10px] transition", desktopDropdown === "learning" && "rotate-180")}>⌄</span>
            </button>

            {desktopDropdown === "learning" ? (
              <div className="absolute left-0 top-full z-50 w-80 pt-2">
                <div className="overflow-hidden rounded-xl border border-[#180d2b]/15 bg-[#fffaf0]/98 shadow-[0_18px_45px_-24px_rgba(24,13,43,0.65)] backdrop-blur-xl">
                  <div className="px-4 py-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a9c]">
                      {copy.dropdown.learningEyebrow}
                    </p>
                    <p className="mt-2 text-sm font-black leading-5 text-[#180d2b]">
                      {copy.dropdown.learningEmpty}
                    </p>
                    <p className="mt-1.5 text-xs font-medium leading-5 text-[#6f587f]">{copy.dropdown.learningHint}</p>
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
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#180d2b] transition hover:bg-white/75",
                desktopDropdown === "games" && "bg-white/75",
                navTextClass(isTamil),
              )}
            >
              <span>{copy.dropdown.games}</span>
              <span className={cn("text-[10px] transition", desktopDropdown === "games" && "rotate-180")}>⌄</span>
            </button>

            {desktopDropdown === "games" ? (
              <div className="absolute left-0 top-full z-50 w-[42rem] max-w-[calc(100vw-4rem)] pt-2">
                <div className="overflow-hidden rounded-xl border border-[#180d2b]/15 bg-[#fffaf0]/98 shadow-[0_18px_45px_-24px_rgba(24,13,43,0.65)] backdrop-blur-xl">
                  <div className="grid gap-0 md:grid-cols-[0.72fr_1.28fr]">
                    <div className="border-r border-[#180d2b]/10 bg-[#fff2cf]/70 px-5 py-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#c97800]">
                        {copy.dropdown.gamesEyebrow}
                      </p>
                      <p className="mt-2 text-lg font-black leading-tight text-[#180d2b]">
                        {copy.dropdown.games}
                      </p>
                      <p className="mt-2 text-xs font-medium leading-5 text-[#6f587f]">{copy.dropdown.gamesHint}</p>
                    </div>

                    <div className="px-3 py-3">
                      <div className="mb-1 flex items-center justify-between gap-4 px-2 py-1">
                        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a9c]">
                          {copy.dropdown.gamesListTitle}
                        </p>
                        <span className="rounded-full bg-[#ffc43d] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-[#180d2b]">
                          {copy.dropdown.newBadge}
                        </span>
                      </div>

                      <div className="grid gap-1">
                        {gameItems.map((gameItem, index) => {
                          const targetHref = `/${locale}${gameItem.href}`;
                          const isCurrentPage = pathname === targetHref;

                          return (
                            <Link
                              key={gameItem.href}
                              href={targetHref}
                              onClick={() => setDesktopDropdown(null)}
                              className={cn(
                                "group flex items-start justify-between gap-3 rounded-lg border px-3 py-2 transition",
                                isCurrentPage
                                  ? "border-[#7c3aed]/25 bg-[#eee5ff]"
                                  : "border-transparent bg-transparent hover:bg-white",
                              )}
                            >
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#20bf73] text-[10px] font-black text-white">
                                    {index + 1}
                                  </span>
                                  <h3 className="text-sm font-black text-[#180d2b] transition group-hover:text-[#7c3aed]">
                                    {copy.games[gameItem.key]}
                                  </h3>
                                  {isCurrentPage ? (
                                    <span className="rounded-full bg-[#ffc43d] px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.1em] text-[#180d2b]">
                                      {copy.dropdown.currentPage}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-0.5 pl-9 text-[10px] font-medium leading-4 text-[#6f587f]">
                                  {copy.dropdown.gameDescriptions[gameItem.key]}
                                </p>
                              </div>
                              <span className="pt-1 text-sm text-[#7c3aed] transition group-hover:translate-x-0.5">→</span>
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
                "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm text-[#180d2b] transition hover:bg-white/75",
                desktopDropdown === "literature" && "bg-white/75",
                navTextClass(isTamil),
              )}
            >
              <span>{copy.dropdown.literature}</span>
              <span className={cn("text-[10px] transition", desktopDropdown === "literature" && "rotate-180")}>⌄</span>
            </button>

            {desktopDropdown === "literature" ? (
              <div className="absolute left-0 top-full z-50 w-[36rem] max-w-[calc(100vw-4rem)] pt-2">
                <div className="overflow-hidden rounded-xl border border-[#180d2b]/15 bg-[#fffaf0]/98 shadow-[0_18px_45px_-24px_rgba(24,13,43,0.65)] backdrop-blur-xl">
                  <div className="grid gap-0 md:grid-cols-[0.82fr_1.18fr]">
                    <div className="border-r border-[#180d2b]/10 bg-[#eee5ff]/70 px-5 py-5">
                      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                        {copy.dropdown.literatureEyebrow}
                      </p>
                      <p className="mt-2 text-lg font-black leading-tight text-[#180d2b]">
                        {copy.dropdown.literature}
                      </p>
                      <p className="mt-2 text-xs font-medium leading-5 text-[#6f587f]">{copy.dropdown.literatureHint}</p>
                    </div>
                    <div className="px-3 py-3">
                      <p className="mb-1 px-2 py-1 text-[10px] font-black uppercase tracking-[0.18em] text-[#8a6a9c]">
                        {copy.dropdown.literatureListTitle}
                      </p>
                      <div className="grid gap-1">
                        {literatureItems.map((item, index) => {
                          const targetHref = `/${locale}${item.href}`;
                          const isCurrentPage = pathname === targetHref;

                          return (
                            <Link
                              key={item.href}
                              href={targetHref}
                              onClick={() => setDesktopDropdown(null)}
                              className={cn(
                                "group flex items-start justify-between gap-3 rounded-lg border px-3 py-2 transition",
                                isCurrentPage ? "border-[#7c3aed]/25 bg-[#eee5ff]" : "border-transparent bg-transparent hover:bg-white",
                              )}
                            >
                              <div>
                                <div className="flex items-center gap-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#7c3aed] text-[10px] font-black text-white">
                                    {index + 1}
                                  </span>
                                  <h3 className="text-sm font-black text-[#180d2b] transition group-hover:text-[#7c3aed]">
                                    {copy.literature[item.key]}
                                  </h3>
                                </div>
                                <p className="mt-0.5 pl-9 text-[10px] font-medium leading-4 text-[#6f587f]">
                                  {copy.dropdown.literatureDescriptions[item.key]}
                                </p>
                              </div>
                              <span className="pt-1 text-sm text-[#7c3aed] transition group-hover:translate-x-0.5">→</span>
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
              "rounded-lg px-3 py-2 text-sm text-[#180d2b] transition hover:bg-white/75",
              pathname === `/${locale}/agarathi` && "bg-white/75",
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
                "rounded-lg px-3 py-2 text-sm text-[#180d2b] transition hover:bg-white/75",
                pathname === `/${locale}${item.href}` && "bg-white/75",
                navTextClass(isTamil),
              )}
            >
              {copy.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="ml-auto hidden shrink-0 items-center gap-2 xl:flex">
          <span
            className="inline-flex h-8 items-center gap-1 rounded-full bg-[#241a13] px-2.5 text-[0.72rem] font-black tabular-nums text-[#ffc43d]"
            aria-label={`${streakDays} ${mobileLabels.streak}`}
            title={`${streakDays} ${mobileLabels.streak}`}
          >
            <MobileFlameIcon />
            {streakDays}
          </span>

          <Link
            href={`/${locale}/dashboard`}
            className="relative inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#180d2b]/15 bg-white/75 text-[#180d2b] transition hover:bg-white"
            aria-label={mobileLabels.notifications}
            onClick={() => {
              setDesktopDropdown(null);
              setMobileSearchOpen(false);
            }}
          >
            <MobileBellIcon />
            <span className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-[#ef4444] ring-1 ring-white" />
          </Link>

          <div className="relative">
            <button
              type="button"
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#180d2b]/15 bg-white/75 text-[#180d2b] transition hover:bg-white"
              aria-label={mobileLabels.search}
              aria-expanded={mobileSearchOpen}
              onClick={() => {
                setDesktopDropdown(null);
                setMobileSearchOpen((current) => !current);
              }}
            >
              <MobileSearchIcon />
            </button>

            {mobileSearchOpen ? (
              <div className="absolute right-0 top-full z-50 w-80 pt-3">
                <div className="rounded-xl border border-[#180d2b]/15 bg-[#fffaf0]/98 p-2 shadow-[0_18px_45px_-24px_rgba(24,13,43,0.65)] backdrop-blur-xl">
                  <div className="flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-[#180d2b]">
                    <MobileSearchIcon />
                    <input
                      autoFocus
                      type="search"
                      value={mobileSearchQuery}
                      onChange={(event) => setMobileSearchQuery(event.target.value)}
                      placeholder={mobileLabels.placeholder}
                      className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#8a7d70]"
                    />
                  </div>

                  {normalizedMobileSearch ? (
                    <div className="mt-2 grid max-h-64 gap-1 overflow-y-auto">
                      {mobileSearchResults.length > 0 ? (
                        mobileSearchResults.map((item) => (
                          <Link
                            key={item.href || "home"}
                            href={`/${locale}${item.href}`}
                            className="rounded-lg px-3 py-2 text-sm font-black text-[#180d2b] transition hover:bg-white"
                            onClick={() => {
                              setMobileSearchOpen(false);
                              setMobileSearchQuery("");
                            }}
                          >
                            {item.label}
                          </Link>
                        ))
                      ) : (
                        <p className="px-3 py-2 text-sm font-semibold text-[#8a7d70]">{mobileLabels.noResults}</p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {!isLoggedIn ? (
            <Link
              href={`/${locale}/auth/login`}
              className={cn(
                "rounded-full border-2 border-[#180d2b] bg-white px-4 py-2 text-[#180d2b] shadow-[2px_2px_0_#180d2b] transition hover:bg-[#ffc43d]",
                isTamil ? "text-xs font-black tracking-[0.01em]" : "text-xs font-black",
              )}
            >
              {copy.login}
            </Link>
          ) : null}

          <LanguageSwitcher locale={locale} variant="header" />

          {isLoggedIn ? <LogoutButton locale={locale} variant="header" /> : null}
        </div>

        <button
          type="button"
          className={cn(
            "ml-auto hidden rounded-full border-[3px] border-[#180d2b] bg-white px-4 py-2 text-[#180d2b] shadow-[3px_4px_0_#180d2b] transition hover:-translate-y-0.5 hover:bg-[#ffc43d]",
            isTamil ? "text-[0.98rem] font-black tracking-[0.01em]" : "text-sm font-black",
          )}
          onClick={() => setOpen((value) => !value)}
        >
          {copy.menu}
        </button>
      </div>

      {mobileSearchOpen ? (
        <div className="px-2 pb-2 sm:px-6 xl:hidden">
          <div className="mx-auto max-w-[48rem] rounded-[1rem] border border-[#180d2b]/10 bg-white/85 p-2 shadow-[0_14px_30px_-22px_rgba(24,13,43,0.8)] backdrop-blur-xl">
            <div className="flex items-center gap-2 rounded-[0.75rem] bg-[#fffaf0] px-3 py-2 text-[#180d2b]">
              <MobileSearchIcon />
              <input
                autoFocus
                type="search"
                value={mobileSearchQuery}
                onChange={(event) => setMobileSearchQuery(event.target.value)}
                placeholder={mobileLabels.placeholder}
                className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#8a7d70]"
              />
            </div>

            {normalizedMobileSearch ? (
              <div className="mt-2 grid max-h-52 gap-1 overflow-y-auto">
                {mobileSearchResults.length > 0 ? (
                  mobileSearchResults.map((item) => (
                    <Link
                      key={item.href || "home"}
                      href={`/${locale}${item.href}`}
                      className="rounded-[0.7rem] px-3 py-2 text-sm font-black text-[#180d2b] transition hover:bg-[#fff2cf]"
                      onClick={() => {
                        setMobileSearchOpen(false);
                        setMobileSearchQuery("");
                      }}
                    >
                      {item.label}
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-2 text-sm font-semibold text-[#8a7d70]">{mobileLabels.noResults}</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className={cn("max-h-[calc(100dvh-64px)] overflow-y-auto overscroll-contain border-t border-[#180d2b]/15 bg-[#fbf1e2] sm:max-h-[calc(100dvh-72px)] xl:hidden", open ? "block" : "hidden")}>
        <div className="mx-auto max-w-[48rem] px-2 py-2 sm:px-6 sm:py-3">
          <div className="rounded-[1rem] bg-[#f8e8c4] p-3 text-[#29231c] shadow-[0_16px_36px_-30px_rgba(41,35,28,0.9)] sm:p-4">
            <div className="flex items-center justify-between gap-3 px-1">
              <p className={`text-sm font-medium text-[#725a28] ${isTamil ? "font-tamil" : ""}`}>{mobileMenuLabels.heading}</p>
              <div className="flex items-center rounded-[0.55rem] bg-white p-0.5">
                {locales.map((option) => {
                  const withoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";
                  return (
                    <Link
                      key={option}
                      href={`/${option}${withoutLocale === "/" ? "" : withoutLocale}`}
                      className={`rounded-[0.45rem] px-2.5 py-2 text-[10px] font-bold transition ${
                        option === locale ? "bg-[#2f7fdf] text-white" : "text-[#8a7561] hover:bg-[#fff8ec]"
                      }`}
                      onClick={() => setOpen(false)}
                    >
                      {option === "en" ? "EN" : option === "fr" ? "FR" : localeLabels[option]}
                    </Link>
                  );
                })}
              </div>
            </div>

            <Link href={`/${locale}`} className="mt-3 flex items-center gap-2 rounded-[0.7rem] border border-[#dfd5c2] bg-white px-3 py-2.5 text-sm font-medium" onClick={() => setOpen(false)}>
              <span className="text-[#4f9bd8]"><MobileNavIcon kind="home" /></span>
              {copy.nav.home}
            </Link>

            <div className="mt-2 rounded-[0.7rem] border border-[#dfd5c2] bg-white px-3 py-2.5">
              <p className="text-xs font-medium">{mobileMenuLabels.learning}</p>
              <p className="mt-0.5 text-[10px] text-[#8a7561]">{mobileMenuLabels.soon}</p>
            </div>

            <div className="mt-3 overflow-hidden rounded-[0.7rem] border border-[#dfd5c2] bg-white">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-medium"
                aria-expanded={mobileMenuSection === "games"}
                onClick={() => setMobileMenuSection((current) => (current === "games" ? null : "games"))}
              >
                <MobileNavIcon kind="target" />
                <span className={isTamil ? "font-tamil" : ""}>{copy.dropdown.games}</span>
                <span className="text-[9px] text-[#a38f74]">{mobileMenuLabels.games}</span>
                <span className={`ml-auto transition ${mobileMenuSection === "games" ? "rotate-180" : ""}`}>⌄</span>
              </button>

              {mobileMenuSection === "games" ? (
                <div className="border-t border-[#eadfcb] bg-[#fff9ed] px-2 py-1.5">
                  {gameItems.map((item) => (
                    <Link key={item.href} href={`/${locale}${item.href}`} className="flex items-center gap-2 rounded-[0.55rem] px-2 py-2 text-xs font-medium transition hover:bg-white" onClick={() => setOpen(false)}>
                      <MobileNavIcon kind={gameItemIcons[item.key]} />
                      {copy.games[item.key]}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <div className="mt-2 overflow-hidden rounded-[0.7rem] border border-[#dfd5c2] bg-white">
              <button
                type="button"
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-xs font-medium"
                aria-expanded={mobileMenuSection === "literature"}
                onClick={() => setMobileMenuSection((current) => (current === "literature" ? null : "literature"))}
              >
                <MobileNavIcon kind="books" />
                <span className={isTamil ? "font-tamil" : ""}>{copy.dropdown.literature}</span>
                <span className="text-[9px] text-[#a38f74]">{mobileMenuLabels.literature}</span>
                <span className={`ml-auto transition ${mobileMenuSection === "literature" ? "rotate-180" : ""}`}>⌄</span>
              </button>

              {mobileMenuSection === "literature" ? (
                <div className="border-t border-[#eadfcb] bg-[#fff9ed] px-2 py-1.5">
                  {literatureItems.map((item) => (
                    <Link key={item.href} href={`/${locale}${item.href}`} className="flex items-center gap-2 rounded-[0.55rem] px-2 py-2 text-xs font-medium transition hover:bg-white" onClick={() => setOpen(false)}>
                      <MobileNavIcon kind="book" />
                      {copy.literature[item.key]}
                    </Link>
                  ))}
                </div>
              ) : null}
            </div>

            <p className="mb-1.5 mt-3 text-[10px] font-medium uppercase tracking-wide text-[#a38f74]">{mobileMenuLabels.quick}</p>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="flex items-center gap-2 rounded-[0.6rem] border border-[#dfd5c2] bg-white px-3 py-2 text-left text-xs font-medium" onClick={() => { setOpen(false); openAgarathiGate(); }}>
                <MobileNavIcon kind="book" /> {copy.agarathi}
              </button>
              <Link href={`/${locale}/pricing`} className="flex items-center gap-2 rounded-[0.6rem] border border-[#dfd5c2] bg-white px-3 py-2 text-xs font-medium" onClick={() => setOpen(false)}>
                <MobileNavIcon kind="tag" /> {copy.nav.pricing}
              </Link>
              <Link href={`/${locale}/dashboard`} className="flex items-center gap-2 rounded-[0.6rem] border border-[#dfd5c2] bg-white px-3 py-2 text-xs font-medium" onClick={() => setOpen(false)}>
                <MobileNavIcon kind="grid" /> {copy.nav.dashboard}
              </Link>
              <Link href={`/${locale}/admin`} className="flex items-center gap-2 rounded-[0.6rem] border border-[#dfd5c2] bg-white px-3 py-2 text-xs font-medium" onClick={() => setOpen(false)}>
                <MobileNavIcon kind="shield" /> {copy.nav.admin}
              </Link>
            </div>

            <div className="mt-3">
              {isLoggedIn ? (
                <LogoutButton locale={locale} variant="menu" />
              ) : (
                <Link href={`/${locale}/auth/login`} className="block rounded-[0.65rem] border border-white/55 px-3 py-2.5 text-center text-xs font-medium text-[#e65b59]" onClick={() => setOpen(false)}>
                  {copy.login}
                </Link>
              )}
            </div>
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
