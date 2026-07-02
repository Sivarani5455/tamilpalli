"use client";

import { useActionState, useRef } from "react";

import { importDictionaryCsvAction } from "@/app/[locale]/admin/content-actions";
import { initialCrudState } from "@/lib/action-states";
import type { Locale } from "@/types";

const CSV_HEADERS = "english_word, slug, type, example, tamil_main_word, french_word, tamil_synonyms, tamil_description, image_url";

export function DictionaryCsvImportForm({ locale }: { locale: Locale }) {
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, action, pending] = useActionState(importDictionaryCsvAction, initialCrudState);

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        await action(formData);
        formRef.current?.reset();
      }}
      className="mt-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.25)]"
    >
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-indigo-600">Import CSV</p>
          <h2 className="mt-2 font-display text-3xl text-slate-950">Ajouter plusieurs mots</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Le fichier doit utiliser exactement ces colonnes, dans cet ordre, pour eviter les erreurs.
          </p>
          <code className="mt-4 block overflow-x-auto rounded-2xl bg-slate-950 px-4 py-3 text-xs leading-6 text-slate-100">
            {CSV_HEADERS}
          </code>
        </div>

        <div className="w-full shrink-0 space-y-3 lg:w-[20rem]">
          <label className="block rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-sm text-slate-600">
            <span className="font-semibold text-slate-950">Choisir un CSV</span>
            <input name="csvFile" type="file" accept=".csv,text/csv" className="mt-3 w-full text-sm" />
          </label>

          <button
            disabled={pending}
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {pending ? "Import en cours..." : "Importer le CSV"}
          </button>

          {state.message ? (
            <p className={`text-sm leading-6 ${state.ok ? "text-emerald-700" : "text-rose-600"}`}>
              {state.message}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
