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
      className="mt-8 rounded-[1.25rem] border-[3px] border-[#180d2b] bg-white p-5 shadow-[6px_7px_0_#180d2b]"
    >
      <input type="hidden" name="locale" value={locale} />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#7c3aed]">Import CSV</p>
          <h2 className="mt-1 font-display text-3xl font-black text-[#180d2b]">Ajouter plusieurs mots</h2>
          <p className="mt-3 text-sm font-semibold leading-7 text-[#8a6a9c]">
            Le fichier doit utiliser exactement ces colonnes, dans cet ordre, pour eviter les erreurs.
          </p>
          <code className="mt-4 block overflow-x-auto rounded-[1rem] border-[2px] border-[#180d2b] bg-[#1b0d2f] px-4 py-3 text-xs font-bold leading-6 text-white shadow-[3px_4px_0_#180d2b]">
            {CSV_HEADERS}
          </code>
        </div>

        <div className="w-full shrink-0 space-y-3 lg:w-[20rem]">
          <label className="block rounded-[1rem] border-[3px] border-dashed border-[#180d2b] bg-[#fff7ed] px-4 py-5 text-center text-sm font-semibold text-[#8a6a9c]">
            <span className="font-black text-[#180d2b]">Choisir un CSV</span>
            <input
              name="csvFile"
              type="file"
              accept=".csv,text/csv"
              className="mt-3 w-full text-sm font-semibold file:mr-3 file:rounded-full file:border-[2px] file:border-[#180d2b] file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:text-[#180d2b]"
            />
          </label>

          <button
            disabled={pending}
            className="w-full rounded-full border-[3px] border-[#180d2b] bg-[#20bf73] px-5 py-3 text-sm font-black text-white shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {pending ? "Import en cours..." : "Importer le CSV"}
          </button>

          {state.message ? (
            <p
              className={`rounded-[1rem] border-[2px] px-4 py-3 text-sm font-black leading-6 ${
                state.ok
                  ? "border-[#14b86a] bg-[#dcfce7] text-[#047857]"
                  : "border-[#ff3b6f] bg-[#ffe4ee] text-[#be123c]"
              }`}
            >
              {state.message}
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
}
