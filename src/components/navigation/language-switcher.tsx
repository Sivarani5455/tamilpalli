"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localeLabels, locales } from "@/lib/constants";
import type { Locale } from "@/types";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const withoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/35 bg-white/80 p-1.5 shadow-[0_16px_40px_-28px_rgba(17,25,53,0.55)] backdrop-blur">
      {locales.map((option) => (
        <Link
          key={option}
          href={`/${option}${withoutLocale === "/" ? "" : withoutLocale}`}
          className={`rounded-full px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] transition ${
            option === locale
              ? "bg-gradient-to-r from-[#14c8a3] to-[#4f62ff] text-white"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          {localeLabels[option]}
        </Link>
      ))}
    </div>
  );
}
