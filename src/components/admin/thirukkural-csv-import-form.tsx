"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { importThirukkuralCsvAction } from "@/app/[locale]/admin/content-actions";
import { initialCrudState } from "@/lib/action-states";
import type { Locale } from "@/types";

const CSV_HEADERS = "number,title,section,chapter,difficulty,line_1,line_2,porul";
const CSV_TEMPLATE = `${CSV_HEADERS}\n1,முதல் குறள்,அறத்துப்பால்,கடவுள் வாழ்த்து,beginner,அகர முதல எழுத்தெல்லாம் ஆதி,பகவன் முதற்றே உலகு.,எழுத்துகளுக்கு அகரம் முதன்மை போல உலகிற்கு இறைவன் முதன்மை`;

export function ThirukkuralCsvImportForm({ locale }: { locale: Locale }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [state, action, pending] = useActionState(importThirukkuralCsvAction, initialCrudState);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      router.refresh();
    }
  }, [router, state.ok]);

  return (
    <form
      ref={formRef}
      action={action}
      className="mt-6 overflow-hidden rounded-[1.5rem] border-[3px] border-[#180d2b] bg-white shadow-[7px_8px_0_#180d2b]"
    >
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0">
          <span className="inline-flex rounded-full border-[2px] border-[#180d2b] bg-[#c6ff2e] px-3 py-1 text-[0.68rem] font-black uppercase tracking-[0.16em] text-[#180d2b] shadow-[2px_3px_0_#180d2b]">
            Import en masse
          </span>
          <h2 className="mt-4 font-display text-[clamp(1.6rem,4vw,2.2rem)] font-black leading-tight text-[#180d2b]">
            Importer les 1 330 kurals
          </h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#765f86]">
            Une ligne correspond à un kural. Un nouvel import met à jour les numéros déjà présents et ajoute les autres.
            Le titre peut rester vide. Les quiz et les textes à trous sont générés automatiquement à chaque partie.
          </p>

          <code className="mt-4 block overflow-x-auto rounded-[1rem] border-[2px] border-[#180d2b] bg-[#180d2b] px-4 py-3 text-xs font-bold leading-6 text-white">
            {CSV_HEADERS}
          </code>

          <p className="mt-4 rounded-[0.85rem] bg-[#f1e9ff] p-3 text-xs font-semibold leading-6 text-[#765f86]">
            Les mauvaises réponses sont prises dans les autres kurals et les mots masqués changent automatiquement. Place entre guillemets toute cellule CSV contenant une virgule.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3">
          <label className="block rounded-[1rem] border-[3px] border-dashed border-[#180d2b] bg-[#fff8ec] px-4 py-5 text-center text-sm font-semibold text-[#765f86]">
            <span className="block font-black text-[#180d2b]">Choisir le fichier CSV</span>
            <input
              name="csvFile"
              type="file"
              accept=".csv,text/csv"
              required
              className="mt-3 w-full text-xs font-semibold file:mr-2 file:rounded-full file:border-[2px] file:border-[#180d2b] file:bg-white file:px-3 file:py-2 file:text-xs file:font-black file:text-[#180d2b]"
            />
          </label>

          <button
            disabled={pending}
            className="w-full rounded-full border-[3px] border-[#180d2b] bg-[#20bf73] px-5 py-3 text-sm font-black text-white shadow-[4px_5px_0_#180d2b] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? "Import en cours..." : "Importer les kurals"}
          </button>

          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(CSV_TEMPLATE)}`}
            download="modele-thirukkural.csv"
            className="w-full rounded-full border-[3px] border-[#180d2b] bg-white px-5 py-3 text-center text-sm font-black text-[#180d2b] transition hover:bg-[#f1e9ff]"
          >
            Télécharger le modèle CSV
          </a>

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
