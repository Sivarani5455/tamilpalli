"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localeLabels, locales } from "@/lib/constants";
import type { Locale } from "@/types";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const withoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  return (
    <div className="flex items-center gap-1 rounded-full border border-[rgba(185,121,63,0.22)] bg-[#fff7ea]/85 p-1.5 shadow-[0_16px_40px_-28px_rgba(74,51,36,0.45)] backdrop-blur">
      {locales.map((option) => (
        <Link
          key={option}
          href={`/${option}${withoutLocale === "/" ? "" : withoutLocale}`}
          className={`rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] transition ${
            option === locale
              ? "bg-gradient-to-r from-[#b9793f] to-[#d3a238] text-[#fff8ec]"
              : "text-[#8a6a4c] hover:text-[#2a1a11]"
          }`}
        >
          {localeLabels[option]}
        </Link>
      ))}
    </div>
  );
}
