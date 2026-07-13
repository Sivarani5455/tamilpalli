"use client";

import { useActionState, useEffect, useState } from "react";

import { upsertThirukkuralAction } from "@/app/[locale]/admin/content-actions";
import { initialCrudState } from "@/lib/action-states";
import type { Locale, ThirukkuralLesson } from "@/types";

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createAdminSlug() {
  const date = new Date();
  const yyyymmdd = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("");
  const suffix =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 5)
      : Math.random().toString(36).slice(2, 7);

  return `thirukkural-${yyyymmdd}-${suffix.toLowerCase()}`;
}

export function ThirukkuralAdminForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial?: ThirukkuralLesson | null;
}) {
  const [state, action, pending] = useActionState(upsertThirukkuralAction, initialCrudState);
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  useEffect(() => {
    if (!initial?.slug && !slugTouched && slug.trim().length === 0) {
      const timeoutId = window.setTimeout(() => {
        setSlug((current) => current.trim() || createAdminSlug());
      }, 0);

      return () => window.clearTimeout(timeoutId);
    }
  }, [initial?.slug, slug, slugTouched]);

  const fieldClass = "block rounded-[1rem] border-[2px] border-[#180d2b] bg-white px-4 py-3 shadow-[3px_4px_0_#180d2b]";
  const labelClass = "block text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]";
  const inputClass = "mt-2 w-full bg-transparent text-sm font-semibold text-[#180d2b] outline-none placeholder:text-[#b49ac6]";

  return (
    <form action={action} className="mt-6 overflow-hidden rounded-[1.5rem] border-[3px] border-[#180d2b] bg-[#fff8ec] shadow-[7px_8px_0_#180d2b]">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" value={initial?.id ?? ""} />

      <section className="grid gap-4 border-b-[3px] border-[#180d2b] p-5 sm:p-6 md:grid-cols-2 xl:grid-cols-4">
        <label className={fieldClass}>
          <span className={labelClass}>Number</span>
          <input name="number" type="number" defaultValue={initial?.number ?? 1} className={`${inputClass} text-base font-black`} />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Title</span>
          <input name="title" defaultValue={initial?.title ?? ""} className={`${inputClass} font-tamil text-base font-black`} placeholder="அகர முதல..." />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Slug</span>
          <input
            name="slug"
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(slugify(event.target.value));
            }}
            className={`${inputClass} font-mono`}
          />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Difficulty</span>
          <select name="difficulty" defaultValue={initial?.difficulty ?? "beginner"} className={`${inputClass} text-base font-black`}>
            <option value="beginner">beginner</option>
            <option value="intermediate">intermediate</option>
            <option value="advanced">advanced</option>
          </select>
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Section</span>
          <input name="section" defaultValue={initial?.section ?? ""} className={inputClass} placeholder="அறத்துப்பால்" />
        </label>
        <label className={fieldClass}>
          <span className={labelClass}>Chapter</span>
          <input name="chapter" defaultValue={initial?.chapter ?? ""} className={inputClass} placeholder="கடவுள் வாழ்த்து" />
        </label>
        <label className={`${fieldClass} md:col-span-2`}>
          <span className={labelClass}>Kural lines</span>
          <textarea name="kuralLines" defaultValue={initial?.kuralLines.join("\n") ?? ""} rows={3} className={`${inputClass} font-tamil text-base leading-8`} placeholder="Line 1&#10;Line 2" />
        </label>
        <label className={`${fieldClass} md:col-span-2 xl:col-span-4`}>
          <span className={labelClass}>Porul</span>
          <textarea name="porul" defaultValue={initial?.porul ?? ""} rows={4} className={`${inputClass} font-tamil text-base leading-8`} />
        </label>
      </section>

      <section className="p-5 sm:p-6">
        <div className="rounded-[1rem] border-[2px] border-[#180d2b] bg-[#f1e9ff] p-4 shadow-[3px_4px_0_#180d2b]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">Exercices automatiques</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#594567]">
            Les quiz, les choix et les textes à trous sont créés automatiquement à partir du kural et des autres kurals. Ils changent à chaque nouvelle partie.
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-3 border-t-[3px] border-[#180d2b] p-5 sm:flex-row sm:items-center sm:p-6">
        <button disabled={pending} className="rounded-full border-[3px] border-[#180d2b] bg-[#20bf73] px-6 py-3 text-sm font-black text-white shadow-[4px_5px_0_#180d2b] disabled:opacity-60">
          Save Thirukkural
        </button>
        {state.message ? <p className={`text-sm font-black ${state.ok ? "text-[#127a55]" : "text-[#be123c]"}`}>{state.message}</p> : null}
      </div>
    </form>
  );
}
