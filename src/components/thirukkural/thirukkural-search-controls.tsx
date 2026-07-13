"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { Locale } from "@/types";

type PracticeMode = "read" | "quiz" | "blanks" | "reconstruct";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className="h-4 w-4" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

export function ThirukkuralSearchControls({
  locale,
  initialQuery,
  section,
  mode,
  searchLabel,
}: {
  locale: Locale;
  initialQuery: string;
  section: string;
  mode: PracticeMode;
  searchLabel: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();

  function updateSearch(value: string) {
    setQuery(value);

    const params = new URLSearchParams();
    if (value) params.set("q", value);
    if (section) params.set("section", section);
    if (mode !== "read") params.set("mode", mode);

    const queryString = params.toString();
    startTransition(() => {
      router.replace(`/${locale}/thirukkural${queryString ? `?${queryString}` : ""}`, { scroll: false });
    });
  }

  return (
    <div className="max-w-[420px]">
      <label
        className={`flex min-w-0 items-center gap-2.5 rounded-full border-[3px] bg-white px-[18px] text-[#9A8CB0] shadow-[4px_4px_0_#1A0B2E] transition focus-within:-translate-y-0.5 ${
          isPending ? "border-[#7C3AED]" : "border-[#1A0B2E]"
        }`}
      >
        <SearchIcon />
        <span className="sr-only">{searchLabel}</span>
        <input
          type="search"
          value={query}
          onChange={(event) => updateSearch(event.target.value)}
          placeholder={searchLabel}
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent py-3 font-tamil text-[13px] text-[#1A0B2E] outline-none placeholder:text-[#B7ABC4] lg:py-2"
        />
        <span
          className={`h-2 w-2 shrink-0 rounded-full bg-[#7C3AED] transition-opacity ${isPending ? "opacity-100" : "opacity-0"}`}
          aria-hidden="true"
        />
      </label>

    </div>
  );
}
