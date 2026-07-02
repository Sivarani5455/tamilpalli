"use client";

import { useActionState, useState } from "react";

import { upsertDictionaryAction } from "@/app/[locale]/admin/content-actions";
import { initialCrudState } from "@/lib/action-states";
import type { DictionaryEntry, Locale } from "@/types";

const DICTIONARY_TYPE_OPTIONS = [
  { value: "பெயர்ச்சொல்", label: "பெயர்ச்சொல் • Nom / Noun" },
  { value: "வினைச்சொல்", label: "வினைச்சொல் • Verbe / Verb" },
  { value: "பெயரடை", label: "பெயரடை • Adjectif / Adjective" },
  { value: "வினையடை", label: "வினையடை • Adverbe / Adverb" },
  { value: "இடச்சொல்", label: "இடச்சொல் • Préposition / Link word" },
  { value: "சுட்டுப்பெயர்", label: "சுட்டுப்பெயர் • Pronom / Pronoun" },
] as const;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function StatusMessage({ message, ok }: { message: string; ok: boolean }) {
  if (!message) {
    return null;
  }

  return <p className={`text-sm ${ok ? "text-emerald-700" : "text-rose-600"}`}>{message}</p>;
}

export function DictionaryAdminForm({
  locale,
  initial,
}: {
  locale: Locale;
  initial?: DictionaryEntry | null;
}) {
  const [state, action, pending] = useActionState(upsertDictionaryAction, initialCrudState);
  const [wordEn, setWordEn] = useState(initial?.translations.en?.word ?? "");
  const [wordTa, setWordTa] = useState(initial?.translations.ta?.word ?? "");
  const [wordFr, setWordFr] = useState(initial?.translations.fr?.word ?? "");
  const [entryType, setEntryType] = useState(initial?.type ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [tamilSynonyms, setTamilSynonyms] = useState(initial?.tamilSynonyms.join("\n") ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));

  return (
    <form
      action={action}
      className="mt-6 w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]"
    >
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="id" defaultValue={initial?.id} />

      <section className="min-w-0 px-4 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-5xl space-y-7">
          <div className="rounded-[1.5rem] bg-slate-950 px-6 py-6 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">Dictionary</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em]">
              {initial ? "Edit dictionary entry" : "New dictionary entry"}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              Add one concept entry, then attach the main Tamil word and optional Tamil synonyms that share the
              same meaning.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">English word</span>
              <input
                name="wordEn"
                value={wordEn}
                onChange={(event) => {
                  const nextValue = event.target.value;
                  setWordEn(nextValue);

                  if (!slugTouched) {
                    setSlug(slugify(nextValue));
                  }
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="chair"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Slug</span>
              <input
                name="slug"
                value={slug}
                onChange={(event) => {
                  setSlugTouched(true);
                  setSlug(slugify(event.target.value));
                }}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="chair"
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Type</span>
              <select
                name="type"
                value={entryType}
                onChange={(event) => setEntryType(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              >
                <option value="">Select a type</option>
                {DICTIONARY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Example</span>
              <input
                name="example"
                value={example}
                onChange={(event) => setExample(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="I sit on a chair."
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Tamil main word</span>
              <input
                name="wordTa"
                value={wordTa}
                onChange={(event) => setWordTa(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="நாற்காலி"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">French word</span>
              <input
                name="wordFr"
                value={wordFr}
                onChange={(event) => setWordFr(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
                placeholder="chaise"
              />
            </label>
          </div>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Tamil synonyms</span>
            <textarea
              name="tamilSynonyms"
              value={tamilSynonyms}
              onChange={(event) => setTamilSynonyms(event.target.value)}
              className="min-h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder={"கதிரை\nஅமர்வு நாற்காலி"}
            />
            <p className="text-xs text-slate-500">One synonym per line, or separate with commas.</p>
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Tamil description</span>
            <textarea
              name="descriptionTa"
              defaultValue={initial?.translations.ta?.description ?? ""}
              className="min-h-32 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="இந்த சொல்லின் தமிழ் விளக்கத்தை இங்கே எழுதுங்கள்."
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Image URL</span>
            <input
              name="imageUrl"
              defaultValue={initial?.imageUrl ?? ""}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-950 shadow-sm outline-none transition focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100"
              placeholder="https://..."
            />
          </label>

          <div className="grid gap-4 rounded-[1.25rem] border border-slate-200 bg-slate-50 p-5 md:grid-cols-3 xl:grid-cols-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">English</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{wordEn || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Tamil</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{wordTa || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Tamil synonyms</div>
              <div className="mt-2 text-lg font-semibold text-slate-950 whitespace-pre-line">{tamilSynonyms || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">French</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{wordFr || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Type</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{entryType || "—"}</div>
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Example</div>
              <div className="mt-2 text-lg font-semibold text-slate-950">{example || "—"}</div>
            </div>
          </div>

          <div className="pt-1">
            <button
              disabled={pending}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {initial ? "Save entry" : "Create entry"}
            </button>
          </div>

          <StatusMessage message={state.message} ok={state.ok} />
        </div>
      </section>
    </form>
  );
}
