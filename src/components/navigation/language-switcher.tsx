"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { localeLabels, locales } from "@/lib/constants";
import type { Locale } from "@/types";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const withoutLocale = pathname.replace(new RegExp(`^/${locale}`), "") || "/";

  return (
    <div className="flex items-center gap-1 rounded-full border-[3px] border-[#180d2b] bg-white p-1.5 shadow-[3px_4px_0_#180d2b]">
      {locales.map((option) => (
        <Link
          key={option}
          href={`/${option}${withoutLocale === "/" ? "" : withoutLocale}`}
          className={`rounded-full px-3 py-1.5 text-[11px] font-black tracking-[0.18em] transition ${
            option === locale
              ? "bg-[#ffc43d] text-[#180d2b]"
              : "text-[#6f587f] hover:bg-[#eee5ff] hover:text-[#180d2b]"
          }`}
        >
          {localeLabels[option]}
        </Link>
      ))}
    </div>
  );
}
